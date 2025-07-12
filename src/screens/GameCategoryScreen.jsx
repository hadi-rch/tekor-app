import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, FlatList, Image, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel } from '../../helper';
import api from '../../api/axiosConfig';
import { LinearGradient } from 'expo-linear-gradient';

const categoryDisplayMap = {
    "VERB": { title: 'Kata Kerja', image: require('../../assets/images/kerja.jpg') },
    "ADJECTIVE": { title: 'Kata Sifat', image: require('../../assets/images/dingin.jpg') },
    "NOUN": { title: 'Kata Benda', image: require('../../assets/images/hanbok.png') },
    "PLACE": { title: 'Tempat', image: require('../../assets/images/gyeongbok.jpeg') },
    "TRANSPORTATION": { title: 'Transportasi', image: require('../../assets/images/kereta.jpeg') }
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
                const backendCategories = response.data.data;

                const formattedCategories = backendCategories.map(categoryKey => ({
                    id: categoryKey,
                    backendKey: categoryKey,
                    ...categoryDisplayMap[categoryKey]
                }));

                setCategories(formattedCategories);
            } catch (error) {
                console.log("Gagal mengambil kategori:", error);
                Alert.alert("Error", "Tidak dapat memuat kategori permainan.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);
    const handleCategoryPress = (category) => {
        navigation.navigate('MemoryCardGame', { category: category.backendKey });
    };

    if (isLoading) {
        return (
            <View style={[styles.screenContainer, styles.centerContainer]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#E6ECF5', '#FDEAEB']}
            style={styles.screenContainer}
        >
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            <View style={styles.header}>
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
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: pixelSizeVertical(15), paddingHorizontal: pixelSizeHorizontal(20), borderBottomWidth: 1, borderBottomColor: COLORS.borderColor, },
    headerTitle: { fontSize: fontPixel(20), fontWeight: 'bold', },
    listContainer: { paddingHorizontal: pixelSizeHorizontal(15), },
    description: { fontSize: fontPixel(16), color: COLORS.text, paddingVertical: pixelSizeVertical(20), lineHeight: fontPixel(24), },
    cardContainer: { flex: 1, margin: pixelSizeHorizontal(5), alignItems: 'center', marginBottom: pixelSizeVertical(15), },
    cardImage: { width: '100%', height: widthPixel(150), borderRadius: 12, backgroundColor: '#f0f0f0', },
    cardTitle: { fontSize: fontPixel(16), fontWeight: '500', marginTop: pixelSizeVertical(8), },
    centerContainer: { justifyContent: 'center', alignItems: 'center', },
});

export default GameCategoryScreen;
