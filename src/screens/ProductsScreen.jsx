import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors'; // Pastikan path ini benar
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

// --- Data Mockup ---
const productsData = [
    {
        id: 'p1',
        title: 'Korean Alphabet Flashcards',
        description: 'Learn the basics of the Korean alphabet with these interactive flashcards.',
        price: '$9.99',
        image: require('../../assets/images/g1.png'), // Ganti dengan path gambar Anda
    },
    {
        id: 'p2',
        title: 'Korean Vocabulary Builder',
        description: 'Expand your Korean vocabulary with this comprehensive builder.',
        price: '$14.99',
        image: require('../../assets/images/g2.png'), // Ganti dengan path gambar Anda
    },
    {
        id: 'p3',
        title: 'Korean Grammar Guide',
        description: 'Master Korean grammar rules with this detailed guide.',
        price: '$19.99',
        image: require('../../assets/images/g3.png'), // Ganti dengan path gambar Anda
    },
];

const gamesData = [
    {
        id: 'g1',
        title: 'Hangeul flip card',
        description: 'Match Korean characters with their pronunciations.',
        image: require('../../assets/images/g4.png'), // Ganti dengan path gambar Anda
    }
]

// --- Komponen untuk setiap item dalam daftar ---
const ProductCard = ({ item, type = 'product', navigation }) => ( // 1. Terima 'navigation'
    // 2. Ganti View menjadi TouchableOpacity
    <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => {
            // Hanya navigasi jika ini adalah produk, bukan game
            if (type === 'product') {
                navigation.navigate('ProductDetail', { product: item })
            } else if (type === 'game') {
                navigation.navigate('GameCategory');
            }
            // Anda bisa menambahkan logika lain untuk tombol 'Play' pada game di sini
        }}
    >
        <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            {type === 'product' ? (
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{item.price}</Text>
                </View>
            ) : (
                <TouchableOpacity style={styles.playButton}>
                    <Text style={styles.playButtonText}>Play</Text>
                </TouchableOpacity>
            )}
        </View>
        <Image source={item.image} style={styles.cardImage} />
    </TouchableOpacity>
);

// --- Komponen Utama ProductsScreen ---
const ProductsScreen = ({ navigation }) => {
    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Products</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Search & Filter */}
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
                            <Text>Filter</Text>
                            <Ionicons name="options" size={16} color={COLORS.gray} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Daftar Produk */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Products</Text>
                    {productsData.map(item => <ProductCard key={item.id} item={item} type="product" navigation={navigation} />)}
                </View>

                {/* Daftar Games */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Games</Text>
                    {gamesData.map(item => <ProductCard key={item.id} item={item} type="game" navigation={navigation} />)}
                </View>

            </ScrollView>
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
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerTitle: {
        fontSize: 20,
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
        fontSize: 16,
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
        fontSize: 22,
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
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardDescription: {
        fontSize: 14,
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
        backgroundColor: COLORS.accent,
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
    },
});

export default ProductsScreen;
