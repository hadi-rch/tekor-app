import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel, } from '../../helper';
import StyledText from '../components/StyledText';
import { dummyData } from '../constants/dummyData';
import AudioPlayer from '../components/AudioPlayer';

const DummyReviewScreen = ({ navigation, route }) => {
    const { userAnswers } = route.params;
    const [reviewData, setReviewData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const isImageUrl = (text) => {
        return (
            typeof text === 'string' &&
            text.startsWith('http') &&
            (text.endsWith('.png') || text.endsWith('.jpg') || text.endsWith('.jpeg'))
        );
    };

    useEffect(() => {
        const processReviewData = () => {
            const questions = dummyData.questions.map(q => {
                const userAnswerId = userAnswers[q.id];
                const isCorrect = userAnswerId === q.correctOptionId;
                return {
                    ...q,
                    selectedOptionId: userAnswerId,
                    isCorrect,
                };
            });

            setReviewData({ questions });
            setIsLoading(false);
        };

        processReviewData();
    }, [userAnswers]);

    const renderQuestionItem = ({ item: question, index }) => {
        return (
            <View style={styles.questionContainer}>
                <View>
                    <StyledText
                        style={{
                            marginBottom: 5,
                            fontWeight: 'bold',
                            fontSize: 18,
                            color: question.isCorrect ? '#28a745' : COLORS.danger,
                        }}
                    >
                        {question.isCorrect ? 'Benar' : 'Salah'}
                    </StyledText>
                </View>
                <View style={styles.questionHeader}>
                    <View
                        style={[
                            styles.indicator,
                            {
                                backgroundColor: question.isCorrect ? '#28a745' : COLORS.danger,
                            },
                        ]}
                    />
                    <StyledText style={styles.questionText}>
                        {index + 1}. {question.questionText}
                    </StyledText>
                </View>

                {question.questionImage ? (
                    <Image source={{ uri: question.questionImage }} style={styles.questionImage} />
                ) : null}
                {typeof question.questionVoice === 'string' && question.questionVoice ? (
                    <AudioPlayer uri={question.questionVoice} />
                ) : null}

                <View style={styles.optionsContainer}>
                    {question.options.map((option) => {
                        const isUserAnswer = question.selectedOptionId === option.id;
                        const isCorrectAnswer = question.correctOptionId === option.id;
                        let optionStyle = styles.optionButton;
                        let radioStyle = styles.radioCircle;
                        let textStyle = styles.optionText;
                        const isOptionImage = isImageUrl(option.optionText);

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
                            <View
                                key={option.id}
                                style={[optionStyle, isOptionImage && styles.imageOptionButton]}
                            >
                                <View style={radioStyle}>
                                    {isUserAnswer && (
                                        <View
                                            style={[
                                                styles.radioInnerCircle,
                                                {
                                                    backgroundColor: isCorrectAnswer
                                                        ? '#34E55D'
                                                        : COLORS.primary,
                                                },
                                            ]}
                                        />
                                    )}
                                </View>

                                {isOptionImage ? (
                                    <Image
                                        source={{ uri: option.optionText }}
                                        style={styles.optionImage}
                                    />
                                ) : (
                                    <StyledText style={textStyle}>{option.optionText}</StyledText>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerButton}
                >
                    <Ionicons name="close" size={fontPixel(28)} color={COLORS.text} />
                </TouchableOpacity>
                <StyledText style={styles.headerTitle}>Pembahasan Tes Dummy</StyledText>
                <View style={{ width: fontPixel(28) }} />
            </View>

            {isLoading ? (
                <View style={styles.loadingIndicator}>
                    <Text>Loading review...</Text>
                </View>
            ) : reviewData && reviewData.questions.length > 0 ? (
                <FlatList
                    data={reviewData.questions}
                    renderItem={renderQuestionItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContentContainer}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <StyledText style={styles.emptyText}>
                        Tidak ada data pembahasan yang tersedia.
                    </StyledText>
                </View>
            )}
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
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: fontPixel(16),
        color: COLORS.gray,
        textAlign: 'center',
    },
    listContentContainer: {
        padding: pixelSizeHorizontal(20),
        paddingBottom: pixelSizeVertical(20),
    },
    questionContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: pixelSizeHorizontal(15),
        marginBottom: pixelSizeVertical(20),
        borderWidth: 1,
        borderColor: COLORS.borderColor,
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
    questionImage: { width: '100%', height: heightPixel(180), borderRadius: 8, resizeMode: 'contain', marginBottom: pixelSizeVertical(15) },
    audioPlayer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: pixelSizeHorizontal(10), marginBottom: pixelSizeVertical(15) },
    audioText: { marginLeft: pixelSizeHorizontal(10), fontSize: fontPixel(14), color: COLORS.text },
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
    imageOptionButton: {
        paddingVertical: pixelSizeVertical(10),
    },
    optionImage: {
        flex: 1,
        height: heightPixel(80),
        resizeMode: 'contain',
        borderRadius: 8,
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
});

export default DummyReviewScreen;
