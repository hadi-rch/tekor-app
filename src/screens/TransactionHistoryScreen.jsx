import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const allTransactions = [
    {
        id: '1',
        status: 'success',
        title: 'Korean Language Course',
        price: '$49.99',
        date: '05/15/2024',
        image: require('../../assets/images/no-image.jpg')
    },
    {
        id: '2',
        status: 'pending',
        title: 'Korean Culture Workshop',
        price: '$29.99',
        date: '05/10/2024',
        image: require('../../assets/images/no-image.jpg')
    },
    {
        id: '3',
        status: 'success',
        title: 'Korean Language Course',
        price: '$49.99',
        date: '04/20/2024',
        image: require('../../assets/images/no-image.jpg')
    },
    {
        id: '4',
        status: 'success',
        title: 'Korean Language Course',
        price: '$49.99',
        date: '03/15/2024',
        image: require('../../assets/images/no-image.jpg')
    },
    {
        id: '5',
        status: 'success',
        title: 'Korean Language Course',
        price: '$49.99',
        date: '02/15/2024',
        image: require('../../assets/images/no-image.jpg')
    },
];

// --- Komponen untuk setiap item dalam daftar ---
const TransactionItem = ({ item }) => {
    const isSuccess = item.status === 'success';
    return (
        <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemDetails}>
                <Text style={[styles.itemStatus, { color: isSuccess ? '#28a745' : '#ffc107' }]}>
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
    const [activeTab, setActiveTab] = useState('All'); // All, Completed, Pending

    // Memfilter transaksi berdasarkan tab yang aktif
    const filteredTransactions = useMemo(() => {
        if (activeTab === 'Completed') {
            return allTransactions.filter(item => item.status === 'success');
        }
        if (activeTab === 'Pending') {
            return allTransactions.filter(item => item.status === 'pending');
        }
        return allTransactions;
    }, [activeTab]);

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            {/* Header Kustom */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tab Switcher */}
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

            {/* Daftar Transaksi */}
            <FlatList
                data={filteredTransactions}
                renderItem={({ item }) => <TransactionItem item={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text>Tidak ada transaksi.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.text,
    },
    tabText: {
        fontSize: 16,
        color: COLORS.gray,
    },
    activeTabText: {
        color: COLORS.text,
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
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    itemDetails: {
        flex: 1,
        marginRight: 15,
    },
    itemStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 14,
        color: COLORS.gray,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    emptyContainer: {
        flex: 1,
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default TransactionHistoryScreen;
