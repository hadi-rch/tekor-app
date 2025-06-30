import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    FlatList,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
// import { fontPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel } from '../constants/dimensions';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import {  fontPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel  } from '../../helper';

// --- Data Mockup untuk Kategori Game ---
const gameCategories = [
    { id: '1', title: 'Buah-buahan', image: require('../../assets/images/g1.png') }, // Ganti dengan path gambar Anda
    { id: '2', title: 'Hewan', image: require('../../assets/images/g2.png') },
    { id: '3', title: 'Warna', image: require('../../assets/images/g3.png') },
    { id: '4', title: 'Angka', image: require('../../assets/images/g4.png') },
    { id: '5', title: 'Kata Kerja', image: require('../../assets/images/g2.png') },
    { id: '6', title: 'Kata Sifat', image: require('../../assets/images/g1.png') },
];

// --- Komponen untuk setiap kartu kategori ---
const CategoryCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
        <Image source={item.image} style={styles.cardImage} />
        <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
);


// --- Komponen Utama GameCategoryScreen ---
const GameCategoryScreen = ({ navigation }) => {

    const handleCategoryPress = (category) => {
        console.log("Selected Category:", category.title);
        // Navigasi ke layar game, bisa sambil mengirim data kategori
        // Untuk sekarang, kita arahkan ke game yang sudah ada
        navigation.navigate('MemoryCardGame', { category: category.title });
    };

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={fontPixel(24)} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pilih Kategori Permainan</Text>
                <View style={{ width: fontPixel(24) }} />
            </View>

            <FlatList
                data={gameCategories}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={
                    <Text style={styles.description}>
                        Pilih kategori kosakata untuk memulai permainan
                    </Text>
                }
                renderItem={({ item }) => (
                    <CategoryCard
                        item={item}
                        onPress={() => handleCategoryPress(item)}
                    />
                )}
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
    listContainer: {
        paddingHorizontal: pixelSizeHorizontal(15),
    },
    description: {
        fontSize: fontPixel(16),
        color: COLORS.text,
        paddingVertical: pixelSizeVertical(20),
        lineHeight: fontPixel(24),
    },
    cardContainer: {
        flex: 1,
        margin: pixelSizeHorizontal(5),
        alignItems: 'center',
        marginBottom: pixelSizeVertical(15),
    },
    cardImage: {
        width: '100%',
        height: widthPixel(150), // Membuat gambar agak persegi
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    cardTitle: {
        fontSize: fontPixel(16),
        fontWeight: '500',
        marginTop: pixelSizeVertical(8),
    },
});

export default GameCategoryScreen;
