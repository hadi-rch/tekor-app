import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import CustomButton from '../components/CustomButton';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const featuredProducts = [
    { id: '1', title: 'Tes Level Bahasa Korea', description: 'Uji level bahasa Koreamu dengan tes komprehensif.', image: 'https://placehold.co/300x400/F5E8E8/333?text=Tes+Level' },
    { id: '2', title: 'Tes Topik', description: 'Persiapkan diri untuk ujian TOPIK dengan simulasi tes.', image: 'https://placehold.co/300x400/E96479/FFF?text=Tes+Topik' },
    { id: '3', title: 'Materi Belajar', description: 'Akses ribuan materi belajar interaktif.', image: 'https://placehold.co/300x400/4C6FFF/FFF?text=Materi' },
];

const whyUsFeatures = [
    { id: '1', icon: 'ribbon-outline', title: 'Tes Terstandarisasi', description: 'Kurikulum mengikuti standar internasional.' },
    { id: '2', icon: 'time-outline', title: 'Waktu Fleksibel', description: 'Kerjakan tes kapan saja sesuai kenyamananmu.' },
    { id: '3', icon: 'people-outline', title: 'Komunitas Pembelajaran', description: 'Bergabung dengan komunitas pembelajar.' },
];

// --- Komponen Kecil untuk Kartu ---
const ProductCard = ({ item }) => (
    <View style={styles.productCard}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
    </View>
);

const FeatureCard = ({ item }) => (
    <View style={styles.featureCard}>
        <Ionicons name={item.icon} size={32} color={COLORS.primary} />
        <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>{item.title}</Text>
            <Text style={styles.featureDescription}>{item.description}</Text>
        </View>
    </View>
);


// --- Komponen Utama HomeScreen ---
const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScrollView style={styles.scrollView}>
                {/* 1. Hero Section */}
                <View style={styles.heroSection}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.heroLogo}
                    />
                    {/* <Text style={styles.heroTitle}>TE-KOR</Text> */}
                    <Text style={styles.heroSubtitle}>Ukur kemampuan bahasa Koreamu dengan tes terstandarisasi.</Text>
                    <CustomButton
                        title="Mulai Tes Sekarang!"
                        onPress={() => { /* Navigasi ke halaman tes */ }}
                        style={{ backgroundColor: COLORS.accent }}
                    />
                </View>

                {/* 2. Penawaran Spesial */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Penawaran Spesial</Text>
                    <View style={styles.specialOfferCard}>
                        <View style={styles.specialOfferText}>
                            <Text style={styles.specialOfferTitle}>Paket Tes Lengkap</Text>
                            <Text style={styles.specialOfferDesc}>Dapatkan akses ke semua tes dengan harga khusus.</Text>
                            <TouchableOpacity style={styles.buyNowButton}>
                                <Text style={styles.buyNowText}>Beli Sekarang</Text>
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={require('../../assets/images/penawaran.png')}
                            style={styles.specialOfferImage}
                        />
                    </View>
                </View>

                {/* 3. Produk Unggulan */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Produk Unggulan</Text>
                    <FlatList
                        data={featuredProducts}
                        renderItem={({ item }) => <ProductCard item={item} />}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 20, paddingBottom: 20 }}
                    />
                </View>

                {/* 4. CTA Banner */}
                <View style={styles.ctaBanner}>
                    <Ionicons name="sparkles-outline" size={24} color={COLORS.white} />
                    <Text style={styles.ctaText}>Coba fitur hafalan kosa kata gratis sekarang!</Text>
                </View>

                {/* 5. Kenapa Memilih Kami? */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Kenapa Memilih Kami?</Text>
                    {whyUsFeatures.map(item => <FeatureCard key={item.id} item={item} />)}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF8F6' },
    scrollView: { flex: 1 },
    sectionContainer: { marginBottom: 30 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 16, paddingHorizontal: 20, },
    // Hero
    heroSection: { backgroundColor: '#FFECEC', padding: 20, paddingTop: 40, alignItems: 'center', marginBottom: 20 },
    heroTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.accent },
    heroSubtitle: { fontSize: 16, color: COLORS.text, textAlign: 'center', marginVertical: 12, },
    heroLogo: {
        width: 150,
        height: 50,
        resizeMode: 'contain',
        marginBottom: 8
    },
    // Special Offer
    specialOfferCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, marginHorizontal: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, },
    specialOfferText: { flex: 1, marginRight: 10 },
    specialOfferTitle: { fontSize: 16, fontWeight: 'bold' },
    specialOfferDesc: { fontSize: 14, color: COLORS.gray, marginVertical: 8 },
    buyNowButton: { backgroundColor: '#FFF0F0', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start' },
    buyNowText: { color: COLORS.accent, fontWeight: 'bold' },
    specialOfferImage: { width: 80, height: 80, borderRadius: 8 },
    // Product
    productCard: { width: 160, marginRight: 16, backgroundColor: 'white', borderRadius: 12, padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, },
    productImage: { width: '100%', height: 120, borderRadius: 8, marginBottom: 8 },
    productTitle: { fontSize: 14, fontWeight: 'bold' },
    productDescription: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
    // CTA
    ctaBanner: { marginHorizontal: 20, backgroundColor: '#F97B22', borderRadius: 12, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 30, },
    ctaText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 12, flex: 1 },
    // Feature
    featureCard: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 20, marginBottom: 20, backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
    featureTextContainer: { marginLeft: 16, flex: 1 },
    featureTitle: { fontSize: 16, fontWeight: 'bold' },
    featureDescription: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
});

export default HomeScreen;
