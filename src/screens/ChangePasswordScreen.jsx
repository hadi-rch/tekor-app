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
import Toast from 'react-native-toast-message';
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
    const [errors, setErrors] = useState({});

    const validateCurrentPassword = (password) => {
        if (!password) return 'Kata sandi saat ini tidak boleh kosong';
        return '';
    };

    const validateNewPassword = (password) => {
        if (!password) return 'Kata sandi baru tidak boleh kosong';
        if (password.length < 8) return 'Kata sandi baru minimal 8 karakter';
        return '';
    };

    const validateConfirmNewPassword = (confirmPassword, password) => {
        if (!confirmPassword) return 'Konfirmasi kata sandi baru tidak boleh kosong';
        if (confirmPassword !== password) return 'Kata sandi tidak cocok';
        return '';
    };

    const validateForm = () => {
        const newErrors = {};
        newErrors.currentPassword = validateCurrentPassword(currentPassword);
        newErrors.newPassword = validateNewPassword(newPassword);
        newErrors.confirmNewPassword = validateConfirmNewPassword(confirmNewPassword, newPassword);

        const filteredErrors = Object.keys(newErrors).reduce((acc, key) => {
            if (newErrors[key]) acc[key] = newErrors[key];
            return acc;
        }, {});

        setErrors(filteredErrors);
        return Object.keys(filteredErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }

        switch (field) {
            case 'currentPassword': setCurrentPassword(value); break;
            case 'newPassword': setNewPassword(value); break;
            case 'confirmNewPassword': setconfirmNewPassword(value); break;
        }
    };

    const handleSaveChanges = async () => {
        Keyboard.dismiss();
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const requestBody = {
                currentPassword: currentPassword,
                newPassword: newPassword,
                confirmNewPassword: confirmNewPassword,
            };

            const response = await api.post('/api/v1/users/change-password', requestBody);

            Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: response.data.message || "Kata sandi Anda telah berhasil diubah.",
                onHide: () => navigation.goBack(),
            });

        } catch (err) {
            // console.error("Change Password Error:", err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.message || 'Gagal mengubah kata sandi. Silakan coba lagi.';
            if (err.response && err.response.status === 400) {
                setErrors(prev => ({ ...prev, currentPassword: errorMessage }));
            } else {
                setErrors(prev => ({ ...prev, form: errorMessage }));
            }
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
                        onChangeText={(value) => handleInputChange('currentPassword', value)}
                        secureTextEntry={!showCurrent}
                        error={errors.currentPassword}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                <Ionicons name={showCurrent ? 'eye-off' : 'eye'} size={fontPixel(22)} color={COLORS.gray} style={styles.eyeIcon} />
                            </TouchableOpacity>
                        }
                    />
                    <CustomTextInput
                        label="Kata Sandi Baru"
                        value={newPassword}
                        onChangeText={(value) => handleInputChange('newPassword', value)}
                        secureTextEntry={!showNew}
                        error={errors.newPassword}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                <Ionicons name={showNew ? 'eye-off' : 'eye'} size={fontPixel(22)} color={COLORS.gray} style={styles.eyeIcon} />
                            </TouchableOpacity>
                        }
                    />
                    <CustomTextInput
                        label="Konfirmasi Kata Sandi Baru"
                        value={confirmNewPassword}
                        onChangeText={(value) => handleInputChange('confirmNewPassword', value)}
                        secureTextEntry={!showConfirm}
                        error={errors.confirmNewPassword}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={fontPixel(22)} color={COLORS.gray} style={styles.eyeIcon} />
                            </TouchableOpacity>
                        }
                    />
                    {errors.form && <Text style={styles.formErrorText}>{errors.form}</Text>}
                </View>

                <CustomButton
                    title={isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    onPress={handleSaveChanges}
                    disabled={isLoading}
                    style={{ backgroundColor: COLORS.primary, marginBottom: pixelSizeVertical(40) }}
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
    formErrorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 16,
        fontSize: fontPixel(14),
    },
});

export default ChangePasswordScreen;
