import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView, Image, Modal, Pressable, FlatList, BackHandler } from 'react-native';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal } from '../../helper';
import { dummyData } from '../constants/dummyData';
import AudioPlayer from '../components/AudioPlayer';
import { Ionicons } from '@expo/vector-icons';

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

// --- Komponen Utama DummyTestScreen ---
const DummyTestScreen = ({ navigation }) => {
    const [testTitle, setTestTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [isNavModalVisible, setIsNavModalVisible] = useState(false);
    const [isExitModalVisible, setIsExitModalVisible] = useState(false);
    const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const timerRef = useRef(null);

    useEffect(() => {
        const initializeTest = () => {
            setIsLoading(true);
            setTestTitle(dummyData?.testPackageName);
            setQuestions(dummyData.questions);
            const initialAnswers = {};
            dummyData.questions.forEach(q => {
                initialAnswers[q.id] = null;
            });
            setUserAnswers(initialAnswers);
            setCurrentQuestionIndex(0);
            setTimeLeft(dummyData.remainingDuration);
            setIsLoading(false);
        };

        initializeTest();
    }, []);

    // --- Timer Logic ---
    useEffect(() => {
        if (isLoading) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    // Auto-submit when time is up
                    confirmSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [isLoading]);

    // --- Back Button Handler ---
    useEffect(() => {
        const backAction = () => {
            setIsExitModalVisible(true);
            return true; // Prevent default behavior
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);


    const handleSelectAnswer = (optionId) => {
        const currentQuestion = questions[currentQuestionIndex];
        setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    };

    const isImageUrl = (text) => {
        return typeof text === 'string' && (text.startsWith('http') && (text.endsWith('.png') || text.endsWith('.jpg') || text.endsWith('.jpeg')));
    };

    const handleExit = () => {
        setIsExitModalVisible(false);
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

    const confirmSubmit = () => {
        setIsSubmitModalVisible(false);
        clearInterval(timerRef.current);

        // Simple result calculation for dummy test
        let score = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correctOptionId) {
                score += 1;
            }
        });

        const totalQuestions = questions.length;
        const finalScore = (score / totalQuestions) * 100;

        // Navigate to a simplified result screen or show an alert
        navigation.replace('DummyReview', { userAnswers });
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading Dummy Test...</Text>
            </View>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
                <Text style={styles.headerTitle}>{testTitle}</Text>
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
                    {currentQuestion.questionImage ? (
                        <Image source={{ uri: currentQuestion.questionImage }} style={styles.questionImage} />
                    ) : null}
                    {/* { console.log("currentQuestion.questionVoice:", currentQuestion.questionVoice) } */}
                    {currentQuestion.questionVoice ? (
                        <AudioPlayer uri={currentQuestion.questionVoice} />
                    ) : null}
                    {/* {typeof currentQuestion.questionVoice === 'string' && currentQuestion.questionVoice ? (
                        <AudioPlayer uri={currentQuestion.questionVoice} />
                    ) : null} */}
                    <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
                </View>

                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option) => {
                        const isSelected = userAnswers[currentQuestion.id] === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.optionButton, isSelected && styles.selectedOption]}
                                onPress={() => handleSelectAnswer(option.id)}
                            >
                                <View style={[styles.radioCircle, isSelected && styles.selectedRadio]}>
                                    {isSelected && <View style={styles.radioInnerCircle} />}
                                </View>
                                <Text style={styles.optionText}>{option.optionText}</Text>
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

            {/* Navigation Modal */}
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
                            keyExtractor={item => item.id}
                            numColumns={5}
                            renderItem={({ item, index }) => {
                                const isCurrent = index === currentQuestionIndex;
                                const isAnswered = userAnswers[item.id] !== null;
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

            {/* Exit Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isExitModalVisible}
                onRequestClose={() => setIsExitModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsExitModalVisible(false)}>
                    <Pressable style={styles.exitModalContent}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.modalTitle}>Yakin Ingin Keluar?</Text>
                        <Text style={styles.modalSubtitle}>
                            Progres tes dummy ini tidak akan disimpan.
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
                                <Text style={styles.exitButtonText}>Ya, Keluar</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Submit Confirmation Modal */}
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
                            Pastikan Anda telah memeriksa semua jawaban.
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
    timerContainer: { backgroundColor: COLORS.secondary, borderRadius: 20, paddingVertical: pixelSizeVertical(5), paddingHorizontal: pixelSizeHorizontal(12), marginBottom: pixelSizeVertical(10), },
    timerText: { color: COLORS.primary, fontWeight: 'bold', fontSize: fontPixel(14) },
    progressText: { fontSize: fontPixel(14), color: COLORS.text, marginBottom: pixelSizeVertical(8), },
    progressBarBackground: { width: '100%', height: heightPixel(8), backgroundColor: '#e9ecef', borderRadius: 4, },
    progressBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4, },
    questionContainer: { backgroundColor: COLORS.white, borderRadius: 12, padding: pixelSizeHorizontal(15), marginBottom: pixelSizeVertical(15), },
    questionImage: { width: '100%', height: heightPixel(180), borderRadius: 8, resizeMode: 'contain', marginBottom: pixelSizeVertical(15) },
    audioPlayer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: pixelSizeHorizontal(10), marginBottom: pixelSizeVertical(15) },
    audioText: { marginLeft: pixelSizeHorizontal(10), fontSize: fontPixel(14), color: COLORS.text },
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
});

export default DummyTestScreen;
