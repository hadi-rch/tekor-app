import React, { useEffect, useState } from 'react'

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
    Platform,
    Modal,
    ActivityIndicator,
    Pressable,
    Alert,
} from 'react-native'
import { COLORS } from '../constants/colors'
import { Ionicons } from '@expo/vector-icons'
import FocusAwareStatusBar from '../components/FocusAwareStatusBar'
import { fontPixel } from '../../helper'
import { LinearGradient } from 'expo-linear-gradient'
import api from '../../api/axiosConfig';
import StyledText from '../components/StyledText'
import { useFocusEffect } from '@react-navigation/native'

// --- Komponen untuk setiap item dalam daftar Test ---
const LessonItem = ({ item, onPress }) => {
    const imageSource = item.image
        ? { uri: item.image }
        : require('../../assets/images/no-image.jpg');
    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <View style={styles.itemTextContainer}>
                <StyledText style={styles.itemTitle}>{item.title}</StyledText>
                <StyledText style={styles.itemDescription}>{item.description}</StyledText>
                {item.status === 'In Progress' && (
                    <View style={styles.inProgressBadge}>
                        <StyledText style={styles.inProgressText}>In Progress</StyledText>
                    </View>
                )}
            </View>
            <Image source={imageSource} style={styles.itemImage} />
        </TouchableOpacity>
    )
};

// --- Komponen untuk setiap item dalam daftar History ---
const HistoryItem = ({ item, navigation }) => (
  <View style={styles.historyItemContainer}>
    <View style={styles.historyHeader}>
      <View>
        <StyledText style={styles.historyTitle}>
          Package ID: {item.packageId}
        </StyledText>
        <StyledText style={styles.historyDate}>
          Start Time: {new Date(item.startTime).toLocaleString()}
        </StyledText>
        <StyledText style={styles.historyDate}>
          End Time: {new Date(item.endTime).toLocaleString()}
        </StyledText>
      </View>
    </View>
    <View style={styles.scoreRow}>
      <StyledText style={styles.scoreLabel}>Score</StyledText>
      <StyledText style={styles.scoreValue}>{item.score}</StyledText>
    </View>
    <View style={styles.buttonContainer}>
      {item.aiEvaluationResult && (
        <TouchableOpacity
          style={styles.viewEvaluationButton}
          onPress={() =>
            navigation.navigate("EvaluationDetail", {
              aiEvaluationResult: item.aiEvaluationResult,
              packageId: item.packageId,
            })
          }
        >
          <StyledText style={styles.viewEvaluationButtonText}>
            Lihat Evaluasi
          </StyledText>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.viewReviewButton}
        onPress={() => navigation.navigate("Review", { attemptId: item.id })}
      >
        <StyledText style={styles.viewEvaluationButtonText}>
          Lihat Jawaban
        </StyledText>
        <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  </View>
);

const WarningItem = ({ icon, text }) => (
    <View style={styles.warningItem}>
        <StyledText style={styles.warningIcon}>{icon}</StyledText>
        <StyledText style={styles.warningText}>{text}</StyledText>
    </View>
);

// --- Komponen Utama LessonsScreen ---
const LessonsScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Test') //Test atau History
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [myTests, setMyTests] = useState([]);
    const [inProgressTests, setInProgressTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [completedTests, setCompletedTests] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    // Handle navigation parameters when screen is focused
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            const state = navigation.getState();
            const currentRoute = state.routes[state.index];

            // Check if we're on the My Try out tab and if there's a setActiveTab parameter
            if (currentRoute.name === 'My Try out' && currentRoute.params?.setActiveTab) {
                setActiveTab(currentRoute.params.setActiveTab);
                // Clear the parameter after using it
                navigation.setParams({ setActiveTab: undefined });
            }
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        const fetchMyTests = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/api/v1/test-attempts/my-tests');
                const readyToStartTests = response.data.data.readyToStart;
                const inProgressTestsData = response.data.data.inProgress;

                const formattedReadyToStart = readyToStartTests.map(item => ({
                    id: item.transactionId,
                    packageId: item.testPackage.id,
                    title: item.testPackage.name,
                    description: item.testPackage.description,
                    image: item.testPackage.imageUrl,
                    transactionId: item.transactionId,
                    status: 'Ready to Start'
                }));

                const formattedInProgress = inProgressTestsData.map(item => ({
                    id: item.attemptId,
                    packageId: item.testPackage.id,
                    title: item.testPackage.name,
                    description: item.testPackage.description,
                    image: item.testPackage.imageUrl,
                    attemptId: item.attemptId,
                    status: 'In Progress'
                }));

                setMyTests(formattedReadyToStart);
                setInProgressTests(formattedInProgress);
            } catch (error) {
                console.error("Gagal mengambil data tes:", error.response?.data || error.message);
                Alert.alert("Error", "Tidak dapat memuat daftar tes Anda.");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchCompletedTests = async () => {
            setIsHistoryLoading(true);
            try {
                // const response = await getCompletedTests();
                const response = await api.get('/api/v1/test-attempts/my-tests/completed');
                const completedData = response.data.data || [];
                setCompletedTests(completedData);
            } catch (error) {
                Alert.alert("Error", "Tidak dapat memuat riwayat tes Anda.");
            } finally {
                setIsHistoryLoading(false);
            }
        };

        if (activeTab === 'Test') {
            fetchMyTests();
        } else if (activeTab === 'History') {
            fetchCompletedTests();
        }
    }, [activeTab]);

    const handleLessonPress = (item) => {
        setSelectedLesson(item);
        setIsModalVisible(true);
    };

    const handleStartTest = async () => {
        console.log("first")
        if (!selectedLesson) return;

        setIsModalVisible(false);
        // try {
        //     // Memulai tes baru, baik itu yang pertama kali atau memulai ulang
        //     console.log("selectedLesson.id : ", selectedLesson)
        //     const response = await api.post(`/api/v1/test-attempts/start/${selectedLesson.packageId}`); // Gunakan packageId
        //     console.log("bingung",response)
        //     const testData = response.data.data;
        //     const a = testData.id;
        //     console.log("bingung2:", testData.id)
        //     navigation.navigate('Test', { a });
        // } catch (error) {
        //     console.error("Gagal memulai tes:", error.response?.data || error.message);
        //     Alert.alert("Error", "Tidak dapat memulai tes. Silakan coba lagi.");
        // }
        navigation.navigate('Test', { packageId: selectedLesson.packageId }); // Gunakan packageId
    };

    const handleContinueTest = () => {
        console.log("hadie")
        if (!selectedLesson || !selectedLesson.attemptId) return;
        console.log("hadie2")

        setIsModalVisible(false);
        navigation.navigate('Test', { attemptId: selectedLesson.attemptId });
    };

    const renderContent = () => {
        if (activeTab === 'Test') {
            if (isLoading) {
                return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />;
            }

            const allTests = [...inProgressTests, ...myTests];
            // console.log("allTests : ", allTests)

            return (
                <FlatList
                    data={allTests}
                    renderItem={({ item }) => <LessonItem item={item} onPress={() => handleLessonPress(item)} />}
                    keyExtractor={(item) => item.id} // Sekarang menggunakan transactionId/attemptId yang unik
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<View style={styles.emptyContainer}><Text>Anda belum memiliki paket tes.</Text></View>}
                />
            )
        } else if (activeTab === 'History') {
            if (isHistoryLoading) {
                return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />;
            }
            return (
                <FlatList
                    data={completedTests}
                    renderItem={({ item }) => <HistoryItem item={item} navigation={navigation} />}
                    keyExtractor={(item) => item.transactionId || item.id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<View style={styles.emptyContainer}><Text>Anda belum memiliki riwayat tes.</Text></View>}
                />
            )
        }
    }

    return (
        <LinearGradient
            colors={['#FDEAEB', '#E6ECF5']}
            style={styles.screenContainer}
        >
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            {/* Header */}
            <View style={styles.header}>
                <StyledText style={styles.headerTitle}>Materi Belajar</StyledText>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Test' && styles.activeTab]}
                    onPress={() => setActiveTab('Test')}
                >
                    <StyledText
                        style={[
                            styles.tabText,
                            activeTab === 'Test' && styles.activeTabText,
                        ]}
                    >
                        Test
                    </StyledText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'History' && styles.activeTab]}
                    onPress={() => setActiveTab('History')}
                >
                    <StyledText
                        style={[
                            styles.tabText,
                            activeTab === 'History' && styles.activeTabText,
                        ]}
                    >
                        History Jawaban
                    </StyledText>
                </TouchableOpacity>
            </View>

            {/* Konten dinamis berdasarkan tab yang aktif */}
            {renderContent()}

            {/* Modal Konfirmasi Mengerjakan */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
                    <Pressable style={styles.confirmModalContent}>
                        <View style={styles.dragHandle} />
                        <StyledText style={styles.modalTitle}>
                            {selectedLesson?.status === 'In Progress' ? 'Lanjutkan Tes?' : 'Anda Yakin Ingin Mengerjakan?'}
                        </StyledText>

                        {selectedLesson?.status !== 'In Progress' && (
                            <View style={styles.warningsContainer}>
                                <WarningItem icon="⚠️" text="Ujian ini hanya bisa dikerjakan 1 (satu) kali. Progres tidak dapat diulang atau dibatalkan setelah dimulai." />
                                <WarningItem icon="⏱️" text="Waktu pengerjaan adalah 50 menit dan timer tidak bisa dijeda (pause)." />
                                <WarningItem icon="📶" text="Pastikan koneksi internet Anda stabil." />
                            </View>
                        )}

                        {selectedLesson?.status === 'In Progress' ? (
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity style={[styles.modalButton, styles.startButton]} onPress={handleContinueTest}>
                                    <StyledText style={styles.startButtonText}>Lanjutkan</StyledText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                                    <StyledText style={styles.cancelButtonText}>Nanti saja</StyledText>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.startButton]} onPress={handleStartTest}>
                                    <StyledText style={styles.startButtonText}>Mulai Sekarang</StyledText>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>

        </LinearGradient>
    )
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    // backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  listContainer: {
    paddingVertical: 10,
  },
  // Styles untuk Test
  itemContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  itemCategory: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: COLORS.text,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  inProgressBadge: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  inProgressText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  // Styles untuk History
  historyItemContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  discussionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  discussion: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginRight: 4,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    marginTop: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  scoreValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "bold",
  },
  viewEvaluationButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewReviewButton: {
    backgroundColor: COLORS.kred,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewEvaluationButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    marginRight: 5,
  },
  //style modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  confirmModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.borderColor,
    borderRadius: 3,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: fontPixel(20),
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },
  warningsContainer: { width: "100%", marginBottom: 25 },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  warningIcon: { fontSize: fontPixel(16), marginRight: 10 },
  warningText: {
    flex: 1,
    fontSize: fontPixel(14),
    color: COLORS.text,
    lineHeight: fontPixel(20),
  },
  modalButtonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: COLORS.secondary, marginRight: 10 },
  startButton: { backgroundColor: COLORS.primary, marginLeft: 10 },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: fontPixel(16),
  },
  startButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: fontPixel(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});

export default LessonsScreen