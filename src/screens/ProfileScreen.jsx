import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

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
    // Data pengguna (bisa didapat dari state management atau API)
    const user = {
        name: 'Jaehyun Park',
        email: 'jaehyun.park@email.com',
        avatar: require('../../assets/images/g1.png')
    };

    const handleLogout = () => {
        Alert.alert(
            "Keluar",
            "Apakah Anda yakin ingin keluar?",
            [
                {
                    text: "Batal",
                    style: "cancel"
                },
                {
                    text: "Ya, Keluar",
                    onPress: () => {
                        // Kembali ke stack navigator Autentikasi dan reset history
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                    style: 'destructive'
                }
            ]
        );
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
                        onPress={() => { /* Navigasi ke Ganti Kata Sandi */ }}
                    />
                    <ProfileMenuItem
                        icon="log-out-outline"
                        label="Keluar"
                        onPress={handleLogout}
                        isLogout={true}
                    />
                </View>
            </View>
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
    },
});

export default ProfileScreen;
