import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    StatusBar,
    ScrollView,
    Image,
} from 'react-native';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import CustomButton from '../components/CustomButton';
import {  fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel } from '../../helper';

// --- Komponen untuk Kotak Statistik ---
const StatBox = ({ label, value, fullWidth = false }) => (
    <View style={[styles.statBox, fullWidth && styles.fullWidthStatBox]}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);


// --- Komponen Utama TestResultScreen ---
const TestResultScreen = ({ navigation, route }) => {
    // Menerima data dari TestScreen melalui route.params
    const { score, correctAnswers, wrongAnswers, timeTaken, userAnswers } = route.params || {
        // Data default jika dibuka langsung
        score: 85,
        correctAnswers: 34,
        wrongAnswers: 6,
        timeTaken: '25 menit',
        userAnswers: {}
    };

    const scorePercentage = (score / 100) * 100;

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />

            {/* Header Kustom */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hasil Ujian</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.mainContent}>
                    <Text style={styles.congratsTitle}>Selamat! Kamu telah menyelesaikan ujian</Text>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>{score}/100</Text>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBar, { width: `${scorePercentage}%` }]} />
                        </View>
                    </View>

                    <View style={styles.summarySection}>
                        <Text style={styles.sectionTitle}>Ringkasan</Text>
                        <View style={styles.statsRow}>
                            <StatBox label="Jawaban Benar" value={correctAnswers} />
                            <StatBox label="Jawaban Salah" value={wrongAnswers} />
                        </View>
                        <StatBox label="Waktu Selesai" value={timeTaken} fullWidth={true} />
                    </View>

                    <Image
                        source={require('../../assets/images/g1.png')} // Ganti dengan gambar Anda
                        style={styles.promoImage}
                    />
                </View>
            </ScrollView>

            {/* Tombol Lihat Pembahasan */}
            <View style={styles.footer}>
                <CustomButton
                    title="Lihat Pembahasan"
                    onPress={() => navigation.navigate('Review', { userAnswers: userAnswers })}
                    style={{ backgroundColor: COLORS.accent, marginBottom: pixelSizeVertical(50) }}
                />
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
        paddingVertical: pixelSizeVertical(15),
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerTitle: {
        fontSize: fontPixel(20),
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingBottom: heightPixel(120), // Memberi ruang dari footer
    },
    mainContent: {
        padding: pixelSizeHorizontal(20),
        alignItems: 'center',
    },
    congratsTitle: {
        fontSize: fontPixel(22),
        fontWeight: 'bold',
        textAlign: 'center',
        color: COLORS.text,
        marginBottom: pixelSizeVertical(20),
    },
    scoreContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: pixelSizeVertical(25),
    },
    scoreText: {
        fontSize: fontPixel(14),
        color: COLORS.gray,
        marginBottom: pixelSizeVertical(8),
    },
    progressBarBackground: {
        width: '100%',
        height: heightPixel(8),
        backgroundColor: COLORS.borderColor,
        borderRadius: 4,
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.accent,
        borderRadius: 4,
    },
    summarySection: {
        width: '100%',
        marginBottom: pixelSizeVertical(25),
    },
    sectionTitle: {
        fontSize: fontPixel(18),
        fontWeight: 'bold',
        marginBottom: pixelSizeVertical(15),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: pixelSizeVertical(15),
    },
    statBox: {
        backgroundColor: COLORS.white,
        padding: pixelSizeHorizontal(20),
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        width: '48%', // Sedikit kurang dari 50% untuk memberi jarak
    },
    fullWidthStatBox: {
        width: '100%',
    },
    statLabel: {
        fontSize: fontPixel(14),
        color: COLORS.gray,
    },
    statValue: {
        fontSize: fontPixel(28),
        fontWeight: 'bold',
        marginTop: pixelSizeVertical(8),
    },
    promoImage: {
        width: '100%',
        height: heightPixel(180),
        borderRadius: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: pixelSizeHorizontal(20),
        paddingTop: pixelSizeVertical(15),
        paddingBottom: pixelSizeVertical(30),
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    }
});

export default TestResultScreen;
