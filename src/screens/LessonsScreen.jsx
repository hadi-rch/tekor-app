import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, Platform, Modal, ActivityIndicator, Pressable, RefreshControl } from 'react-native'
import { COLORS } from '../constants/colors'
import { Ionicons } from '@expo/vector-icons'
import FocusAwareStatusBar from '../components/FocusAwareStatusBar'
import { fontPixel } from '../../helper'
import { LinearGradient } from 'expo-linear-gradient'
import api from '../../api/axiosConfig';
import StyledText from '../components/StyledText'
import Toast from 'react-native-toast-message'

// --- Komponen untuk setiap item dalam daftar Test ---
const LessonItem = ({ item, onPress }) => {
  const imageSource = item.image ? { uri: item.image } : { uri: 'https://res.cloudinary.com/dyhlt43k7/image/upload/v1752392053/no-image_mijies.jpg' };

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <View style={styles.itemTextContainer}>
        <StyledText fontType="montserrat" style={styles.itemTitle}>{item.title}</StyledText>
        <StyledText
          fontType="montserrat"
          style={styles.itemDescription}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {item.description}
        </StyledText>
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
        <StyledText fontType="montserrat" style={styles.historyTitle}>
          {item.testPackageName}
        </StyledText>
        <StyledText fontType="montserrat" style={styles.historyDate}>
          Waktu Mulai: {new Date(item.startTime).toLocaleString()}
        </StyledText>
        <StyledText fontType="montserrat" style={styles.historyDate}>
          Waktu Selesai: {new Date(item.endTime).toLocaleString()}
        </StyledText>
      </View>
    </View>
    <View style={styles.scoreRow}>
      <StyledText fontType="montserrat" style={styles.scoreLabel}>Score</StyledText>
      <StyledText fontType="montserrat" style={styles.scoreValue}>{item.score} / 100</StyledText>
    </View>
    <View style={styles.buttonContainer}>
      {item.aiEvaluationResult && (
        <TouchableOpacity
          style={styles.viewEvaluationButton}
          onPress={() =>
            navigation.navigate("EvaluationDetail", {
              aiEvaluationResult: item.aiEvaluationResult,
              testPackageName: item.testPackageName,
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
    <StyledText fontType='montserrat' style={styles.warningText}>{text}</StyledText>
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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const state = navigation.getState();
      const currentRoute = state.routes[state.index];

      if (currentRoute.name === 'My Try out' && currentRoute.params?.setActiveTab) {
        setActiveTab(currentRoute.params.setActiveTab);
        navigation.setParams({ setActiveTab: undefined });
      }
    });

    return unsubscribe;
  }, [navigation]);


  const fetchMyTests = async () => {
    if (!refreshing) setIsLoading(true); // Hanya tampilkan loader utama jika bukan proses refresh
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
      console.log("Gagal mengambil data tes:", error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Gagal mengambil data tes',
        text2: "Tidak dapat memuat daftar tes Anda.",
      });
    } finally {
      if (!refreshing) setIsLoading(false);
    }
  };

  const fetchCompletedTests = async () => {
    if (!refreshing) setIsHistoryLoading(true);
    try {
      const response = await api.get('/api/v1/test-attempts/my-tests/completed');
      const completedData = response.data.data || [];
      setCompletedTests(completedData);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Gagal Mengambil Riwayat tes',
        text2: "Tidak dapat memuat riwayat tes Anda.",
      });
    } finally {
      if (!refreshing) setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Test') {
      fetchMyTests();
    } else if (activeTab === 'History') {
      fetchCompletedTests();
    }
  }, [activeTab]);


  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'Test') {
      await fetchMyTests();
    } else {
      await fetchCompletedTests();
    }
    setRefreshing(false);
  }, [activeTab]);

  const handleLessonPress = (item) => {
    setSelectedLesson(item);
    setIsModalVisible(true);
  };

  const handleStartTest = async () => {
    if (!selectedLesson) return;

    setIsModalVisible(false);
    navigation.navigate('Test', { packageId: selectedLesson.packageId });
  };

  const handleContinueTest = () => {
    if (!selectedLesson || !selectedLesson.attemptId) return;

    setIsModalVisible(false);
    navigation.navigate('Test', { attemptId: selectedLesson.attemptId });
  };

  const renderContent = () => {
    if (activeTab === 'Test') {
      if (isLoading) {
        return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />;
      }

      const allTests = [...inProgressTests, ...myTests];

      return (
        <FlatList
          data={allTests}
          renderItem={({ item }) => <LessonItem item={item} onPress={() => handleLessonPress(item)} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text>Anda belum memiliki paket tes.</Text></View>}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
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
        <StyledText style={styles.headerTitle}>My Try Out</StyledText>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.confirmModalContent}>
            <View style={styles.dragHandle} />
            <StyledText fontType='montserrat' style={styles.modalTitle}>
              {selectedLesson?.status === 'In Progress' ? 'Lanjutkan Tes?' : 'Harap baca dan patuhi ketentuan berikut dengan saksama:'}
            </StyledText>

            {selectedLesson?.status !== 'In Progress' && (
              <View style={styles.warningsContainer}>
                <WarningItem
                  icon="⚠️"
                  text="Ujian ini hanya bisa dikerjakan 1 (satu) kali dan tidak dapat diulang."
                />
                <WarningItem
                  icon="📝"
                  text="Format soal dalam bentuk pilihan ganda berisi 20 soal Membaca (읽기 - Ilgi) dan 20 soal Mendengarkan (듣기 - Teutgi)."
                />
                <WarningItem
                  icon="⏱️"
                  text="Waktu pengerjaan selama 50 menit, waktu tidak bisa dijeda dan waktu akan terus berjalan."
                />
                <WarningItem
                  icon="📶"
                  text="Pastikan koneksi internet Anda stabil."
                />
                <WarningItem
                  icon="🚫"
                  text="Tidak boleh berganti tab atau keluar dari aplikasi, jika terdeteksi keluar dari tab atau aplikasi sebanyak tiga kali, try out akan otomatis tersubmit."
                />
                <WarningItem
                  icon="🔊"
                  text="Audio di setiap soal Mendengarkan (듣기 - Teutgi) hanya dapat diputar satu kali."
                />
                <WarningItem
                  icon="⏰"
                  text="Perhatikan waktu yang ditampilkan. Jika waktu habis, pengerjaan try out akan otomatis tersubmit."
                />
                <WarningItem
                  icon="📊"
                  text="Hasil try out dapat dilihat di profil riwayat try out."
                />
                <StyledText fontType='montserrat' style={styles.modalTitleFooter}>Terima Kasih, Salam Hangat TE-KOR.</StyledText>
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
  screenContainer: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  header: { paddingVertical: 15, paddingHorizontal: 20, alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.text },
  tabContainer: { flexDirection: "row", justifyContent: "space-around", borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  tab: { flex: 1, paddingVertical: 15, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 16, color: COLORS.gray },
  activeTabText: { color: COLORS.primary, fontWeight: "bold" },
  listContainer: { paddingVertical: 10 },
  itemContainer: { backgroundColor: COLORS.white, marginHorizontal: 15, borderRadius: 12, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  itemTextContainer: { flex: 1, marginRight: 15 },
  itemCategory: { fontSize: 12, color: COLORS.gray, marginBottom: 4 },
  itemTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text, marginBottom: 4 },
  itemDescription: { fontSize: 14, color: COLORS.text },
  itemImage: { width: 90, height: 90, borderRadius: 8 },
  inProgressBadge: { marginTop: 8, backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start" },
  inProgressText: { color: COLORS.white, fontSize: 12, fontWeight: "bold" },
  historyItemContainer: { backgroundColor: COLORS.white, marginHorizontal: 15, borderRadius: 12, marginBottom: 12, paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  historyTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.text, marginBottom: 4 },
  historyDate: { fontSize: 14, color: COLORS.gray, marginTop: 2 },
  discussionButton: { flexDirection: "row", alignItems: "center" },
  discussion: { color: COLORS.primary, fontWeight: "bold", marginRight: 4 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, marginTop: 8 },
  scoreLabel: { fontSize: 16, color: COLORS.gray },
  scoreValue: { fontSize: 16, color: COLORS.text, fontWeight: "bold" },
  viewEvaluationButton: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  viewReviewButton: { backgroundColor: COLORS.kred, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  viewEvaluationButtonText: { color: COLORS.white, fontWeight: "bold", marginRight: 5 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  confirmModalContent: { backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, alignItems: "center" },
  dragHandle: { width: 40, height: 5, backgroundColor: COLORS.borderColor, borderRadius: 3, marginBottom: 15 },
  modalTitle: { fontSize: fontPixel(20), fontWeight: "bold", color: COLORS.text, marginBottom: 20 },
  modalTitleFooter: { fontSize: fontPixel(16), fontWeight: "bold", color: COLORS.text, marginBottom: 10, paddingTop: 10, textAlign: "center" },
  warningsContainer: { width: "100%", marginBottom: 25 },
  warningItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 15 },
  warningIcon: { fontSize: fontPixel(16), marginRight: 10 },
  warningText: { flex: 1, fontSize: fontPixel(14), color: COLORS.text, lineHeight: fontPixel(20) },
  modalButtonContainer: { flexDirection: "row", width: "100%", justifyContent: "space-between" },
  modalButton: { flex: 1, paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  cancelButton: { backgroundColor: COLORS.secondary, marginRight: 10 },
  startButton: { backgroundColor: COLORS.primary, marginLeft: 10 },
  cancelButtonText: { color: COLORS.primary, fontWeight: "bold", fontSize: fontPixel(16) },
  startButtonText: { color: COLORS.white, fontWeight: "bold", fontSize: fontPixel(16) },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
});

export default LessonsScreen