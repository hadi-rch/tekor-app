import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/axiosConfig';
import { fontPixel, pixelSizeHorizontal, pixelSizeVertical } from '../../helper';

const TransactionItem = ({ item, navigation }) => {
    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'success':
            case 'settlement':
                return { color: '#28a745' }; 
            case 'pending':
                return { color: '#ffc107' };
            case 'failure':
            case 'expire':
                return { color: '#dc3545' }; 
            default:
                return { color: COLORS.gray };
        }
    };

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('TransactionDetail', { orderId: item.id })}>
            <View style={styles.itemDetails}>
                <Text style={[styles.itemStatus, getStatusStyle(item.status)]}>
                    {item.status}
                </Text>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>{`${item.price} • ${item.date}`}</Text>
            </View>
            <Image source={item.image} style={styles.itemImage} />
        </TouchableOpacity>
    );
};

// --- Komponen Utama TransactionHistoryScreen ---
const TransactionHistoryScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('All');
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 4. useEffect untuk mengambil data dari backend
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/api/v1/transactions/history');
                const backendData = response.data.data;

                // Transformasi data dari backend ke format yang dibutuhkan UI
                const formattedData = backendData.map(tx => ({
                    id: tx.orderId,
                    status: tx.transactionStatus.toLowerCase(),
                    title: tx.packageName || tx.bundleName || 'Produk Tidak Dikenal',
                    price: `Rp ${new Intl.NumberFormat('id-ID').format(tx.amount)}`,
                    date: new Date(tx.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'long', year: 'numeric'
                    }),
                    image: require('../../assets/images/no-image.jpg')
                }));

                setTransactions(formattedData);
            } catch (error) {
                console.error("Gagal mengambil riwayat transaksi:", error);
                Alert.alert("Error", "Tidak dapat memuat riwayat transaksi.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Memfilter transaksi berdasarkan tab yang aktif
    const filteredTransactions = useMemo(() => {
        if (activeTab === 'Completed') {
            return transactions.filter(item => item.status === 'success' || item.status === 'settlement');
        }
        if (activeTab === 'Pending') {
            return transactions.filter(item => item.status === 'pending');
        }
        return transactions;
    }, [activeTab, transactions]);

    return (
        <LinearGradient
            colors={['#FFFFFF', '#F7F8FA']}
            style={styles.screenContainer}
        >
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={fontPixel(24)} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
                <View style={{ width: fontPixel(24) }} />
            </View>

            <View style={styles.tabContainer}>
                {['All', 'Completed', 'Pending'].map((tabName) => (
                    <TouchableOpacity
                        key={tabName}
                        style={[styles.tab, activeTab === tabName && styles.activeTab]}
                        onPress={() => setActiveTab(tabName)}
                    >
                        <Text style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>
                            {tabName}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredTransactions}
                    renderItem={({ item }) => <TransactionItem item={item} navigation={navigation}/>}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text>Tidak ada transaksi pada kategori ini.</Text>
                        </View>
                    }
                />
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: pixelSizeVertical(15),
        paddingHorizontal: pixelSizeHorizontal(20),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: fontPixel(20),
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: fontPixel(16),
        color: COLORS.gray,
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingVertical: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        marginHorizontal: 15,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemDetails: {
        flex: 1,
        marginRight: 15,
    },
    itemStatus: {
        fontSize: fontPixel(12),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: fontPixel(16),
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: fontPixel(14),
        color: COLORS.gray,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    emptyContainer: {
        flex: 1,
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default TransactionHistoryScreen;
