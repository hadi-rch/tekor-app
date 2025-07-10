import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    Alert,
    Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal } from '../../helper';
import api from '../../api/axiosConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Komponen untuk Badge Status ---
const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
        switch (status.toLowerCase()) {
            case 'success':
            case 'settlement':
                return { backgroundColor: '#d4edda', color: '#155724' }; // Hijau
            case 'pending':
                return { backgroundColor: '#fff3cd', color: '#856404' }; // Kuning
            case 'failure':
            case 'expire':
                return { backgroundColor: '#f8d7da', color: '#721c24' }; // Merah
            default:
                return { backgroundColor: '#e2e3e5', color: '#383d41' }; // Abu-abu
        }
    };
    const style = getStatusStyle();
    return (
        <View style={[styles.badgeContainer, { backgroundColor: style.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: style.color }]}>{status}</Text>
        </View>
    );
};

const DetailRow = ({ label, value, canCopy = false }) => {
    const handleCopy = () => {
        Clipboard.setString(value);
        Alert.alert("Disalin", `${label} telah disalin ke clipboard.`);
    };

    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValue}>{value}</Text>
                {canCopy && (
                    <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
                        <Ionicons name="copy-outline" size={fontPixel(20)} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};


const TransactionDetailScreen = ({ navigation, route }) => {
    const { orderId } = route.params;
    const [transaction, setTransaction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!orderId) {
            Alert.alert("Error", "ID Pesanan tidak ditemukan.");
            navigation.goBack();
            return;
        }

        const fetchTransactionDetail = async () => {
            try {
                const response = await api.get(`/api/v1/transactions/status/${orderId}`);
                setTransaction(response.data);
            } catch (error) {
                console.error("Gagal mengambil detail transaksi:", error);
                Alert.alert("Error", "Tidak dapat memuat detail transaksi.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactionDetail();
    }, [orderId]);

    const formatPrice = (price) => {
        if (typeof price !== 'number') return 'Rp 0';
        return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!transaction) {
        return (
            <View style={styles.loaderContainer}>
                <Text>Transaksi tidak ditemukan.</Text>
            </View>
        );
    }

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={fontPixel(24)} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Transaksi</Text>
                <View style={{ width: fontPixel(24) }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>Status Transaksi</Text>
                    <StatusBadge status={transaction.transactionStatus} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rincian Pesanan</Text>
                    <View style={styles.card}>
                        <DetailRow label={transaction.packageName || 'Try out'} value={formatPrice(transaction.amount)} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detail Transaksi</Text>
                    <View style={styles.card}>
                        <DetailRow label="Order ID" value={transaction.orderId} canCopy />
                        <DetailRow label="Waktu Transaksi" value={formatDate(transaction.createdAt)} />
                    </View>
                </View>
            </ScrollView>

        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#F7F8FA',
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
    headerButton: {
        padding: pixelSizeHorizontal(5),
    },
    headerTitle: {
        fontSize: fontPixel(20),
        fontWeight: 'bold',
    },
    scrollContainer: {
        padding: pixelSizeHorizontal(20),
    },
    statusSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: pixelSizeVertical(25),
    },
    section: {
        marginBottom: pixelSizeVertical(25),
    },
    sectionTitle: {
        fontSize: fontPixel(18),
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: pixelSizeVertical(12),
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: pixelSizeHorizontal(15),
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    badgeContainer: {
        borderRadius: 20,
        paddingVertical: pixelSizeVertical(6),
        paddingHorizontal: pixelSizeHorizontal(12),
    },
    badgeText: {
        fontSize: fontPixel(12),
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    // PERBAIKAN STYLE DI SINI
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: pixelSizeVertical(15),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: fontPixel(16),
        color: COLORS.gray,
    },
    valueContainer: {
        flex: 1, // Memastikan container ini mengambil sisa ruang
        flexDirection: 'row',
        justifyContent: 'flex-end', // Mendorong konten ke kanan
        alignItems: 'center',
    },
    detailValue: {
        fontSize: fontPixel(16),
        color: COLORS.text,
        fontWeight: '500',
        flexShrink: 1, // Mengizinkan teks untuk menyusut dan membungkus (wrap)
        textAlign: 'right', // Membuat teks rata kanan
    },
    copyButton: {
        marginLeft: pixelSizeHorizontal(10), // Memberi jarak dari teks
        padding: 5,
    },
});

export default TransactionDetailScreen;