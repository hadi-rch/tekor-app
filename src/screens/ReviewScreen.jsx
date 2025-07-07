import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel } from '../../helper';

// --- Data Dummy (Harus sama dengan yang digunakan di TestScreen) ---
const dummyQuestions = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    type: i < 20 ? 'reading' : 'listening',
    question: `Ini adalah pertanyaan nomor ${i + 1}. Pilih jawaban yang paling tepat.`,
    image: i < 5 ? require('../../assets/images/no-image.jpg') : null,
    audio: i >= 20 ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' : null,
    options: ['Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D'],
    correctAnswer: i % 4,
    explanation: `Penjelasan untuk soal nomor ${i + 1}. Opsi yang benar adalah karena lorem ipsum dolor sit amet, consectetur adipiscing elit.`
}));


// --- Komponen Utama ReviewScreen ---
const ReviewScreen = ({ navigation, route }) => {
    // Menerima jawaban pengguna dari layar sebelumnya
    const { userAnswers } = route.params || { userAnswers: { 0: 0, 1: 2, 2: 3, 14: 0 } }; // Contoh jawaban
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

    const currentQuestion = dummyQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    const correctAnswer = currentQuestion.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="close" size={fontPixel(28)} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pembahasan</Text>
                <View style={{ width: fontPixel(28) }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.progressText}>Pertanyaan {currentQuestionIndex + 1}/{dummyQuestions.length}</Text>
                <View style={styles.questionHeader}>
                    <View style={[styles.indicator, { backgroundColor: isCorrect ? '#28a745' : COLORS.primary }]} />
                    <Text style={styles.questionText}>{currentQuestion.id}. {currentQuestion.question}</Text>
                </View>

                {currentQuestion.image && (
                    <Image source={currentQuestion.image} style={styles.questionImage} />
                )}

                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => {
                        const isUserAnswer = userAnswer === index;
                        const isCorrectAnswer = correctAnswer === index;
                        let optionStyle = styles.optionButton;
                        let radioStyle = styles.radioCircle;
                        let textStyle = styles.optionText;

                        if (isCorrectAnswer) {
                            optionStyle = [optionStyle, styles.correctOption];
                            radioStyle = [radioStyle, styles.correctRadio];
                            textStyle = [textStyle, styles.correctText];
                        }
                        if (isUserAnswer && !isCorrectAnswer) {
                            optionStyle = [optionStyle, styles.wrongOption];
                            radioStyle = [radioStyle, styles.wrongRadio];
                            textStyle = [textStyle, styles.wrongText];
                        }

                        return (
                            <View key={index} style={optionStyle}>
                                <View style={radioStyle}>
                                    {isUserAnswer && <View style={styles.radioInnerCircle} />}
                                </View>
                                <Text style={textStyle}>{option}</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.explanationContainer}>
                    <Text style={styles.explanationTitle}>Penjelasan</Text>
                    <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.footerButton, styles.prevButton, currentQuestionIndex === 0 && styles.disabledButton]}
                    onPress={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    <Text style={styles.prevButtonText}>Sebelumnya</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.footerButton, styles.nextButton, currentQuestionIndex === dummyQuestions.length - 1 && styles.disabledButton]}
                    onPress={handleNext}
                    disabled={currentQuestionIndex === dummyQuestions.length - 1}
                >
                    <Text style={styles.nextButtonText}>Berikutnya</Text>
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
        paddingHorizontal: pixelSizeHorizontal(15),
        backgroundColor: COLORS.white,
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
    scrollContainer: {
        padding: pixelSizeHorizontal(20),
        paddingBottom: heightPixel(120),
    },
    progressText: {
        fontSize: fontPixel(16),
        fontWeight: '500',
        color: COLORS.gray,
        marginBottom: pixelSizeVertical(15),
    },
    questionHeader: {
        flexDirection: 'row',
        marginBottom: pixelSizeVertical(15),
    },
    indicator: {
        width: widthPixel(5),
        height: '100%',
        borderRadius: 3,
        marginRight: pixelSizeHorizontal(10),
    },
    questionText: {
        flex: 1,
        fontSize: fontPixel(16),
        lineHeight: fontPixel(24),
    },
    questionImage: {
        width: '100%',
        height: heightPixel(200),
        borderRadius: 12,
        marginBottom: pixelSizeVertical(20),
        resizeMode: 'contain',
        backgroundColor: COLORS.white,
    },
    optionsContainer: {
        marginBottom: pixelSizeVertical(25),
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: pixelSizeHorizontal(15),
        marginBottom: pixelSizeVertical(10),
    },
    correctOption: {
        borderColor: '#28a745',
        backgroundColor: '#e9f7ef',
    },
    wrongOption: {
        borderColor: '#dc3545',
        backgroundColor: '#fbe9eb',
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    correctRadio: {
        borderColor: '#28a745',
    },
    wrongRadio: {
        borderColor: '#dc3545',
    },
    radioInnerCircle: {
        height: 10,
        width: 10,
        borderRadius: 15,
        backgroundColor: '#34E55D', // Default merah
    },
    optionText: {
        flex: 1,
        fontSize: fontPixel(16),
        color: COLORS.text,
    },
    correctText: {
        color: '#28a745',
        fontWeight: 'bold',
    },
    wrongText: {
        color: '#dc3545',
        fontWeight: 'bold',
    },
    explanationContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: pixelSizeHorizontal(15),
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    explanationTitle: {
        fontSize: fontPixel(16),
        fontWeight: 'bold',
        marginBottom: pixelSizeVertical(8),
    },
    explanationText: {
        fontSize: fontPixel(14),
        lineHeight: fontPixel(22),
        color: COLORS.gray,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: pixelSizeHorizontal(20),
        paddingTop: pixelSizeVertical(15),
        paddingBottom: pixelSizeVertical(50),
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    },
    footerButton: {
        flex: 1,
        paddingVertical: pixelSizeVertical(15),
        borderRadius: 12,
        alignItems: 'center',
    },
    prevButton: {
        backgroundColor: COLORS.secondary,
        marginRight: 10,
    },
    prevButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: fontPixel(16),
    },
    nextButton: {
        backgroundColor: COLORS.primary,
    },
    nextButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: fontPixel(16),
    },
    disabledButton: {
        opacity: 0.5,
    }
});

export default ReviewScreen;
