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
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { fontPixel, heightPixel, pixelSizeVertical, pixelSizeHorizontal } from '../../helper';


// --- Komponen Utama ChangePasswordScreen ---
const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setconfirmNewPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveChanges = async () => {
        Keyboard.dismiss();
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert("Error", "Semua kolom harus diisi.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Error", "Kata sandi baru dan konfirmasi tidak cocok.");
            return;
        }
        if (newPassword.length < 8 && confirmNewPassword.length < 8) {
            Alert.alert("Error", "Kata sandi baru minimal 8 karakter.");
            return;
        }
        console.log("diluar try catch")

        setIsLoading(true);
        try {
            const requestBody = {
                currentPassword: currentPassword,
                newPassword: newPassword,
                confirmNewPassword: confirmNewPassword,
            };
            
            console.log("first: ")
            const response = await api.post('/api/v1/users/change-password', requestBody);
            console.log("second: ")

            Alert.alert("Berhasil", response.data.message || "Kata sandi Anda telah berhasil diubah.", [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (err) {
            console.error("Change Password Error:", err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.message || 'Gagal mengubah kata sandi. Silakan coba lagi.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
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

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
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
                        value={confirmNewPassword}
                        onChangeText={setconfirmNewPassword}
                        secureTextEntry={!showConfirm}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={fontPixel(22)} color={COLORS.gray} style={styles.eyeIcon} />
                            </TouchableOpacity>
                        }
                    />
                </View>

                <CustomButton
                    title={isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    onPress={handleSaveChanges}
                    disabled={isLoading}
                    style={{ backgroundColor: COLORS.primary, marginTop: pixelSizeVertical(40) }}
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
