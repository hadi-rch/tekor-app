import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel } from '../../helper';
import api from '../../api/axiosConfig';

const categoryDisplayMap = {
    "VERB": { title: 'Kata Kerja', image: require('../../assets/images/kerja.jpg') },
    "ADJECTIVE": { title: 'Kata Sifat', image: require('../../assets/images/dingin.jpg') },
    "NOUN": { title: 'Kata Benda', image: require('../../assets/images/hanbok.png') },
    "PLACE": { title: 'Tempat', image: require('../../assets/images/gyeongbok.jpeg') },
    "TRANSPORTATION": { title: 'Transportasi', image: require('../../assets/images/kereta.jpeg') },
    // Tambahkan kategori lain jika ada
};


// --- Komponen untuk setiap kartu kategori ---
const CategoryCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
        <Image source={item.image} style={styles.cardImage} />
        <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
);


// --- Komponen Utama GameCategoryScreen ---
const GameCategoryScreen = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/v1/vocabularies/categories');
                const backendCategories = response.data.data; // Array of strings ["VERB", "NOUN", ...]

                // Transformasi data dari backend ke format yang bisa ditampilkan
                const formattedCategories = backendCategories.map(categoryKey => ({
                    id: categoryKey, // Gunakan key dari backend sebagai ID unik
                    backendKey: categoryKey, // Simpan key asli untuk dikirim ke layar game
                    ...categoryDisplayMap[categoryKey] // Ambil title dan image dari map
                }));

                setCategories(formattedCategories);
            } catch (error) {
                console.error("Gagal mengambil kategori:", error);
                Alert.alert("Error", "Tidak dapat memuat kategori permainan.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []); // Array dependensi kosong agar hanya berjalan sekali

    const handleCategoryPress = (category) => {
        console.log("Selected Category:", category.backendKey);
        // Kirim key asli dari backend ke layar game
        navigation.navigate('MemoryCardGame', { category: category.backendKey });
    };

    // Tampilkan loading indicator saat data diambil
    if (isLoading) {
        return (
            <View style={[styles.screenContainer, styles.centerContainer]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
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
                <Text style={styles.headerTitle}>Pilih Kategori Permainan</Text>
                <View style={{ width: fontPixel(24) }} />
            </View>

            <FlatList
                data={categories}
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
     centerContainer: { // Style untuk loading
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default GameCategoryScreen;
