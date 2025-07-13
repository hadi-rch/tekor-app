import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, StatusBar, Modal, Pressable, ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, heightPixel, pixelSizeHorizontal, pixelSizeVertical } from '../../helper';
import { LinearGradient } from 'expo-linear-gradient';
import StyledText from '../components/StyledText';

// --- Komponen kecil yang dapat digunakan kembali untuk setiap item menu ---
const ProfileMenuItem = ({ icon, label, onPress, isLogout = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={[styles.iconContainer, isLogout && { backgroundColor: COLORS.secondary }]}>
            <Ionicons
                name={icon}
                size={22}
                color={isLogout ? COLORS.primary : COLORS.gray}
            />
        </View>
        <Text style={[styles.menuLabel, isLogout && { color: COLORS.primary }]}>
            {label}
        </Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.gray} />
    </TouchableOpacity>
);


// --- Komponen Utama ProfileScreen ---
const ProfileScreen = ({ navigation }) => {
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    // Data pengguna (bisa didapat dari state management atau API)
    const dispatch = useDispatch();
    // Ambil data user dan status autentikasi dari state global
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    //seEffect untuk menangani navigasi setelah logout
    useEffect(() => {
        // Jika state isAuthenticated berubah menjadi false (setelah logout),
        // maka reset navigasi ke layar Login.
        if (!isAuthenticated) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        }
    }, [isAuthenticated, navigation]);

    // Fungsi ini sekarang hanya perlu memanggil dispatch
    const handleConfirmLogout = () => {
        dispatch(logout());
        setIsLogoutModalVisible(false);
    };

    const avatarSource = (user && user.imageUrl)
        ? { uri: user.imageUrl }
        : {uri: 'https://res.cloudinary.com/dyhlt43k7/image/upload/v1752392053/no-image_mijies.jpg'}

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#E6ECF5', '#FDEAEB']}
            style={styles.screenContainer}
        >
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            {/* Header */}
            <View style={styles.header}>
                <StyledText style={styles.headerTitle}>Profil</StyledText>
            </View>

            <View style={styles.container}>
                {/* Info Pengguna */}
                <View style={styles.profileInfoContainer}>
                    <Image source={avatarSource} style={styles.avatar} />
                    <StyledText style={styles.userName}>{user.fullName}</StyledText>
                    <StyledText style={styles.userEmail}>{user.email}</StyledText>
                </View>

                {/* Menu Pengaturan */}
                <View style={styles.settingsContainer}>
                    <StyledText style={styles.sectionTitle}>Pengaturan</StyledText>
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
                        <StyledText style={styles.modalTitle}>Anda Yakin Ingin Keluar</StyledText>
                        <StyledText style={styles.modalSubtitle}>
                            Anda perlu masuk kembali untuk mengakses progres dan kelas anda
                        </StyledText>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsLogoutModalVisible(false)}
                            >
                                <StyledText style={styles.cancelButtonText}>Batal</StyledText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.logoutButton]}
                                onPress={handleConfirmLogout}
                            >
                                <StyledText style={styles.logoutButtonText}>Ya Keluar</StyledText>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,},
    header: { paddingVertical: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,},
    headerTitle: { fontSize: 20, fontWeight: 'bold',},
    container: { flex: 1, paddingHorizontal: 20,},
    profileInfoContainer: { alignItems: 'center', paddingTop: 30,},
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15,},
    userName: { fontSize: 22, fontWeight: 'bold', color: COLORS.text,},
    userEmail: { fontSize: 16, color: COLORS.gray, marginTop: 5,},
    settingsContainer: { marginTop: 20,},
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 10,},
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15,},
    iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginRight: 15,},
    menuLabel: { flex: 1, fontSize: 16, color: COLORS.text,}, modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)',},
    logoutModalContent: { backgroundColor: 'white', borderTopLeftRadius: pixelSizeHorizontal(20), borderTopRightRadius: pixelSizeHorizontal(20), padding: pixelSizeHorizontal(20), alignItems: 'center',},
    dragHandle: { width: pixelSizeHorizontal(40), height: heightPixel(5), backgroundColor: COLORS.borderColor, borderRadius: heightPixel(3), marginBottom: pixelSizeVertical(15),},
    modalTitle: { fontSize: fontPixel(20), fontWeight: 'bold', color: COLORS.text, marginBottom: pixelSizeVertical(8),},
    modalSubtitle: { fontSize: fontPixel(14), color: COLORS.gray, textAlign: 'center', marginBottom: pixelSizeVertical(25), lineHeight: fontPixel(20),},
    modalButtonContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between',},
    modalButton: { flex: 1, paddingVertical: pixelSizeVertical(15), borderRadius: pixelSizeHorizontal(12), alignItems: 'center',},
    cancelButton: { backgroundColor: COLORS.secondary, marginRight: pixelSizeHorizontal(10),},
    logoutButton: { backgroundColor: COLORS.primary, marginLeft: pixelSizeHorizontal(10),},
    cancelButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: fontPixel(16),},
    logoutButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: fontPixel(16),},
});

export default ProfileScreen;
