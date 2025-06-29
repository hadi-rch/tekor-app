import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableOpacity,
    Alert,
    Platform,
    StatusBar,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, heightPixel, pixelSizeHorizontal, pixelSizeVertical } from '../../helper';

// --- Komponen kecil yang dapat digunakan kembali untuk setiap item menu ---
const ProfileMenuItem = ({ icon, label, onPress, isLogout = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={[styles.iconContainer, isLogout && { backgroundColor: '#FFF0F0' }]}>
            <Ionicons
                name={icon}
                size={22}
                color={isLogout ? COLORS.accent : COLORS.gray}
            />
        </View>
        <Text style={[styles.menuLabel, isLogout && { color: COLORS.accent }]}>
            {label}
        </Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.gray} />
    </TouchableOpacity>
);


// --- Komponen Utama ProfileScreen ---
const ProfileScreen = ({ navigation }) => {
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    // Data pengguna (bisa didapat dari state management atau API)
    const user = {
        name: 'Jaehyun Park',
        email: 'jaehyun.park@email.com',
        avatar: require('../../assets/images/g1.png')
    };

    const handleLogout = () => {
        // Kembali ke stack navigator Autentikasi dan reset history
        setIsLogoutModalVisible(false); // Tutup modal dulu
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil</Text>
            </View>

            <View style={styles.container}>
                {/* Info Pengguna */}
                <View style={styles.profileInfoContainer}>
                    <Image source={user.avatar} style={styles.avatar} />
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                </View>

                {/* Menu Pengaturan */}
                <View style={styles.settingsContainer}>
                    <Text style={styles.sectionTitle}>Pengaturan</Text>
                    <ProfileMenuItem
                        icon="receipt-outline"
                        label="Riwayat transaksi"
                        onPress={() => navigation.navigate('TransactionHistory')}
                    />
                    <ProfileMenuItem
                        icon="create-outline"
                        label="Edit Profil"
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <ProfileMenuItem
                        icon="lock-closed-outline"
                        label="Ganti kata sandi"
                        onPress={() => navigation.navigate('ChangePassword')}
                    />
                    <ProfileMenuItem
                        icon="log-out-outline"
                        label="Keluar"
                        onPress={() => setIsLogoutModalVisible(true)}
                        isLogout={true}
                    />
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isLogoutModalVisible}
                onRequestClose={() => setIsLogoutModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsLogoutModalVisible(false)}
                >
                    <Pressable style={styles.logoutModalContent}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.modalTitle}>Anda Yakin Ingin Keluar</Text>
                        <Text style={styles.modalSubtitle}>
                            Anda perlu masuk kembali untuk mengakses progres dan kelas anda
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsLogoutModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.logoutButton]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.logoutButtonText}>Ya Keluar</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileInfoContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 16,
        color: COLORS.gray,
        marginTop: 5,
    },
    settingsContainer: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    }, modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    logoutModalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: pixelSizeHorizontal(20),
        borderTopRightRadius: pixelSizeHorizontal(20),
        padding: pixelSizeHorizontal(20),
        alignItems: 'center',
    },
    dragHandle: {
        width: pixelSizeHorizontal(40),
        height: heightPixel(5),
        backgroundColor: COLORS.borderColor,
        borderRadius: heightPixel(3),
        marginBottom: pixelSizeVertical(15),
    },
    modalTitle: {
        fontSize: fontPixel(20),
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: pixelSizeVertical(8),
    },
    modalSubtitle: {
        fontSize: fontPixel(14),
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: pixelSizeVertical(25),
        lineHeight: fontPixel(20),
    },
    modalButtonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: pixelSizeVertical(15),
        borderRadius: pixelSizeHorizontal(12),
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.buttonSecondary,
        marginRight: pixelSizeHorizontal(10),
    },
    logoutButton: {
        backgroundColor: COLORS.accent,
        marginLeft: pixelSizeHorizontal(10),
    },
    cancelButtonText: {
        color: COLORS.accent,
        fontWeight: 'bold',
        fontSize: fontPixel(16),
    },
    logoutButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: fontPixel(16),
    },
});

export default ProfileScreen;
