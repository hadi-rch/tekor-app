import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
} from 'react-native'
import { COLORS } from '../constants/colors'
import { Ionicons } from '@expo/vector-icons'
import FocusAwareStatusBar from '../components/FocusAwareStatusBar'

const lessonsData = [
    {
        id: '1',
        category: 'Kumpulan 5 set soal',
        title: 'EPS-TOPIK',
        description: 'Kumpulan 5 set soal eps-topik',
        image: require('../../assets/images/g1.png'),
    },
    {
        id: '2',
        category: 'Kumpulan 10 set soal',
        title: 'EPS-TOPIK',
        description: 'Kumpulan 10 set soal eps-topik',
        image: require('../../assets/images/g2.png'),

    },
    {
        id: '3',
        category: 'Kumpulan 10 set soal',
        title: 'EPS-TOPIK',
        description: 'Kumpulan 10 set soal eps-topik',
        image: require('../../assets/images/g3.png'),
    },
    {
        id: '4',
        category: 'Kumpulan 10 set soal',
        title: 'EPS-TOPIK',
        description: 'Kumpulan 10 set soal eps-topik',
        image: require('../../assets/images/g4.png'),
    },
    {
        id: '5',
        category: 'Kumpulan 10 set soal',
        title: 'EPS-TOPIK',
        description: 'Kumpulan 10 set soal eps-topik',
        image: require('../../assets/images/g2.png'),
    },
]


const historyData = [
    { id: 'h1', title: 'eps-topik soal 1', date: 'Selesai pada 12 Mei 2024', score: '80/100', correct: 32, wrong: 8 },
    { id: 'h2', title: 'eps-topik soal 1', date: 'Selesai pada 12 Mei 2024', score: '80/100', correct: 32, wrong: 8 },
    { id: 'h3', title: 'eps-topik soal 1', date: 'Selesai pada 12 Mei 2024', score: '80/100', correct: 32, wrong: 8 },
];

// --- Komponen untuk setiap item dalam daftar Produk ---
const LessonItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemTextContainer}>
            <Text style={styles.itemCategory}>{item.category}</Text>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
        <Image source={item.image} style={styles.itemImage} />
    </TouchableOpacity>
);

// --- Komponen untuk setiap item dalam daftar History ---
const HistoryItem = ({ item }) => (
    <View style={styles.historyItemContainer}>
        <View style={styles.historyHeader}>
            <View>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historyDate}>{item.date}</Text>
            </View>
            <TouchableOpacity style={styles.discussionButton}>
                <Text style={styles.discussionText}>Lihat Pembahasan</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
            </TouchableOpacity>
        </View>
        <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Skor</Text>
            <Text style={styles.scoreValue}>{item.score}</Text>
        </View>
        <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Benar</Text>
            <Text style={styles.scoreValue}>{item.correct}</Text>
        </View>
        <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Salah</Text>
            <Text style={styles.scoreValue}>{item.wrong}</Text>
        </View>
    </View>
);


// --- Komponen Utama LessonsScreen ---
const LessonsScreen = () => {
    const [activeTab, setActiveTab] = useState('Produk') //Produk atau History

    const renderContent = () => {
        if (activeTab === 'Produk') {
            return (
                <FlatList
                    data={lessonsData}
                    renderItem={({ item }) => <LessonItem item={item} />}
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
        <SafeAreaView style={styles.safeArea}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Materi Belajar</Text>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Produk' && styles.activeTab]}
                    onPress={() => setActiveTab('Produk')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'Produk' && styles.activeTabText,
                        ]}
                    >
                        Produk
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'History' && styles.activeTab]}
                    onPress={() => setActiveTab('History')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'History' && styles.activeTabText,
                        ]}
                    >
                        History Jawaban
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Konten dinamis berdasarkan tab yang aktif */}
            {renderContent()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        padding: 20,
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
        borderBottomColor: COLORS.accent,
    },
    tabText: {
        fontSize: 16,
        color: COLORS.gray,
    },
    activeTabText: {
        color: COLORS.accent,
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
    discussionText: {
        color: COLORS.accent,
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
})

export default LessonsScreen
