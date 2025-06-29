import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

// Menerima 'navigation' dan 'route' sebagai props
const ResetLinkSentScreen = ({ navigation, route }) => {
    // Mengambil email yang dikirim dari layar sebelumnya
    const { email } = route.params;

    const handleResendLink = () => {
        // Logika untuk mengirim ulang link, bisa sama dengan di layar sebelumnya
        console.log(`Mengirim ulang link ke: ${email}`);
        // Mungkin tampilkan notifikasi kecil bahwa link sudah dikirim ulang
    };

    const handleBackToLogin = () => {
        // Kembali ke layar paling awal di stack (Login)
        navigation.popToTop();
    };

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <View style={styles.container}>
                {/* Header Kustom */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lupa Kata Sandi</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.content}>
                    {/* Placeholder untuk gambar amplop */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail-open-outline" size={120} color={COLORS.primary} />
                    </View>

                    <Text style={styles.title}>Periksa Email Anda</Text>
                    <Text style={styles.description}>
                        Kami telah mengirimkan tautan untuk mengatur ulang kata sandi Anda ke <Text style={styles.emailText}>{email}</Text>. Tautan ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak melihat email, periksa folder spam Anda.
                    </Text>

                    <TouchableOpacity onPress={handleResendLink}>
                        <Text style={styles.resendLink}>Kirim Ulang</Text>
                    </TouchableOpacity>
                </View>
                <CustomButton
                    title="DEV: Ke Buat Sandi Baru"
                    onPress={() => navigation.navigate('CreateNewPassword')}
                    style={{ marginBottom: 10, backgroundColor: 'green' }}
                />

                <CustomButton
                    title="Kembali ke Halaman Login"
                    onPress={handleBackToLogin}
                    style={styles.backButtonComponent}
                    textStyle={styles.backButtonText}
                />
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
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    iconContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    emailText: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    resendLink: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    backButtonComponent: {
        backgroundColor: COLORS.primary,
    },
    backButtonText: {
        color: COLORS.black,
        fontWeight: 'bold',
    },
});

export default ResetLinkSentScreen;
