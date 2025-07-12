import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import api from '../../api/axiosConfig';
import { fontPixel } from '../../helper';
import StyledText from '../components/StyledText';

const ProductCard = ({ item, navigation }) => {
    const formatPrice = (price) => {
        return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
    };

    const hasDiscount = item.discountPrice != null;
    const imageSource = item.imageUrl ? { uri: item.imageUrl } : require('../../assets/images/no-image.jpg');

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => {
                navigation.navigate('ProductDetail', { productId: item.id, productType: item.type });
            }}
        >
            <View style={styles.cardTextContainer}>
                <StyledText fontType="montserrat" style={styles.cardTitle}>{item.name}</StyledText>
                <StyledText
                    style={styles.cardDescription}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                >
                    {item.description}
                </StyledText>
                <View style={styles.priceContainer}>
                    {hasDiscount ? (
                        <>
                            <StyledText style={styles.discountPriceText}>
                                {formatPrice(item.discountPrice)}
                            </StyledText>
                            <StyledText style={styles.originalPriceText}>
                                {formatPrice(item.price)}
                            </StyledText>
                        </>
                    ) : (
                        <StyledText style={styles.priceText}>
                            {formatPrice(item.price)}
                        </StyledText>
                    )}
                </View>
            </View>
            <Image source={imageSource} style={styles.cardImage} />
        </TouchableOpacity>
    );
};


// --- Komponen Utama ProductsScreen ---
const ProductsScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortOrder, setSortOrder] = useState('low_to_high');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await api.get('/api/v1/test-packages');
                const allItems = response.data.data;

                setProducts(allItems);
                setFilteredProducts(allItems);

            } catch (error) {
                console.log("Gagal mengambil data Try out:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Gagal',
                    text2: 'Tidak dapat memuat data Try out.',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPackages();
    }, []); // Dependensi kosong agar hanya berjalan sekali saat mount

    const getEffectivePrice = (item) => {
        return item.discountPrice != null ? item.discountPrice : item.price;
    };

    useEffect(() => {
        let result = [...products];

        if (searchQuery) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (activeFilter !== 'all') {
            result = result.filter(product => product.type === activeFilter);
        }

        if (sortOrder === 'low_to_high') {
            result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        } else if (sortOrder === 'high_to_low') {
            result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
        }

        setFilteredProducts(result);
    }, [products, searchQuery, activeFilter, sortOrder]);
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
                <StyledText style={styles.headerTitle}>Try Out</StyledText>
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
                                placeholder="Search"
                                placeholderTextColor={COLORS.gray}
                                style={styles.searchInput}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <View style={styles.filterButtons}>
                            <TouchableOpacity
                                style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
                                onPress={() => setActiveFilter('all')}
                            >
                                <StyledText style={[styles.filterButtonText, activeFilter === 'all' && styles.activeFilterButtonText]}>All</StyledText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterButton, activeFilter === 'package' && styles.activeFilterButton]}
                                onPress={() => setActiveFilter('package')}
                            >
                                <StyledText style={[styles.filterButtonText, activeFilter === 'package' && styles.activeFilterButtonText]}>Package</StyledText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterButton, activeFilter === 'bundle' && styles.activeFilterButton]}
                                onPress={() => setActiveFilter('bundle')}
                            >
                                <StyledText style={[styles.filterButtonText, activeFilter === 'bundle' && styles.activeFilterButtonText]}>Bundle</StyledText>
                            </TouchableOpacity>
                        </View>
                        <StyledText style={styles.controlLabel}>Sort by Price</StyledText>
                        <View style={styles.filterButtons}>
                            <TouchableOpacity
                                style={[styles.filterButton, sortOrder === 'low_to_high' && styles.activeFilterButton]}
                                onPress={() => setSortOrder('low_to_high')}
                            >
                                <StyledText style={[styles.filterButtonText, sortOrder === 'low_to_high' && styles.activeFilterButtonText]}>Termurah</StyledText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterButton, sortOrder === 'high_to_low' && styles.activeFilterButton]}
                                onPress={() => setSortOrder('high_to_low')}
                            >
                                <StyledText style={[styles.filterButtonText, sortOrder === 'high_to_low' && styles.activeFilterButtonText]}>Termahal</StyledText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Daftar Try out */}
                    {/* <View style={styles.section}>
                        {products.map(item => <ProductCard key={item.id} item={item} navigation={navigation} />)}
                    </View> */}
                    <View style={styles.section}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(item => <ProductCard key={item.id} item={item} navigation={navigation} />)
                        ) : (
                            <StyledText style={styles.noResultsText}>No products found.</StyledText>
                        )}
                    </View>
                </ScrollView>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
    header: { paddingVertical: 15, paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.borderColor, },
    headerTitle: { fontSize: fontPixel(20), fontWeight: 'bold', },
    scrollView: { flex: 1, },
    controlsContainer: { padding: 20, },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 10, marginBottom: 15, },
    searchIcon: { marginRight: 10, },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: fontPixel(16), },
    filterButtons: { flexDirection: 'row', },
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 10, },
    section: { marginBottom: 20, },
    sectionTitle: { fontSize: fontPixel(22), fontWeight: 'bold', marginBottom: 10, paddingHorizontal: 20, },
    cardContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, },
    cardTextContainer: { flex: 1, marginRight: 15, },
    cardTitle: { fontSize: fontPixel(16), fontWeight: 'bold', marginBottom: 5, },
    cardDescription: { fontSize: fontPixel(14), color: COLORS.gray, marginBottom: 12, },
    priceText: { fontWeight: 'bold', color: COLORS.text, },
    cardImage: { width: 100, height: 100, borderRadius: 10, backgroundColor: '#e0e0e0', },
    activeFilterButton: { backgroundColor: COLORS.primary, },
    filterButtonText: { color: COLORS.text, fontWeight: '500', },
    activeFilterButtonText: { color: COLORS.white, },
    noResultsText: { textAlign: 'center', marginTop: 40, color: COLORS.gray, fontSize: fontPixel(16), },
    filterButtons: { flexDirection: 'row', marginBottom: 15, },
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginRight: 10, },
    priceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, },
    priceText: { fontWeight: 'bold', color: COLORS.primary, fontSize: fontPixel(16), },
    discountPriceText: { fontWeight: 'bold', color: COLORS.primary, fontSize: fontPixel(16), marginRight: 8, },
    originalPriceText: { color: COLORS.gray, textDecorationLine: 'line-through', fontSize: fontPixel(14), },
    controlLabel: { fontSize: fontPixel(14), fontWeight: '600', color: COLORS.gray, marginBottom: 8, marginTop: 10, },
});

export default ProductsScreen;
