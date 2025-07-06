import React, { useState } from 'react'
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
    Pressable,
} from 'react-native'
import { COLORS } from '../constants/colors'
import { Ionicons } from '@expo/vector-icons'
import FocusAwareStatusBar from '../components/FocusAwareStatusBar'
import { fontPixel } from '../../helper'
import { LinearGradient } from 'expo-linear-gradient'
import StyledText from '../components/StyledText'

const lessonsData = [
    {
        id: '1',
        category: 'Kumpulan 5 set soal',
        title: 'EPS-TOPIK',
        description: 'Kumpulan 5 set soal eps-topik',
        image: require('../../assets/images/no-image.jpg'),
    },
    {
        id: '2',
        category: 'Kumpulan 10 set soal',
        title: 'EPS-TOPIK',
        description: 'Kumpulan 10 set soal eps-topik',
        image: require('../../assets/images/no-image.jpg'),

    },
    {
        id: '3',
        category: 'Kumpulan 10 set soal',
        title: 'EPS-TOPIK',
        description: 'Kumpulan 10 set soal eps-topik',
        image: require('../../assets/images/no-image.jpg'),
    },
    {
        id: '4',
        category: 'Kumpulan 10 set soal',
        title: 'EPS-TOPIK',
        description: 'Kumpulan 10 set soal eps-topik',
        image: require('../../assets/images/no-image.jpg'),
    },
    {
        id: '5',
        category: 'Kumpulan 10 set soal',
        title: 'EPS-TOPIK',
        description: 'Kumpulan 10 set soal eps-topik',
        image: require('../../assets/images/no-image.jpg'),
    },
]


const historyData = [
    { id: 'h1', title: 'eps-topik soal 1', date: 'Selesai pada 12 Mei 2024', score: '80/100', correct: 32, wrong: 8 },
    { id: 'h2', title: 'eps-topik soal 1', date: 'Selesai pada 12 Mei 2024', score: '80/100', correct: 32, wrong: 8 },
    { id: 'h3', title: 'eps-topik soal 1', date: 'Selesai pada 12 Mei 2024', score: '80/100', correct: 32, wrong: 8 },
];

// --- Komponen untuk setiap item dalam daftar Produk ---
const LessonItem = ({ item, onPress }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <View style={styles.itemTextContainer}>
            <StyledText style={styles.itemCategory}>{item.category}</StyledText>
            <StyledText style={styles.itemTitle}>{item.title}</StyledText>
            <StyledText style={styles.itemDescription}>{item.description}</StyledText>
        </View>
        <Image source={item.image} style={styles.itemImage} />
    </TouchableOpacity>
);

// --- Komponen untuk setiap item dalam daftar History ---
const HistoryItem = ({ item }) => (
    <View style={styles.historyItemContainer}>
        <View style={styles.historyHeader}>
            <View>
                <StyledText style={styles.historyTitle}>{item.title}</StyledText>
                <StyledText style={styles.historyDate}>{item.date}</StyledText>
            </View>
            <TouchableOpacity style={styles.discussionButton}>
                <StyledText style={styles.discussion}>Lihat Pembahasan</StyledText>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
        <View style={styles.scoreRow}>
            <StyledText style={styles.scoreLabel}>Skor</StyledText>
            <StyledText style={styles.scoreValue}>{item.score}</StyledText>
        </View>
        <View style={styles.scoreRow}>
            <StyledText style={styles.scoreLabel}>Benar</StyledText>
            <StyledText style={styles.scoreValue}>{item.correct}</StyledText>
        </View>
        <View style={styles.scoreRow}>
            <StyledText style={styles.scoreLabel}>Salah</StyledText>
            <StyledText style={styles.scoreValue}>{item.wrong}</StyledText>
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
    const [activeTab, setActiveTab] = useState('Produk') //Produk atau History
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);

    const handleLessonPress = (item) => {
        setSelectedLesson(item);
        setIsModalVisible(true);
    };

    const handleStartTest = () => {
        console.log("Mulai mengerjakan:", selectedLesson.title);
        setIsModalVisible(false);
        navigation.navigate('Test', { lesson: selectedLesson });
    };

    const renderContent = () => {
        if (activeTab === 'Produk') {
            return (
                <FlatList
                    data={lessonsData}
                    renderItem={({ item }) => <LessonItem item={item} onPress={() => handleLessonPress(item)} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )
        } else if (activeTab === 'History') {
            return (
                <FlatList
                    data={historyData}
                    renderItem={({ item }) => <HistoryItem item={item} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
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
                    style={[styles.tab, activeTab === 'Produk' && styles.activeTab]}
                    onPress={() => setActiveTab('Produk')}
                >
                    <StyledText
                        style={[
                            styles.tabText,
                            activeTab === 'Produk' && styles.activeTabText,
                        ]}
                    >
                        Produk
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
                        <StyledText style={styles.modalTitle}>Anda Yakin Ingin Mengerjakan?</StyledText>

                        <View style={styles.warningsContainer}>
                            <WarningItem icon="⚠️" text="Ujian ini hanya bisa dikerjakan 1 (satu) kali. Progres tidak dapat diulang atau dibatalkan setelah dimulai." />
                            <WarningItem icon="⏱️" text="Waktu pengerjaan adalah 50 menit dan timer tidak bisa dijeda (pause)." />
                            <WarningItem icon="📶" text="Pastikan koneksi internet Anda stabil." />
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                                <StyledText style={styles.cancelButtonText}>Nanti saja</StyledText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.startButton]} onPress={handleStartTest}>
                                <StyledText style={styles.startButtonText}>Mulai Sekarang</StyledText>
                            </TouchableOpacity>
                        </View>
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
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
        fontWeight: 'bold',
    },
    listContainer: {
        paddingVertical: 10,
    },
    // Styles untuk Produk
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 14,
        color: COLORS.text,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    // Styles untuk History
    historyItemContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    historyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    historyDate: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 2,
    },
    discussionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    discussion: {
        color: COLORS.primary,
        fontWeight: 'bold',
        marginRight: 4,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    scoreLabel: {
        fontSize: 14,
        color: COLORS.gray,
    },
    scoreValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    //style modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', },
    confirmModalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, alignItems: 'center', },
    dragHandle: { width: 40, height: 5, backgroundColor: COLORS.borderColor, borderRadius: 3, marginBottom: 15, },
    modalTitle: { fontSize: fontPixel(20), fontWeight: 'bold', color: COLORS.text, marginBottom: 20, },
    warningsContainer: { width: '100%', marginBottom: 25, },
    warningItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15, },
    warningIcon: { fontSize: fontPixel(16), marginRight: 10, },
    warningText: { flex: 1, fontSize: fontPixel(14), color: COLORS.text, lineHeight: fontPixel(20), },
    modalButtonContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', },
    modalButton: { flex: 1, paddingVertical: 15, borderRadius: 12, alignItems: 'center', },
    cancelButton: { backgroundColor: COLORS.secondary, marginRight: 10, },
    startButton: { backgroundColor: COLORS.primary, marginLeft: 10, },
    cancelButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: fontPixel(16), },
    startButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: fontPixel(16), },
})

export default LessonsScreen
