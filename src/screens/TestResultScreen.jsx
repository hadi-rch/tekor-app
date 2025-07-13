import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, ScrollView, Image} from 'react-native';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import CustomButton from '../components/CustomButton';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel } from '../../helper';

// --- Komponen untuk Kotak Statistik ---
const StatBox = ({ label, value, fullWidth = false }) => (
    <View style={[styles.statBox, fullWidth && styles.fullWidthStatBox]}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

// --- Komponen Utama TestResultScreen ---
const TestResultScreen = ({ navigation, route }) => {
    const { testResult, start, attemptId } = route.params || {};

    if (!testResult) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Tidak ada data hasil tes untuk ditampilkan.</Text>
                <CustomButton
                    title="Kembali"
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: 20 }}
                />
            </View>
        );
    }
    
    const { score, totalCorrect, totalIncorrect, completionTime } = testResult;
    
    // Perbaikan perhitungan waktu selesai
    let finishTime;
    
    if (completionTime && start) {
        // Jika completionTime sudah dalam detik, gunakan langsung
        if (typeof completionTime === 'number') {
            finishTime = Math.abs(completionTime);
        } else {
            // Jika completionTime adalah timestamp, hitung selisih
            const startTime = typeof start === 'number' ? start : new Date(start).getTime();
            const endTime = typeof completionTime === 'number' ? completionTime : new Date(completionTime).getTime();
            finishTime = Math.abs(endTime - startTime) / 1000; // Konversi ke detik
        }
    } else if (completionTime) {
        // Jika hanya ada completionTime
        finishTime = typeof completionTime === 'number' ? Math.abs(completionTime) : 0;
    } else {
        finishTime = 0;
    }

    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined || isNaN(seconds)) {
            return 'N/A';
        }
        
        const totalSeconds = Math.floor(Math.abs(seconds));
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        
        return `${m} menit ${s} detik`;
    };

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

                    <View style={styles.scoreSection}>
                        <Text style={styles.sectionTitle}>Ringkasan</Text>
                        <View style={styles.statsRow}>
                            <StatBox label="Score" value={score || 0} />
                        </View>
                    </View>

                    <View style={styles.summarySection}>
                        <View style={styles.statsRow}>
                            <StatBox label="Jawaban Benar" value={totalCorrect || 0} />
                            <StatBox label="Jawaban Salah" value={totalIncorrect || 0} />
                        </View>
                        <StatBox label="Waktu Selesai" value={formatTime(finishTime)} fullWidth={true} />
                    </View>
                </View>
            </ScrollView>

            {/* Tombol Lihat Pembahasan */}
            <View style={styles.footer}>
                <CustomButton
                    title="Lihat Pembahasan"
                    onPress={() => navigation.navigate('Review', { attemptId: attemptId })}
                    style={{ backgroundColor: COLORS.primary }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: '#F7F8FA', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,},
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: pixelSizeHorizontal(20),},
    loadingText: { marginTop: pixelSizeVertical(10), fontSize: fontPixel(16), color: COLORS.gray,},
    errorText: { fontSize: fontPixel(16), color: 'red', textAlign: 'center',},
    header: { paddingVertical: pixelSizeVertical(15), alignItems: 'center', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,},
    headerTitle: { fontSize: fontPixel(20), fontWeight: 'bold',},
    scrollContainer: { paddingBottom: heightPixel(120),},
    mainContent: { padding: pixelSizeHorizontal(20), alignItems: 'center',},
    congratsTitle: { fontSize: fontPixel(22), fontWeight: 'bold', textAlign: 'center', color: COLORS.text, marginBottom: pixelSizeVertical(20),},
    scoreContainer: { width: '100%', alignItems: 'flex-end', marginBottom: pixelSizeVertical(25),},
    scoreText: { fontSize: fontPixel(14), color: COLORS.gray, marginBottom: pixelSizeVertical(8),},
    progressBarBackground: { width: '100%', height: heightPixel(8), backgroundColor: COLORS.borderColor, borderRadius: 4,},
    progressBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4,},
    scoreSection: { width: '100%', alignItems: 'center', marginBottom: pixelSizeVertical(25),},
    summarySection: { width: '100%', marginBottom: pixelSizeVertical(25),},
    sectionTitle: { fontSize: fontPixel(18), fontWeight: 'bold', marginBottom: pixelSizeVertical(15),},
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: pixelSizeVertical(15),},
    statBox: { backgroundColor: COLORS.white, padding: pixelSizeHorizontal(20), borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderColor, width: '48%',},
    fullWidthStatBox: { width: '100%',},
    statLabel: { fontSize: fontPixel(14), color: COLORS.gray,},
    statValue: { fontSize: fontPixel(28), fontWeight: 'bold', marginTop: pixelSizeVertical(8),},
    promoImage: { width: '100%', height: heightPixel(180), borderRadius: 12,},
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: pixelSizeHorizontal(20), paddingTop: pixelSizeVertical(15), paddingBottom: pixelSizeVertical(30), borderTopWidth: 1, borderTopColor: COLORS.borderColor, backgroundColor: COLORS.white,}
});

export default TestResultScreen;