import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, FlatList, Animated, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, pixelSizeVertical, pixelSizeHorizontal, heightPixel } from '../../helper';
import api from '../../api/axiosConfig';

const MemoryCard = ({ item, isFlipped, onPress }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: isFlipped ? 180 : 0,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
        }).start();
    }, [isFlipped]);

    const frontInterpolate = animatedValue.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
    const backInterpolate = animatedValue.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

    const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
    const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

    return (
        <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
            <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                <View>
                    <Text style={styles.cardTextKorean}>{item.korean}</Text>
                    <Text style={styles.cardTextRomanization}>{item.romanization}</Text>
                </View>
            </Animated.View>
            <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                <Text style={styles.cardTextIndonesian}>{item.indonesian}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};


const MemoryCardGameScreen = ({ navigation, route }) => {
    const { category } = route.params;
    const [cards, setCards] = useState([]); // Kartu yang ditampilkan di halaman saat ini (sudah diacak)
    const [currentPageOriginalCards, setCurrentPageOriginalCards] = useState([]); // Kartu asli di halaman saat ini
    const [allOriginalCards, setAllOriginalCards] = useState([]); // Semua kartu dari semua halaman yang telah dimuat
    const [flippedCardIds, setFlippedCardIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchVocabularies = async () => {
            if (!category) {
                Alert.alert("Error", "Kategori tidak ditemukan.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true); // Set loading true saat mengambil halaman baru
            try {
                const response = await api.get(`/api/v1/vocabularies?category=${category}&page=${currentPage}`);

                const backendData = response.data.data.content;
                const totalPagesFromApi = response.data.data.totalPages;

                const formattedData = backendData.map(item => ({
                    id: item.id,
                    korean: item.koreanWord,
                    indonesian: item.translation,
                    romanization: item.romanization,
                }));

                setTotalPages(totalPagesFromApi);
                setCurrentPageOriginalCards(formattedData); // Simpan kartu asli halaman ini
                setCards([...formattedData].sort(() => Math.random() - 0.5)); // Atur kartu untuk view saat ini

                // Tambahkan kartu baru ke daftar global tanpa duplikasi
                setAllOriginalCards(prevAllCards => {
                    const existingIds = new Set(prevAllCards.map(c => c.id));
                    const newUniqueCards = formattedData.filter(c => !existingIds.has(c.id));
                    return [...prevAllCards, ...newUniqueCards];
                });

            } catch (error) {
                Alert.alert("Error", `Tidak dapat memuat data permainan untuk halaman ${currentPage + 1}.`);
                console.log("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVocabularies();
    }, [category, currentPage]); // Jalankan effect ini saat kategori atau halaman berubah

    const handleCardFlip = (cardId) => {
        const newFlipped = new Set(flippedCardIds);
        if (newFlipped.has(cardId)) {
            newFlipped.delete(cardId);
        } else {
            newFlipped.add(cardId);
        }
        setFlippedCardIds(newFlipped);
    };

    // Reset hanya membalik semua kartu, tidak menghapus data atau mengubah halaman
    const handleReset = () => {
        setFlippedCardIds(new Set());
    };

    // Acak ulang hanya kartu di halaman saat ini
    const handleShuffle = () => {
        handleReset(); // Tetap reset kartu yang terbuka
        setCards([...currentPageOriginalCards].sort(() => Math.random() - 0.5));
    };

    // Handler untuk pagination
    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // Progres dihitung dari total kartu yang sudah dimuat
    const progress = allOriginalCards.length > 0 ? (flippedCardIds.size / allOriginalCards.length) * 100 : 0;

    const renderListHeader = () => (
        <>
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    {/* Tampilkan total kartu dari semua halaman yang dimuat */}
                    <Text style={styles.statValue}>{allOriginalCards.length}</Text>
                    <Text style={styles.statLabel}>Total Kartu</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{flippedCardIds.size}</Text>
                    <Text style={styles.statLabel}>Terbuka</Text>
                </View>
            </View>
            <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Progres Keseluruhan</Text>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
            </View>
        </>
    );

    if (isLoading && allOriginalCards.length === 0) {
        return (
            <View style={[styles.screenContainer, styles.centerContainer]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10 }}>Memuat kartu...</Text>
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
                <Text style={styles.headerTitle}>Game: Kartu Memori</Text>
                <View style={{ width: fontPixel(24) }} />
            </View>

            {isLoading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />}

            <FlatList
                data={cards}
                ListHeaderComponent={renderListHeader}
                renderItem={({ item }) => (
                    <MemoryCard
                        item={item}
                        isFlipped={flippedCardIds.has(item.id)}
                        onPress={() => handleCardFlip(item.id)}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.gameGrid}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
                        <Text style={styles.shuffleButtonText}>Acak Ulang</Text>
                    </TouchableOpacity>
                </View>
                {/* Kontrol Pagination */}
                {totalPages > 1 && (
                    <View style={styles.paginationControls}>
                        <TouchableOpacity onPress={handlePrevPage} disabled={currentPage === 0} style={[styles.navButton, currentPage === 0 && styles.disabledButton]}>
                            <Text style={styles.navButtonText}>Sebelumnya</Text>
                        </TouchableOpacity>
                        <Text style={styles.pageInfo}>
                            Halaman {currentPage + 1} / {totalPages}
                        </Text>
                        <TouchableOpacity onPress={handleNextPage} disabled={currentPage >= totalPages - 1} style={[styles.navButton, currentPage >= totalPages - 1 && styles.disabledButton]}>
                            <Text style={styles.navButtonText}>Berikutnya</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: '#F7F8FA', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, },
    centerContainer: { justifyContent: 'center', alignItems: 'center', },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: pixelSizeVertical(15), paddingHorizontal: pixelSizeHorizontal(20), backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', },
    headerButton: { padding: pixelSizeHorizontal(5), },
    headerTitle: { fontSize: fontPixel(18), fontWeight: 'bold', },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: pixelSizeHorizontal(20), },
    statBox: { backgroundColor: COLORS.white, padding: pixelSizeHorizontal(20), borderRadius: 12, alignItems: 'center', width: '45%', borderWidth: 1, borderColor: '#E0E0E0', },
    statValue: { fontSize: fontPixel(24), fontWeight: 'bold', },
    statLabel: { fontSize: fontPixel(14), color: COLORS.gray, marginTop: pixelSizeVertical(5), },
    progressSection: { paddingHorizontal: pixelSizeHorizontal(20), marginBottom: pixelSizeVertical(15), },
    progressLabel: { fontSize: fontPixel(16), fontWeight: '500', marginBottom: pixelSizeVertical(8), },
    progressBarBackground: { height: heightPixel(8), backgroundColor: '#E0E0E0', borderRadius: 4, },
    progressBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4, },
    gameGrid: { paddingHorizontal: pixelSizeHorizontal(15), paddingBottom: pixelSizeVertical(20), },
    cardContainer: { flex: 1, aspectRatio: 1, margin: pixelSizeHorizontal(5), perspective: 1000, },
    card: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 12, backfaceVisibility: 'hidden', position: 'absolute', padding: pixelSizeHorizontal(10), },
    cardFront: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E0E0E0', },
    cardBack: { backgroundColor: '#E9F5FF', transform: [{ rotateY: '180deg' }] },
    cardTextKorean: { fontSize: fontPixel(26), fontWeight: 'bold', textAlign: 'center', marginBottom: pixelSizeVertical(4), },
    cardTextRomanization: { fontSize: fontPixel(16), textAlign: 'center', color: COLORS.gray, },
    cardTextIndonesian: { fontSize: fontPixel(22), textAlign: 'center', color: COLORS.primary, fontWeight: '500', },
    footer: { padding: pixelSizeHorizontal(20), borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: COLORS.white, paddingBottom: Platform.OS === 'ios' ? 34 : pixelSizeVertical(20), },
    buttonContainer: { flexDirection: 'row', marginBottom: pixelSizeVertical(15) },
    resetButton: { backgroundColor: '#f0f0f0', paddingVertical: pixelSizeVertical(15), borderRadius: 12, alignItems: 'center', flex: 1, marginRight: pixelSizeHorizontal(10), },
    resetButtonText: { fontSize: fontPixel(16), fontWeight: 'bold', color: COLORS.text, },
    shuffleButton: { backgroundColor: COLORS.primary, paddingVertical: pixelSizeVertical(15), borderRadius: 12, alignItems: 'center', flex: 1, },
    shuffleButtonText: { fontSize: fontPixel(16), fontWeight: 'bold', color: COLORS.white, },
    paginationControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    navButton: { paddingHorizontal: pixelSizeHorizontal(15), paddingVertical: pixelSizeVertical(10), backgroundColor: COLORS.primary, borderRadius: 8 },
    navButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: fontPixel(14) },
    disabledButton: { backgroundColor: '#B0C4DE' },
    pageInfo: { fontSize: fontPixel(16), fontWeight: '600', color: COLORS.text }
});


export default MemoryCardGameScreen;