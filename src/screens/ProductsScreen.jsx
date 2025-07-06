import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import api from '../../api/axiosConfig';
import { fontPixel } from '../../helper';
import StyledText from '../components/StyledText';

const ProductCard = ({ item, navigation }) => {
    // Fungsi untuk memformat harga
    const formatPrice = (price) => {
        return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
    };

    const imageSource = item.imageUrl
        ? { uri: item.imageUrl }
        : require('../../assets/images/no-image.jpg');

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => {
                if (item.type === 'package') {
                    navigation.navigate('ProductDetail', { productId: item.id });
                }
            }}
        >
            <View style={styles.cardTextContainer}>
                <StyledText style={styles.cardTitle}>{item.name}</StyledText>
                <StyledText style={styles.cardDescription}>{item.description}</StyledText>
                {item.type === 'package' ? (
                    <View style={styles.priceTag}>
                        <StyledText style={styles.priceText}>{formatPrice(item.price)}</StyledText>
                    </View>
                ) : (
                    <View style={styles.playButton}>
                        <StyledText style={styles.playButtonText}>Play</StyledText>
                    </View>
                )}
            </View>
            <Image source={imageSource} style={styles.cardImage} />
        </TouchableOpacity>
    );
};


// --- Komponen Utama ProductsScreen ---
const ProductsScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await api.get('/api/v1/test-packages');
                const allItems = response.data.data;

                // Filter item berdasarkan tipe
                const productItems = allItems.filter(item => item.type === 'package');

                setProducts(productItems);

            } catch (error) {
                console.error("Gagal mengambil data produk:", error);
                Alert.alert("Error", "Tidak dapat memuat data produk.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPackages();
    }, []); // Dependensi kosong agar hanya berjalan sekali saat mount

    return (
        <LinearGradient
            colors={['#E6ECF5', '#FDEAEB']}
            style={styles.screenContainer}
        >
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <View style={styles.header}>
                <StyledText style={styles.headerTitle}>Products</StyledText>
            </View>

            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    <View style={styles.controlsContainer}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
                            <TextInput
                                placeholder="Search products"
                                placeholderTextColor={COLORS.gray}
                                style={styles.searchInput}
                            />
                        </View>
                        <View style={styles.filterButtons}>
                            <TouchableOpacity style={styles.filterButton}>
                                <Text>Sort</Text>
                                <Ionicons name="chevron-down" size={16} color={COLORS.gray} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.filterButton}>
                                <StyledText>Filter</StyledText>
                                <Ionicons name="options" size={16} color={COLORS.gray} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Daftar Produk */}
                    <View style={styles.section}>
                        {products.map(item => <ProductCard key={item.id} item={item} navigation={navigation} />)}
                    </View>
                </ScrollView>
            )}
        </LinearGradient>
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
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerTitle: {
        fontSize: fontPixel(20),
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    controlsContainer: {
        padding: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: fontPixel(16),
    },
    filterButtons: {
        flexDirection: 'row',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: fontPixel(22),
        fontWeight: 'bold',
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 20,
        marginBottom: 15,
    },
    cardTextContainer: {
        flex: 1,
        marginRight: 15,
    },
    cardTitle: {
        fontSize: fontPixel(16),
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardDescription: {
        fontSize: fontPixel(14),
        color: COLORS.gray,
        marginBottom: 12,
    },
    priceTag: {
        backgroundColor: '#EAEAEA',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
    },
    priceText: {
        fontWeight: 'bold',
        color: COLORS.text,
    },
    playButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignSelf: 'flex-start',
    },
    playButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
    },
});

export default ProductsScreen;
