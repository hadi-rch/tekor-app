import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    FlatList,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel, heightPixel } from '../../helper';

// --- Data Dummy Kosakata (dengan Romanization) ---
const VOCABULARY_DATA = [
    { id: 1, korean: '사과', romanization: 'sagwa', indonesian: 'Apel' },
    { id: 2, korean: '바나나', romanization: 'banana', indonesian: 'Pisang' },
    { id: 3, korean: '물', romanization: 'mul', indonesian: 'Air' },
    { id: 4, korean: '집', romanization: 'jip', indonesian: 'Rumah' },
    { id: 5, korean: '학교', romanization: 'hakgyo', indonesian: 'Sekolah' },
    { id: 6, korean: '친구', romanization: 'chingu', indonesian: 'Teman' },
    { id: 7, korean: '사랑', romanization: 'sarang', indonesian: 'Cinta' },
    { id: 8, korean: '행복', romanization: 'haengbok', indonesian: 'Kebahagiaan' },
    { id: 9, korean: '시간', romanization: 'sigan', indonesian: 'Waktu' },
    { id: 10, korean: '사람', romanization: 'saram', indonesian: 'Orang' },
    { id: 11, korean: '책', romanization: 'chaek', indonesian: 'Buku' },
    { id: 12, korean: '음악', romanization: 'eumak', indonesian: 'Musik' },
];

// --- Komponen untuk satu kartu ---
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
                {/* Menampilkan Korean dan Romanization */}
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


// --- Komponen Utama Game ---
const MemoryCardGameScreen = ({ navigation }) => {
    const [cards, setCards] = useState([]);
    const [flippedCardIds, setFlippedCardIds] = useState(new Set());

    const shuffleCards = () => {
        const shuffled = [...VOCABULARY_DATA].sort(() => Math.random() - 0.5);
        setCards(shuffled);
    };

    useEffect(() => {
        shuffleCards();
    }, []);

    const handleCardFlip = (cardId) => {
        const newFlipped = new Set(flippedCardIds);
        if (newFlipped.has(cardId)) {
            newFlipped.delete(cardId);
        } else {
            newFlipped.add(cardId);
        }
        setFlippedCardIds(newFlipped);
    };

    const handleReset = () => {
        setFlippedCardIds(new Set());
    };

    const handleShuffle = () => {
        handleReset();
        shuffleCards();
    };

    const progress = cards.length > 0 ? (flippedCardIds.size / cards.length) * 100 : 0;

    // Komponen Header untuk FlatList
    const renderListHeader = () => (
        <>
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{cards.length}</Text>
                    <Text style={styles.statLabel}>Total Kartu</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{flippedCardIds.size}</Text>
                    <Text style={styles.statLabel}>Terbuka</Text>
                </View>
            </View>
            <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Progres</Text>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
            </View>
        </>
    );

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
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
                    <Text style={styles.shuffleButtonText}>Acak Ulang</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: pixelSizeVertical(15),
        paddingHorizontal: pixelSizeHorizontal(20),
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerButton: {
        padding: pixelSizeHorizontal(5),
    },
    headerTitle: {
        fontSize: fontPixel(18),
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: pixelSizeHorizontal(20),
    },
    statBox: {
        backgroundColor: COLORS.white,
        padding: pixelSizeHorizontal(20),
        borderRadius: 12,
        alignItems: 'center',
        width: '45%',
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    statValue: {
        fontSize: fontPixel(24),
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: fontPixel(14),
        color: COLORS.gray,
        marginTop: pixelSizeVertical(5),
    },
    progressSection: {
        paddingHorizontal: pixelSizeHorizontal(20),
        marginBottom: pixelSizeVertical(15),
    },
    progressLabel: {
        fontSize: fontPixel(16),
        fontWeight: '500',
        marginBottom: pixelSizeVertical(8),
    },
    progressBarBackground: {
        height: heightPixel(8),
        backgroundColor: COLORS.borderColor,
        borderRadius: 4,
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    gameGrid: {
        paddingHorizontal: pixelSizeHorizontal(15),
        paddingBottom: pixelSizeVertical(20),
    },
    cardContainer: {
        flex: 1,
        aspectRatio: 1,
        margin: pixelSizeHorizontal(5),
        perspective: 1000,
    },
    card: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backfaceVisibility: 'hidden',
        position: 'absolute',
        padding: pixelSizeHorizontal(10),
    },
    cardFront: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    cardBack: {
        backgroundColor: '#E9F5FF',
    },
    cardTextKorean: {
        fontSize: fontPixel(26), // Sedikit dikecilkan untuk memberi ruang
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: pixelSizeVertical(4),
    },
    // Style baru untuk romanization
    cardTextRomanization: {
        fontSize: fontPixel(16),
        textAlign: 'center',
        color: COLORS.gray,
    },
    cardTextIndonesian: {
        fontSize: fontPixel(22),
        textAlign: 'center',
        color: COLORS.primary,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        padding: pixelSizeHorizontal(20),
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    },
    resetButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: pixelSizeVertical(15),
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginRight: pixelSizeHorizontal(10),
    },
    resetButtonText: {
        fontSize: fontPixel(16),
        fontWeight: 'bold',
        color: COLORS.text,
    },
    shuffleButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: pixelSizeVertical(15),
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
    },
    shuffleButtonText: {
        fontSize: fontPixel(16),
        fontWeight: 'bold',
        color: COLORS.white,
    },
});

export default MemoryCardGameScreen;
