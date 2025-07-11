import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Image, ActivityIndicator, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import FocusAwareStatusBar from "../components/FocusAwareStatusBar";
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal, widthPixel } from "../../helper";
import api from "../../api/axiosConfig";
import StyledText from "../components/StyledText";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

const AudioPlayer = ({ uri }) => {
    const player = useAudioPlayer(uri);
    const status = useAudioPlayerStatus(player);

    const handlePlayAudio = async () => {
        try {
            if (!status?.isLoaded) return;

            const isFinished =
                status.didJustFinish || status.positionMillis >= status.durationMillis;

            if (isFinished) {
                await player.seekTo(0);
            }

            await player.play();
        } catch (error) {
            console.warn("Audio playback error:", error);
        }
    };

    return (
        <TouchableOpacity style={[styles.audioPlayer]} onPress={handlePlayAudio}>
            <Ionicons
                name={status.playing ? "volume-high" : "play-circle"}
                size={fontPixel(32)}
                color={COLORS.primary}
            />
            <Text style={[styles.audioText]}>
                {status.playing ? "Audio sedang diputar..." : "Putar Audio"}
            </Text>
        </TouchableOpacity>
    );
};

const isImageUrl = (text) => {
    return (
        typeof text === "string" &&
        text.startsWith("http") &&
        (text.endsWith(".png") || text.endsWith(".jpg") || text.endsWith(".jpeg"))
    );
};

const ReviewScreen = ({ navigation, route }) => {
    const { attemptId } = route.params;
    const [reviewData, setReviewData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playedAudios, setPlayedAudios] = useState([]);

    useEffect(() => {
        const fetchReviewData = async () => {
            try {
                const response = await api.get(
                    `/api/v1/test-attempts/${attemptId}/review`
                );
                setReviewData(response.data.data);
            } catch (err) {
                console.error(
                    "Failed to fetch review data:",
                    err.response?.data || err.message
                );
                setError("Failed to load review data. Please try again.");
                Alert.alert("Error", "Failed to load review data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        if (attemptId) {
            fetchReviewData();
        } else {
            setError("No attempt ID provided.");
            setIsLoading(false);
        }
    }, [attemptId]);

    const renderQuestionItem = ({ item: question, index }) => {
        return (
            <View style={styles.questionContainer}>
                <View>
                    <StyledText
                        style={{ marginBottom: 5, fontWeight: "bold", fontSize: 18 }}
                    >
                        {question.isCorrect ? "Benar" : "Salah"}
                    </StyledText>
                </View>
                <View style={styles.questionHeader}>
                    <View
                        style={[
                            styles.indicator,
                            {
                                backgroundColor: question.isCorrect ? "#28a745" : COLORS.danger,
                            },
                        ]}
                    />
                    <StyledText style={styles.questionText}>
                        {index + 1}. {question.questionText}
                    </StyledText>
                </View>

                {question.questionImage && (
                    <Image
                        source={{ uri: question.questionImage }}
                        style={styles.questionImage}
                    />
                )}
                {question.questionAudio && (
                    <AudioPlayer
                        uri={question.questionAudio}
                        questionId={question.questionId}
                        playedAudios={playedAudios}
                        setPlayedAudios={setPlayedAudios}
                    />
                )}

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
                                                        ? "#34E55D"
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
                <StyledText style={styles.headerTitle}>Pembahasan Tes</StyledText>
                <View style={{ width: fontPixel(28) }} />
            </View>

            {isLoading ? (
                <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                    style={styles.loadingIndicator}
                />
            ) : error ? (
                <View style={styles.errorContainer}>
                    <StyledText style={styles.errorText}>{error}</StyledText>
                </View>
            ) : reviewData && reviewData.questions.length > 0 ? (
                <FlatList
                    data={reviewData.questions}
                    renderItem={renderQuestionItem}
                    keyExtractor={(item) => item.questionId}
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
    screenContainer: { flex: 1, backgroundColor: "#F7F8FA", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: pixelSizeVertical(15), paddingHorizontal: pixelSizeHorizontal(15), backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor, },
    headerButton: { padding: pixelSizeHorizontal(5), },
    headerTitle: { fontSize: fontPixel(20), fontWeight: "bold", },
    loadingIndicator: { flex: 1, justifyContent: "center", alignItems: "center", },
    errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, },
    errorText: { fontSize: fontPixel(16), color: COLORS.primary, textAlign: "center", },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, },
    emptyText: { fontSize: fontPixel(16), color: COLORS.gray, textAlign: "center", },
    listContentContainer: { padding: pixelSizeHorizontal(20), paddingBottom: pixelSizeVertical(20), },
    questionContainer: { backgroundColor: COLORS.white, borderRadius: 12, padding: pixelSizeHorizontal(15), marginBottom: pixelSizeVertical(20), borderWidth: 1, borderColor: COLORS.borderColor, },
    questionHeader: { flexDirection: "row", marginBottom: pixelSizeVertical(15), },
    indicator: { width: widthPixel(5), height: "100%", borderRadius: 3, marginRight: pixelSizeHorizontal(10), },
    questionText: { flex: 1, fontSize: fontPixel(16), lineHeight: fontPixel(24), },
    questionImage: { width: "100%", height: heightPixel(180), borderRadius: 8, resizeMode: "contain", marginBottom: pixelSizeVertical(15), },
    audioPlayer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: 8, padding: pixelSizeHorizontal(10), marginBottom: pixelSizeVertical(15), },
    audioPlayerPlayed: { backgroundColor: "#e0e0e0", },
    audioText: { marginLeft: pixelSizeHorizontal(10), fontSize: fontPixel(14), color: COLORS.text, },
    audioTextPlayed: { color: "#666", },
    optionsContainer: { marginBottom: pixelSizeVertical(25), },
    optionButton: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.borderColor, backgroundColor: COLORS.white, borderRadius: 12, padding: pixelSizeHorizontal(15), marginBottom: pixelSizeVertical(10), },
    imageOptionButton: { paddingVertical: pixelSizeVertical(10), },
    optionImage: { flex: 1, height: heightPixel(80), resizeMode: "contain", borderRadius: 8, },
    correctOption: { borderColor: "#28a745", backgroundColor: "#e9f7ef", },
    wrongOption: { borderColor: "#dc3545", backgroundColor: "#fbe9eb", },
    radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.borderColor, alignItems: "center", justifyContent: "center", marginRight: 15, },
    correctRadio: { borderColor: "#28a745", },
    wrongRadio: { borderColor: "#dc3545", },
    radioInnerCircle: { height: 10, width: 10, borderRadius: 15, },
    optionText: { flex: 1, fontSize: fontPixel(16), color: COLORS.text, },
    correctText: { color: "#28a745", fontWeight: "bold", },
    wrongText: { color: "#dc3545", fontWeight: "bold", },
    explanationContainer: { backgroundColor: COLORS.white, borderRadius: 12, padding: pixelSizeHorizontal(15), borderWidth: 1, borderColor: COLORS.borderColor, },
    explanationTitle: { fontSize: fontPixel(16), fontWeight: "bold", marginBottom: pixelSizeVertical(8), },
    explanationText: { fontSize: fontPixel(14), lineHeight: fontPixel(22), color: COLORS.gray, },
});

export default ReviewScreen;
