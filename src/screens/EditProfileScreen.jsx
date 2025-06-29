import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    Pressable,
    Platform,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

// --- Komponen Utama EditProfileScreen ---
const EditProfileScreen = ({ navigation }) => {
    // Data awal pengguna, bisa didapat dari route.params atau state management
    const [fullName, setFullName] = useState('Jaehyun Park');
    // State avatar sekarang bisa string (uri) atau number (require)
    const [avatar, setAvatar] = useState(require('../../assets/images/g4.png'));
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleChangePhoto = () => {
        setIsModalVisible(true); // Buka modal
    };

    const handleSaveChanges = () => {
        // Logika untuk menyimpan perubahan ke API
        console.log("Saving changes:", { fullName, avatar });
        Alert.alert("Profil Disimpan", "Perubahan profil Anda telah berhasil disimpan.");
        navigation.goBack();
    };

    // Fungsi untuk meminta izin dan membuka kamera
    const takePhotoFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Diperlukan', 'Maaf, kami memerlukan izin kamera untuk melanjutkan.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri); // Simpan URI gambar yang diambil
        }

        setIsModalVisible(false);
    }

    // Fungsi untuk meminta izin dan membuka galeri
    const choosePhotoFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Diperlukan', 'Maaf, kami memerlukan izin galeri untuk melanjutkan.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri); // Simpan URI gambar yang dipilih
        }

        setIsModalVisible(false);
    }


    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            {/* Header Kustom */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSaveChanges} style={styles.headerButton}>
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {/* Avatar dan Tombol Ganti Foto */}
                <View style={styles.avatarContainer}>
                    {/* Menyesuaikan source gambar secara dinamis */}
                    <Image
                        source={typeof avatar === 'string' ? { uri: avatar } : avatar}
                        style={styles.avatar}
                    />
                    <TouchableOpacity onPress={handleChangePhoto}>
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Form Input */}
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Mauskan nama lengkap Anda"
                    />
                </View>
            </View>

            {/* Bottom Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => {
                    setIsModalVisible(!isModalVisible);
                }}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsModalVisible(false)} // Menutup modal saat area luar ditekan
                >
                    {/* Menggunakan Pressable agar konten modal tidak ikut menutup saat ditekan */}
                    <Pressable style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Ionicons name="close-circle" size={28} color={COLORS.gray} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButton} onPress={takePhotoFromCamera}>
                            <Text style={styles.modalButtonText}>Ambil Gambar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, { borderBottomWidth: 0 }]} onPress={choosePhotoFromGallery}>
                            <Text style={styles.modalButtonText}>Pilih dari Galeri</Text>
                        </TouchableOpacity>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    saveText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
    },
    changePhotoText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    formContainer: {
        marginTop: 20,
    },
    label: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
    // Style untuk Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
        paddingTop: 40, // Memberi ruang untuk tombol close
    },
    modalButton: {
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    modalButtonText: {
        fontSize: 18,
        color: COLORS.primary,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 15,
        padding: 5,
    },
});

export default EditProfileScreen;
