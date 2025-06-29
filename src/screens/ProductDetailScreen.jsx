import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel } from '../../helper';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import CustomButton from '../components/CustomButton';

// --- Komponen untuk Tag Level ---
const LevelTag = ({ label }) => (
    <View style={styles.tagContainer}>
        <Text style={styles.tagText}>{label}</Text>
    </View>
);


// --- Komponen Utama ProductDetailScreen ---
const ProductDetailScreen = ({ navigation, route }) => {
    // Di aplikasi nyata, data ini akan didapat dari route.params
    // Untuk sekarang, kita gunakan data mockup
    const product = route.params?.product || {
        title: 'Korean Language Learning Course',
        price: 'Rp 150.000',
        description: 'Learn Korean with our comprehensive course. Features include:',
        image: require('../../assets/images/g3.png'), // Ganti dengan path gambar Anda
        tags: ['Beginner', 'Intermediate', 'Advanced'],
    };

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Header Kustom */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={fontPixel(24)} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Produk</Text>
                <View style={{ width: fontPixel(24) }} />
            </View>

            <ScrollView style={styles.scrollContainer}>
                <Image source={product.image} style={styles.productImage} />

                <View style={styles.detailsContainer}>
                    <Text style={styles.productTitle}>{product.title}</Text>
                    <Text style={styles.productPrice}>{product.price}</Text>

                    {product.tags && (
                        <View style={styles.tagsRow}>
                            {product.tags.map((tag, index) => (
                                <LevelTag key={index} label={tag} />
                            ))}
                        </View>
                    )}

                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>Product Description</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Tombol Beli di Bawah */}
            <View style={styles.footer}>
                <CustomButton
                    title="Beli"
                    onPress={() => { /* Logika untuk membeli */ }}
                    style={{ backgroundColor: COLORS.accent }}
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
        flex: 1,
    },
    productImage: {
        width: '100%',
        height: heightPixel(300),
        resizeMode: 'cover',
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
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: pixelSizeVertical(25),
    },
    tagContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: widthPixel(20),
        paddingVertical: pixelSizeVertical(8),
        paddingHorizontal: pixelSizeHorizontal(15),
        marginRight: pixelSizeHorizontal(10),
        marginBottom: pixelSizeVertical(10),
    },
    tagText: {
        fontSize: fontPixel(14),
        color: COLORS.gray,
    },
    descriptionSection: {},
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
        padding: pixelSizeHorizontal(20),
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    }
});

export default ProductDetailScreen;
