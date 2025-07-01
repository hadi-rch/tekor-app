import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal } from '../../helper';

// --- Komponen untuk Indikator Kekuatan Kata Sandi ---
const PasswordStrengthIndicator = ({ strength }) => {
    const getStrengthInfo = () => {
        switch (strength) {
            case 1:
                return { text: 'Lemah', color: '#dc3545', width: '25%' };
            case 2:
                return { text: 'Sedang', color: '#ffc107', width: '50%' };
            case 3:
                return { text: 'Kuat', color: '#28a745', width: '100%' };
            default:
                return { text: 'Lemah', color: '#6c757d', width: '0%' };
        }
    };

    const { text, color, width } = getStrengthInfo();

    return (
        <View style={styles.strengthContainer}>
            <Text style={styles.strengthLabel}>Kekuatan Kata Sandi: <Text style={{ color, fontWeight: 'bold' }}>{text}</Text></Text>
            <View style={styles.strengthBarBackground}>
                <View style={[styles.strengthBar, { width, backgroundColor: color }]} />
            </View>
        </View>
    );
};


// --- Komponen Utama ChangePasswordScreen ---
const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState(0);

    // Cek kekuatan kata sandi setiap kali diubah
    useEffect(() => {
        let strength = 0;
        if (newPassword.length >= 8) strength++;
        if (newPassword.match(/[A-Z]/) && newPassword.match(/[a-z]/)) strength++;
        if (newPassword.match(/[0-9]/) && newPassword.match(/[^A-Za-z0-9]/)) strength++;
        setPasswordStrength(strength > 3 ? 3 : strength);
    }, [newPassword]);


    const handleSaveChanges = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Semua kolom harus diisi.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Kata sandi baru dan konfirmasi tidak cocok.");
            return;
        }
        if (passwordStrength < 2) {
            Alert.alert("Error", "Kata sandi baru terlalu lemah.");
            return;
        }

        console.log("Menyimpan kata sandi baru...");
        Alert.alert("Berhasil", "Kata sandi Anda telah berhasil diubah.", [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={fontPixel(24)} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ubah Kata Sandi</Text>
                <View style={{ width: fontPixel(24) }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View>
                    <CustomTextInput
                        label="Kata Sandi Saat Ini"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={!showCurrent}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                <Ionicons name={showCurrent ? 'eye-off' : 'eye'} size={fontPixel(22)} color={COLORS.gray} style={styles.eyeIcon} />
                            </TouchableOpacity>
                        }
                    />
                    <CustomTextInput
                        label="Kata Sandi Baru"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNew}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                <Ionicons name={showNew ? 'eye-off' : 'eye'} size={fontPixel(22)} color={COLORS.gray} style={styles.eyeIcon} />
                            </TouchableOpacity>
                        }
                    />
                    <CustomTextInput
                        label="Konfirmasi Kata Sandi Baru"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirm}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={fontPixel(22)} color={COLORS.gray} style={styles.eyeIcon} />
                            </TouchableOpacity>
                        }
                    />
                    <PasswordStrengthIndicator strength={passwordStrength} />
                </View>

                <CustomButton
                    title="Simpan Perubahan"
                    onPress={handleSaveChanges}
                    style={{ backgroundColor: COLORS.primary, marginTop: pixelSizeVertical(40), marginBottom: pixelSizeVertical(50), }}
                />
            </ScrollView>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: pixelSizeVertical(15),
        paddingHorizontal: pixelSizeHorizontal(20),
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
    scrollContainer: {
        flexGrow: 1,
        padding: pixelSizeHorizontal(20),
        justifyContent: 'space-between',
    },
    eyeIcon: {
        padding: pixelSizeHorizontal(10),
    },
    strengthContainer: {
        marginTop: pixelSizeVertical(20),
    },
    strengthLabel: {
        fontSize: fontPixel(14),
        color: COLORS.text,
        marginBottom: pixelSizeVertical(8),
    },
    strengthBarBackground: {
        height: heightPixel(8),
        backgroundColor: '#e9ecef',
        borderRadius: heightPixel(4),
    },
    strengthBar: {
        height: '100%',
        borderRadius: heightPixel(4),
    },
});

export default ChangePasswordScreen;
