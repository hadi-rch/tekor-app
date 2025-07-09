import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal } from '../../helper';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import CustomButton from '../components/CustomButton';
import api from '../../api/axiosConfig';

// --- Komponen Utama ProductDetailScreen ---
const ProductDetailScreen = ({ navigation, route }) => {
    const { productId, productType } = route.params;
    const insets = useSafeAreaInsets(); // Untuk padding bawah yang aman

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuying, setIsBuying] = useState(false);

    console.log("type :", productType)

    useEffect(() => {
        if (!productId) {
            Alert.alert("Error", "ID Produk tidak ditemukan.");
            navigation.goBack();
            return;
        }

        const fetchProductDetail = async () => {
            try {
                if (productType == "package") {
                    // console.log("had package");
                    const response = await api.get(`/api/v1/test-packages/${productId}`);
                    // console.log("hadi pkg");
                    setProduct(response.data.data);
                } else {
                    // console.log("had bundles");
                    const response = await api.get(`/api/v1/bundles/${productId}`);
                    // console.log("hadi bdls");
                    setProduct(response.data.data);
                }
            } catch (error) {
                console.error("Gagal mengambil detail produk:", error);
                Alert.alert("Error", "Tidak dapat memuat detail produk.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetail();
    }, [productId]);

    // Fungsi untuk menangani pembelian
    const handleBuyPress = async () => {
        setIsBuying(true);
        try {
            let requestBody;

            if (productType === "package") {
                requestBody = {
                    testPackageId: productId,
                    quantity: 1,
                };
            } else {
                requestBody = {
                    bundleId: productId,
                    quantity: 1,
                };
            }
            console.log("requestBody : ", requestBody)
            const response = await api.post('/api/v1/transactions/create', requestBody);
            console.log("responses : ", response)
            const redirectUrl = response.data.data?.redirectUrl;

            if (redirectUrl) {
                // Buka halaman pembayaran Midtrans di dalam aplikasi
                await WebBrowser.openBrowserAsync(redirectUrl);
                // Setelah browser ditutup, arahkan pengguna ke riwayat transaksi
                navigation.navigate('TransactionHistory');
            } else {
                Alert.alert("Error", "Gagal mendapatkan link pembayaran.");
            }

        } catch (error) {
            console.error("Gagal membuat transaksi:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.message || "Gagal memulai transaksi. Silakan coba lagi.");
        } finally {
            setIsBuying(false);
        }
    };

    const formatPrice = (price) => {
        if (typeof price !== 'number') return 'Rp 0';
        return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.loaderContainer}>
                <Text>Produk tidak ditemukan.</Text>
            </View>
        );
    }

    const imageSource = product.imageUrl
        ? { uri: product.imageUrl }
        : require('../../assets/images/no-image.jpg');

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={fontPixel(24)} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Produk</Text>
                <View style={{ width: fontPixel(24) }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Image source={imageSource} style={styles.productImage} />
                <View style={styles.detailsContainer}>
                    <Text style={styles.productTitle}>{product.name}</Text>
                    <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>Product Description</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* 4. Perbarui tombol Beli */}
            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : pixelSizeVertical(20) }]}>
                <CustomButton
                    title={isBuying ? "Memproses..." : "Beli"}
                    onPress={handleBuyPress}
                    disabled={isBuying}
                    style={{ backgroundColor: COLORS.primary }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
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
    },
    headerButton: {
        padding: pixelSizeHorizontal(5),
    },
    headerTitle: {
        fontSize: fontPixel(20),
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingBottom: heightPixel(120),
    },
    productImage: {
        width: '100%',
        height: heightPixel(300),
        resizeMode: 'cover',
        backgroundColor: '#f0f0f0',
    },
    detailsContainer: {
        padding: pixelSizeHorizontal(20),
    },
    productTitle: {
        fontSize: fontPixel(24),
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: pixelSizeVertical(8),
    },
    productPrice: {
        fontSize: fontPixel(18),
        color: COLORS.text,
        marginBottom: pixelSizeVertical(20),
    },
    descriptionSection: {
        marginTop: pixelSizeVertical(10),
    },
    sectionTitle: {
        fontSize: fontPixel(18),
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: pixelSizeVertical(10),
    },
    descriptionText: {
        fontSize: fontPixel(16),
        color: COLORS.text,
        lineHeight: fontPixel(24),
    },
    footer: {
        paddingHorizontal: pixelSizeHorizontal(20),
        paddingTop: pixelSizeVertical(10),
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    }
});

export default ProductDetailScreen;
