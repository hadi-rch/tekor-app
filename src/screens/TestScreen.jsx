import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    Image,
    Modal,
    Pressable,
    FlatList,
    AppState,
    BackHandler,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal } from '../../helper';
import { startTestAttempt, getTestAttemptDetails, submitAnswer, submitTestAttempt } from '../../services/testService';

// --- Komponen-komponen Kecil ---
const Timer = ({ timeLeft }) => {
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };
    return (
        <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
    );
};

const AudioPlayer = ({ uri, questionId, playedAudios, setPlayedAudios }) => {
    const player = useAudioPlayer(uri);
    const status = useAudioPlayerStatus(player);
    const hasBeenPlayed = playedAudios.includes(questionId);

    const handlePlayAudio = async () => {
        try {
            // Jika audio sudah pernah diputar, tidak bisa diputar lagi
            if (hasBeenPlayed) {
                return;
            }

            if (status.isLoaded && !status.playing) {
                // Tandai audio sebagai sudah diputar
                setPlayedAudios(prev => [...prev, questionId]);

                // Putar audio
                await player.play();

                // Listener untuk ketika audio selesai
                player.addListener('playbackStatusUpdate', (playbackStatus) => {
                    if (playbackStatus.didJustFinish) {
                        // Audio selesai diputar, tidak perlu melakukan apa-apa
                        // Karena sudah ditandai sebagai played
                    }
                });
            }
        } catch (error) {
            console.warn('Audio playback error:', error);
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.audioPlayer,
                hasBeenPlayed && styles.audioPlayerPlayed
            ]}
            onPress={handlePlayAudio}
            disabled={hasBeenPlayed && !status.playing}
        >
            <Ionicons
                name={status.playing ? "volume-high" : (hasBeenPlayed ? "checkmark-circle" : "play-circle")}
                size={fontPixel(32)}
                color={hasBeenPlayed ? "#666" : COLORS.primary}
            />
            <Text style={[
                styles.audioText,
                hasBeenPlayed && styles.audioTextPlayed
            ]}>
                {status.playing ? 'Audio sedang diputar...' :
                    hasBeenPlayed ? 'Audio sudah diputar' : 'Putar Audio'}
            </Text>
        </TouchableOpacity>
    );
};

// --- Komponen Utama TestScreen ---
const TestScreen = ({ route, navigation }) => {
    const { packageId } = route.params;
    // console.log("packageId received in TestScreen:", packageId);
    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(50 * 60);
    const [userAnswers, setUserAnswers] = useState({});
    const [isNavModalVisible, setIsNavModalVisible] = useState(false);
    const [isExitModalVisible, setIsExitModalVisible] = useState(false);
    const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [playedAudios, setPlayedAudios] = useState([]);

    // --- State untuk Deteksi Kecurangan ---
    const [leaveAttempts, setLeaveAttempts] = useState(3);
    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const appState = useRef(AppState.currentState);

    const timerRef = useRef(null);

    useEffect(() => {
        const initializeTest = async () => {
            try {
                console.log("hadi")
                console.log("packageId", packageId)
                const startResponse = await startTestAttempt(packageId);
                console.log("lossssss")
                const newAttemptId = startResponse.data.id;
                setAttemptId(newAttemptId);

                const detailsResponse = await getTestAttemptDetails(newAttemptId);
                setQuestions(detailsResponse.data.questions);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to initialize test:", error);
                // Handle error, e.g., show an alert and navigate back
                Alert.alert("Error", "Gagal memulai tes. Silakan coba lagi.", [
                    { text: "OK", onPress: () => navigation.goBack() },
                ]);
            }
        };

        initializeTest();
    }, [packageId]);



    // --- Logika untuk AppState ---
    useEffect(() => {
        // Mencegat tombol kembali di Android
        const backAction = () => {
            setIsExitModalVisible(true); // Tampilkan modal konfirmasi keluar
            return true; // Mencegah aplikasi keluar
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('App has come to the foreground!');
            } else if (nextAppState.match(/inactive|background/)) {
                // App masuk ke background
                handleAppLeave();
            }
            appState.current = nextAppState;
        });

        return () => {
            backHandler.remove();
            subscription.remove();
        };
    }, [leaveAttempts]);

    const handleAppLeave = () => {
        if (leaveAttempts <= 0) return; // Jika sudah di-force submit, abaikan

        const newAttempts = leaveAttempts - 1;
        setLeaveAttempts(newAttempts);

        if (newAttempts > 0) {
            setWarningMessage(`Anda telah keluar dari ujian. Kesempatan tersisa: ${newAttempts} kali.`);
            setIsWarningModalVisible(true);
        } else {
            // Kesempatan habis, paksa submit
            forceSubmit();
        }
    };

    const forceSubmit = () => {
        setWarningMessage('Anda telah kehabisan kesempatan. Ujian akan dikumpulkan secara otomatis.');
        setIsWarningModalVisible(true);
        // Menunggu sejenak agar user bisa membaca pesan sebelum submit
        setTimeout(() => {
            setIsWarningModalVisible(false);
            confirmSubmit(true); // Kirim flag 'force'
        }, 3000);
    };

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const handleSelectAnswer = async (optionId) => {
        const currentQuestion = questions[currentQuestionIndex];
        setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));

        try {
            const response = await submitAnswer(attemptId, currentQuestion.id, optionId, timeLeft);
            // You might want to update the timeLeft based on the response
        } catch (error) {
            console.error("Failed to submit answer:", error);
            // Handle error, maybe show a toast or an alert
            Alert.alert("Error", "Gagal mengirim jawaban. Silakan periksa koneksi Anda.");
        }
    };

    const isImageUrl = (text) => {
        return typeof text === 'string' && (text.startsWith('http') && (text.endsWith('.png') || text.endsWith('.jpg') || text.endsWith('.jpeg')));
    };

    const handleExit = () => {
        clearInterval(timerRef.current);
        navigation.goBack();
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const jumpToQuestion = (index) => {
        setCurrentQuestionIndex(index);
        setIsNavModalVisible(false);
    };

    const handleSubmit = () => {
        setIsSubmitModalVisible(true);
    };

    const confirmSubmit = async (isForced = false) => {
        if (!isForced) setIsSubmitModalVisible(false);
        clearInterval(timerRef.current);

        try {
            const response = await submitTestAttempt(attemptId);
            if (response.status === "OK" && response.data) {
                // Navigasi ke halaman hasil dengan membawa data hasil tes
                navigation.replace('TestResult', {
                    testResult: response.data,
                    attemptId: attemptId, // Juga kirim attemptId jika diperlukan untuk review
                });
            } else {
                throw new Error(response.message || "Gagal mengirimkan hasil tes.");
            }
        } catch (error) {
            console.error("Failed to submit test:", error);
            Alert.alert("Error", "Gagal mengirimkan hasil tes. Silakan coba lagi.", [
                { text: "OK", onPress: () => setIsSubmitModalVisible(true) }, // Buka kembali modal jika gagal
            ]);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = isLoading ? 0 : ((currentQuestionIndex + 1) / questions.length) * 100;

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => setIsExitModalVisible(true)} style={styles.headerButton}>
                    <Ionicons name="close" size={fontPixel(28)} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tes</Text>
                <TouchableOpacity onPress={() => setIsNavModalVisible(true)} style={styles.headerButton}>
                    <Ionicons name="grid" size={fontPixel(24)} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.topSection}>
                    <Timer timeLeft={timeLeft} />
                    <Text style={styles.progressText}>Pertanyaan {currentQuestionIndex + 1}/{questions.length}</Text>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                </View>

                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
                    {currentQuestion.imageUrl && (
                        <Image source={{ uri: currentQuestion.imageUrl }} style={styles.questionImage} />
                    )}
                    {currentQuestion.audioUrl && (
                        <AudioPlayer
                            uri={currentQuestion.audioUrl}
                            questionId={currentQuestion.id}
                            playedAudios={playedAudios}
                            setPlayedAudios={setPlayedAudios}
                        />
                    )}
                </View>

                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option) => {
                        const isSelected = userAnswers[currentQuestion.id] === option.id;
                        const isOptionImage = isImageUrl(option.optionText);

                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.optionButton, isSelected && styles.selectedOption, isOptionImage && styles.imageOptionButton]}
                                onPress={() => handleSelectAnswer(option.id)}
                            >
                                <View style={[styles.radioCircle, isSelected && styles.selectedRadio]}>
                                    {isSelected && <View style={styles.radioInnerCircle} />}
                                </View>
                                
                                {isOptionImage ? (
                                    <Image source={{ uri: option.optionText }} style={styles.optionImage} />
                                ) : (
                                    <Text style={styles.optionText}>{option.optionText}</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {currentQuestionIndex > 0 && (
                    <TouchableOpacity style={[styles.footerButton, styles.prevButton]} onPress={handlePrevious}>
                        <Text style={styles.prevButtonText}>Sebelumnya</Text>
                    </TouchableOpacity>
                )}
                {currentQuestionIndex < questions.length - 1 ? (
                    <TouchableOpacity style={[styles.footerButton, styles.nextButton]} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>Berikutnya</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.footerButton, styles.nextButton]} onPress={handleSubmit}>
                        <Text style={styles.nextButtonText}>Submit</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isNavModalVisible}
                onRequestClose={() => setIsNavModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsNavModalVisible(false)}>
                    <Pressable style={styles.navModalContent}>
                        <View style={styles.navModalHeader}>
                            <Text style={styles.navModalTitle}>Navigasi Soal</Text>
                            <TouchableOpacity onPress={() => setIsNavModalVisible(false)}>
                                <Ionicons name="close" size={fontPixel(24)} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={questions}
                            keyExtractor={item => item.id.toString()}
                            numColumns={5}
                            renderItem={({ item, index }) => {
                                const isCurrent = index === currentQuestionIndex;
                                const isAnswered = userAnswers[item.id] !== undefined;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.navGridItem,
                                            isCurrent && styles.navGridCurrent,
                                            !isCurrent && isAnswered && styles.navGridAnswered,
                                        ]}
                                        onPress={() => jumpToQuestion(index)}
                                    >
                                        <Text style={[
                                            styles.navGridText,
                                            isCurrent && styles.navGridTextCurrent,
                                            !isCurrent && isAnswered && styles.navGridTextAnswered,
                                        ]}>{index + 1}</Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Modal Konfirmasi Keluar */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isExitModalVisible}
                onRequestClose={() => setIsExitModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsExitModalVisible(false)}>
                    <Pressable style={styles.exitModalContent}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.modalTitle}>Yakin Ingin Keluar dari Ujian?</Text>
                        <Text style={styles.modalSubtitle}>
                            Progres Anda untuk ujian ini tidak akan tersimpan. Anda harus memulai kembali dari awal jika keluar sekarang.
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsExitModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.exitButton]}
                                onPress={handleExit}
                            >
                                <Text style={styles.exitButtonText}>Ya Keluar</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Modal Konfirmasi Submit */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isSubmitModalVisible}
                onRequestClose={() => setIsSubmitModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsSubmitModalVisible(false)}>
                    <Pressable style={styles.exitModalContent}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.modalTitle}>Kumpulkan Jawaban?</Text>
                        <Text style={styles.modalSubtitle}>
                            Pastikan Anda telah memeriksa semua jawaban. Anda tidak dapat mengubah jawaban setelah dikumpulkan.
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsSubmitModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Periksa Kembali</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.exitButton]}
                                onPress={confirmSubmit}
                            >
                                <Text style={styles.exitButtonText}>Ya, Kumpulkan</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Modal Peringatan Keluar Aplikasi */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isWarningModalVisible}
            >
                <Pressable style={styles.modalOverlay} onPress={() => { if (leaveAttempts > 0) setIsWarningModalVisible(false) }}>
                    <Pressable>
                        <View style={styles.warningModalContent}>
                            <Ionicons name="warning" size={fontPixel(48)} color="#f0ad4e" />
                            <Text style={styles.warningTitle}>Peringatan</Text>
                            <Text style={styles.warningText}>{warningMessage}</Text>
                            {leaveAttempts > 0 && (
                                <TouchableOpacity
                                    style={styles.warningButton}
                                    onPress={() => setIsWarningModalVisible(false)}
                                >
                                    <Text style={styles.warningButtonText}>Saya Mengerti</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: pixelSizeVertical(10), paddingHorizontal: pixelSizeHorizontal(15), backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor, },
    headerButton: { padding: pixelSizeHorizontal(5), },
    headerTitle: { fontSize: fontPixel(18), fontWeight: 'bold', },
    scrollContainer: { paddingHorizontal: pixelSizeHorizontal(15), paddingTop: pixelSizeVertical(15), paddingBottom: pixelSizeVertical(100) },
    topSection: { backgroundColor: COLORS.white, borderRadius: 12, padding: pixelSizeHorizontal(15), marginBottom: pixelSizeVertical(15), alignItems: 'center', },
    timerContainer: { backgroundColor: COLORS.secondary, borderRadius: 20, paddingVertical: pixelSizeVertical(5), paddingHorizontal: pixelSizeHorizontal(12), marginBottom: pixelSizeVertical(10), },
    timerText: { color: COLORS.primary, fontWeight: 'bold', fontSize: fontPixel(14) },
    progressText: { fontSize: fontPixel(14), color: COLORS.text, marginBottom: pixelSizeVertical(8), },
    progressBarBackground: { width: '100%', height: heightPixel(8), backgroundColor: '#e9ecef', borderRadius: 4, },
    progressBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4, },
    questionContainer: { backgroundColor: COLORS.white, borderRadius: 12, padding: pixelSizeHorizontal(15), marginBottom: pixelSizeVertical(15), },
    questionText: { fontSize: fontPixel(18), color: COLORS.text, lineHeight: fontPixel(24), marginBottom: pixelSizeVertical(15), },
    questionImage: { width: '100%', height: heightPixel(180), borderRadius: 8, resizeMode: 'contain' },
    audioPlayer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: pixelSizeHorizontal(10), },
    audioPlayerPlayed: { backgroundColor: '#e0e0e0', },
    audioText: { marginLeft: pixelSizeHorizontal(10), fontSize: fontPixel(14), color: COLORS.text },
    audioTextPlayed: { color: '#666', },
    optionsContainer: { backgroundColor: COLORS.white, borderRadius: 12, padding: pixelSizeHorizontal(15), },
    optionButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderColor, borderRadius: 8, padding: pixelSizeHorizontal(15), marginBottom: pixelSizeVertical(10), },
    selectedOption: { borderColor: COLORS.primary, backgroundColor: COLORS.secondary },
    radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.borderColor, alignItems: 'center', justifyContent: 'center', marginRight: 15, },
    selectedRadio: { borderColor: COLORS.primary },
    radioInnerCircle: { height: 10, width: 10, borderRadius: 5, backgroundColor: COLORS.primary, },
    optionText: { flex: 1, fontSize: fontPixel(16), color: COLORS.text },
    footer: { flexDirection: 'row', justifyContent: 'space-between', padding: pixelSizeHorizontal(15), borderTopWidth: 1, borderTopColor: COLORS.borderColor, backgroundColor: COLORS.white },
    footerButton: { flex: 1, paddingVertical: pixelSizeVertical(15), borderRadius: 8, alignItems: 'center', marginBottom: pixelSizeVertical(50), },
    prevButton: { backgroundColor: '#e9ecef', marginRight: 10, },
    prevButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: fontPixel(16), },
    nextButton: { backgroundColor: COLORS.primary, },
    nextButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: fontPixel(16), },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', },
    navModalContent: { width: '90%', backgroundColor: 'white', borderRadius: 15, padding: pixelSizeHorizontal(20), maxHeight: '80%' },
    navModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: pixelSizeVertical(20), },
    navModalTitle: { fontSize: fontPixel(18), fontWeight: 'bold', },
    navGridItem: { width: '18%', aspectRatio: 1, margin: '1%', borderRadius: 100, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderColor, },
    navGridCurrent: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, },
    navGridAnswered: { backgroundColor: '#e0e7ff', borderColor: '#a5b4fc', },
    navGridText: { fontSize: fontPixel(16), color: COLORS.text },
    navGridTextCurrent: { color: COLORS.white, fontWeight: 'bold' },
    navGridTextAnswered: { color: COLORS.primary, fontWeight: 'bold' },
    // Exit & Submit Modal Styles
    exitModalContent: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: pixelSizeHorizontal(20), alignItems: 'center', },
    dragHandle: { width: pixelSizeHorizontal(40), height: heightPixel(5), backgroundColor: COLORS.borderColor, borderRadius: heightPixel(3), marginBottom: pixelSizeVertical(15), },
    modalTitle: { fontSize: fontPixel(20), fontWeight: 'bold', color: COLORS.text, marginBottom: pixelSizeVertical(8), textAlign: 'center' },
    modalSubtitle: { fontSize: fontPixel(14), color: COLORS.gray, textAlign: 'center', marginBottom: pixelSizeVertical(25), lineHeight: fontPixel(20), },
    modalButtonContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', },
    modalButton: { flex: 1, paddingVertical: pixelSizeVertical(15), borderRadius: pixelSizeHorizontal(12), alignItems: 'center', },
    cancelButton: { backgroundColor: COLORS.secondary, marginRight: pixelSizeHorizontal(10), },
    exitButton: { backgroundColor: COLORS.primary, marginLeft: pixelSizeHorizontal(10), },
    cancelButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: fontPixel(16), },
    exitButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: fontPixel(16), },
    // Warning Modal Styles
    warningModalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: pixelSizeHorizontal(20),
        alignItems: 'center',
    },
    warningTitle: {
        fontSize: fontPixel(20),
        fontWeight: 'bold',
        marginTop: pixelSizeVertical(10),
        marginBottom: pixelSizeVertical(10),
    },
    warningText: {
        fontSize: fontPixel(16),
        textAlign: 'center',
        marginBottom: pixelSizeVertical(20),
        color: COLORS.gray,
    },
    warningButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: pixelSizeVertical(12),
        paddingHorizontal: pixelSizeHorizontal(30),
        borderRadius: 8,
    },
    warningButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: fontPixel(16),
    },
    imageOptionButton: {
        paddingVertical: pixelSizeVertical(10),
    },
    optionImage: {
        flex: 1,
        height: heightPixel(80),
        resizeMode: 'contain',
        borderRadius: 8,
    },
});

export default TestScreen;