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
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel } from '../../helper';

// --- Data Dummy Soal ---
const dummyQuestions = Array.from({ length: 40 }, (_, i) => {
    const isReading = i < 20;
    const questionNumber = i + 1;
    return {
        id: questionNumber,
        type: isReading ? 'reading' : 'listening',
        question: `Ini adalah pertanyaan nomor ${questionNumber}. Pilih jawaban yang paling tepat.`,
        image: isReading && i < 5 ? require('../../assets/images/g3.png') : null,
        audio: !isReading ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' : null,
        options: ['Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D'],
        correctAnswer: i % 4,
    };
});


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

// PERBAIKAN 2: Memperbarui komponen AudioPlayer dengan API baru
const AudioPlayer = ({ uri }) => {
    const soundRef = useRef(new Audio.Sound());
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Fungsi cleanup untuk unload audio saat komponen di-unmount
        const sound = soundRef.current;
        return () => {
            console.log('Unloading Sound');
            sound.unloadAsync();
        };
    }, []);

    async function playSound() {
        if (isPlaying) return; // Mencegah pemutaran ganda

        try {
            console.log('Loading Sound');
            await soundRef.current.loadAsync({ uri });
            soundRef.current.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    soundRef.current.unloadAsync();
                }
            });
            console.log('Playing Sound');
            await soundRef.current.playAsync();
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    return (
        <TouchableOpacity style={styles.audioPlayer} onPress={playSound}>
            <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={fontPixel(32)} color={COLORS.primary} />
            <Text style={styles.audioText}>Audio {isPlaying ? '(Memutar)' : ''}</Text>
        </TouchableOpacity>
    );
};


// --- Komponen Utama TestScreen ---
const TestScreen = ({ navigation }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(50 * 60);
    const [userAnswers, setUserAnswers] = useState({});
    const [isNavModalVisible, setIsNavModalVisible] = useState(false);
    const [isExitModalVisible, setIsExitModalVisible] = useState(false);
    const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);

    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const handleSelectAnswer = (optionIndex) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    };


    const handleExit = () => {
        clearInterval(timerRef.current);
        navigation.goBack();
    };


    const handleNext = () => {
        if (currentQuestionIndex < dummyQuestions.length - 1) {
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
        clearInterval(timerRef.current);
        setIsSubmitModalVisible(true);
    };

    const confirmSubmit = () => {
        setIsSubmitModalVisible(false); // Tutup modal
        clearInterval(timerRef.current);
        let correctCount = 0;
        dummyQuestions.forEach((question, index) => {
            if (userAnswers[index] === question.correctAnswer) {
                correctCount++;
            }
        });

        const totalQuestions = dummyQuestions.length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        const wrongCount = totalQuestions - correctCount;
        const timeSpentInSeconds = (50 * 60) - timeLeft;
        const timeTaken = `${Math.floor(timeSpentInSeconds / 60)} menit`;

        // Navigasi ke layar hasil dengan membawa data
        navigation.replace('TestResult', {
            score: score,
            correctAnswers: correctCount,
            wrongAnswers: wrongCount,
            timeTaken: timeTaken,
            userAnswers: userAnswers,
        });
    };

    const currentQuestion = dummyQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / dummyQuestions.length) * 100;

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
                    <Text style={styles.progressText}>Pertanyaan {currentQuestionIndex + 1}/{dummyQuestions.length}</Text>
                    <View style={styles.progressBarBackground}><View style={[styles.progressBar, { width: `${progress}%` }]} /></View>
                </View>

                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>
                    {currentQuestion.type === 'reading' && currentQuestion.image && (
                        <Image source={currentQuestion.image} style={styles.questionImage} />
                    )}
                    {currentQuestion.type === 'listening' && currentQuestion.audio && (
                        <AudioPlayer uri={currentQuestion.audio} />
                    )}
                </View>

                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = userAnswers[currentQuestionIndex] === index;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.optionButton, isSelected && styles.selectedOption]}
                                onPress={() => handleSelectAnswer(index)}
                            >
                                <View style={[styles.radioCircle, isSelected && styles.selectedRadio]}>
                                    {isSelected && <View style={styles.radioInnerCircle} />}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
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
                {currentQuestionIndex < dummyQuestions.length - 1 ? (
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
                            data={dummyQuestions}
                            keyExtractor={item => item.id.toString()}
                            numColumns={5}
                            renderItem={({ item, index }) => {
                                const isCurrent = index === currentQuestionIndex;
                                const isAnswered = userAnswers[index] !== undefined;
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
                                        ]}>{item.id}</Text>
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
    timerContainer: { backgroundColor: '#FFF0F0', borderRadius: 20, paddingVertical: pixelSizeVertical(5), paddingHorizontal: pixelSizeHorizontal(12), marginBottom: pixelSizeVertical(10), },
    timerText: { color: COLORS.accent, fontWeight: 'bold', fontSize: fontPixel(14) },
    progressText: { fontSize: fontPixel(14), color: COLORS.text, marginBottom: pixelSizeVertical(8), },
    progressBarBackground: { width: '100%', height: heightPixel(8), backgroundColor: '#e9ecef', borderRadius: 4, },
    progressBar: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4, },
    questionContainer: { backgroundColor: COLORS.white, borderRadius: 12, padding: pixelSizeHorizontal(15), marginBottom: pixelSizeVertical(15), },
    questionText: { fontSize: fontPixel(16), color: COLORS.text, lineHeight: fontPixel(24), marginBottom: pixelSizeVertical(15), },
    questionImage: { width: '100%', height: heightPixel(180), borderRadius: 8, resizeMode: 'contain' },
    audioPlayer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: pixelSizeHorizontal(10), },
    audioText: { marginLeft: pixelSizeHorizontal(10), fontSize: fontPixel(14), color: COLORS.text },
    optionsContainer: { backgroundColor: COLORS.white, borderRadius: 12, padding: pixelSizeHorizontal(15), },
    optionButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderColor, borderRadius: 8, padding: pixelSizeHorizontal(15), marginBottom: pixelSizeVertical(10), },
    selectedOption: { borderColor: COLORS.accent, backgroundColor: '#FFF0F0' },
    radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.borderColor, alignItems: 'center', justifyContent: 'center', marginRight: 15, },
    selectedRadio: { borderColor: COLORS.accent },
    radioInnerCircle: { height: 10, width: 10, borderRadius: 5, backgroundColor: COLORS.accent, },
    optionText: { flex: 1, fontSize: fontPixel(16), color: COLORS.text },
    footer: { flexDirection: 'row', justifyContent: 'space-between', padding: pixelSizeHorizontal(15), borderTopWidth: 1, borderTopColor: COLORS.borderColor, backgroundColor: COLORS.white },
    footerButton: { flex: 1, paddingVertical: pixelSizeVertical(15), borderRadius: 8, alignItems: 'center', marginBottom: pixelSizeVertical(50), },
    prevButton: { backgroundColor: '#e9ecef', marginRight: 10, },
    prevButtonText: { color: COLORS.text, fontWeight: 'bold', fontSize: fontPixel(16), },
    nextButton: { backgroundColor: COLORS.accent, },
    nextButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: fontPixel(16), },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', },
    navModalContent: { width: '90%', backgroundColor: 'white', borderRadius: 15, padding: pixelSizeHorizontal(20), maxHeight: '80%' },
    navModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: pixelSizeVertical(20), },
    navModalTitle: { fontSize: fontPixel(18), fontWeight: 'bold', },
    navGridItem: { width: '18%', aspectRatio: 1, margin: '1%', borderRadius: 100, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderColor, },
    navGridCurrent: { backgroundColor: COLORS.accent, borderColor: COLORS.accent, },
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
    cancelButton: { backgroundColor: COLORS.buttonSecondary, marginRight: pixelSizeHorizontal(10), },
    exitButton: { backgroundColor: COLORS.accent, marginLeft: pixelSizeHorizontal(10), },
    cancelButtonText: { color: COLORS.accent, fontWeight: 'bold', fontSize: fontPixel(16), },
    exitButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: fontPixel(16), },
});

export default TestScreen;
