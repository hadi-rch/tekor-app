import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, FlatList, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import CustomButton from '../components/CustomButton';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { LinearGradient } from 'expo-linear-gradient';
import StyledText from '../components/StyledText';
import api from '../../api/axiosConfig';

const ProductCard = ({ item, navigation }) => (
    <TouchableOpacity
        style={styles.productCard}
        onPress={() => {
            navigation.navigate('ProductDetail', { productId: item.id, productType: item.type });
        }}
    >
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        <StyledText style={styles.productTitle} numberOfLines={1}>{item.name}</StyledText>
        <StyledText
            fontType="montserrat"
            style={styles.productDescription}
            numberOfLines={4}
            ellipsizeMode="tail"
        >
            {item.description}
        </StyledText>
    </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
    const [specialOffer, setSpecialOffer] = useState(null);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHomePageData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/v1/test-packages');
                const allData = response.data.data;

                const offerData = allData.find(item => item.name === "Paket Hemat A & B");
                setSpecialOffer(offerData);

                const prodUnggulan = allData.filter(item => item.type === "package");
                setFeaturedProducts(prodUnggulan);

            } catch (e) {
                console.log("API Error:", e);
                setError('Gagal memuat data. Coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        };

        fetchHomePageData();
    }, []);

    return (
        <LinearGradient
            colors={['#FDEAEB', '#E6ECF5']}
            style={styles.screenContainer}
        >
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <ScrollView style={styles.scrollView}>
                {/* 1. Hero Section */}
                <View style={styles.heroSection}>
                    <Image
                        source={require('../../assets/images/logo-new.png')}
                        style={styles.heroLogo}
                    />
                    <Text style={styles.heroSubtitle}>Ukur kemampuan bahasa Koreamu dengan tes terstandarisasi.</Text>
                    <CustomButton
                        title="Mulai Tes Sekarang!"
                        onPress={() => navigation.navigate('DummyTest')}
                        style={{ backgroundColor: COLORS.primary }}
                    />
                </View>

                {/* 2. Penawaran Spesial */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Penawaran Spesial</Text>
                    {loading && (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginHorizontal: 20 }} />
                    )}
                    {error && !loading && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}
                    {specialOffer && !loading && (
                        <View style={styles.specialOfferCard}>
                            <View style={styles.specialOfferText}>
                                <StyledText fontType="montserrat" style={styles.specialOfferTitle}>{specialOffer.name}</StyledText>
                                <StyledText
                                    fontType="montserrat"
                                    style={styles.specialOfferDesc}
                                    numberOfLines={3}
                                    ellipsizeMode="tail"
                                >
                                    {specialOffer.description}
                                </StyledText>
                                <TouchableOpacity
                                    style={styles.buyNowButton}
                                    onPress={() => {
                                        navigation.navigate('ProductDetail', { productId: specialOffer.id, productType: specialOffer.type });
                                    }}
                                >
                                    <Text style={styles.buyNowText}>Beli Sekarang</Text>
                                </TouchableOpacity>
                            </View>
                            <Image
                                source={{ uri: specialOffer.imageUrl }}
                                style={styles.specialOfferImage}
                            />
                        </View>
                    )}
                </View>

                {/* 3. Try out Unggulan */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Try out Unggulan</Text>
                    {!loading && featuredProducts.length > 0 && (
                        <FlatList
                            data={featuredProducts}
                            renderItem={({ item }) => <ProductCard item={item} navigation={navigation} />}
                            keyExtractor={item => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        />
                    )}
                    {/* Tampilkan pesan jika tidak ada Try out unggulan */}
                    {!loading && featuredProducts.length === 0 && !error && (
                        <Text style={styles.errorText}>Tidak ada Try out unggulan saat ini.</Text>
                    )}
                </View>

                {/* 4. CTA Banner */}
                <TouchableOpacity
                    style={styles.ctaBanner}
                    onPress={() => {
                        navigation.navigate('GameCategory');
                    }}
                >
                    <Text style={styles.ctaText}>Coba fitur hafalan kosa kata gratis sekarang!</Text>
                </TouchableOpacity>

            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    scrollView: { flex: 1 },
    sectionContainer: { marginBottom: 30 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 16, paddingHorizontal: 20, },
    heroSection: { backgroundColor: COLORS.secondary, padding: 20, paddingTop: 40, alignItems: 'center', marginBottom: 20 },
    heroTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
    heroSubtitle: { fontSize: 16, color: COLORS.text, textAlign: 'center', marginVertical: 12, },
    heroLogo: { width: 150, height: 50, resizeMode: 'contain', marginBottom: 8 },
    // Special Offer
    specialOfferCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, marginHorizontal: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, },
    specialOfferText: { flex: 1, marginRight: 10, justifyContent: 'center' },
    specialOfferTitle: { fontSize: 16, fontWeight: 'bold' },
    specialOfferDesc: { fontSize: 14, color: COLORS.gray, marginVertical: 8 },
    buyNowButton: { backgroundColor: COLORS.secondary, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start' },
    buyNowText: { color: COLORS.primary, fontWeight: 'bold' },
    specialOfferImage: { width: 80, height: 80, borderRadius: 8 },
    errorText: { color: 'red', paddingHorizontal: 20, textAlign: 'center' },
    // Product
    productCard: { width: 160, marginRight: 16, backgroundColor: 'white', borderRadius: 12, padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, },
    productImage: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8 },
    productTitle: { fontSize: 14, fontWeight: 'bold' },
    productDescription: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
    // CTA
    ctaBanner: { marginHorizontal: 20, backgroundColor: '#F97B22', borderRadius: 12, paddingBottom: 50, paddingTop: 50, flexDirection: 'row', alignItems: 'center', marginBottom: 30, },
    ctaText: { color: 'white', fontWeight: 'bold', fontSize: 22, marginLeft: 12, flex: 1 },
});

export default HomeScreen;