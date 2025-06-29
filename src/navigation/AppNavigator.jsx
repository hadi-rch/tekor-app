import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { COLORS } from '../constants/colors';

// Import semua layar Autentikasi
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetLinkSentScreen from '../screens/ResetLinkSentScreen';
import CreateNewPasswordScreen from '../screens/CreateNewPasswordScreen';

// Import Navigator Utama (yang berisi Tab)
import MainTabNavigator from './MainTabNavigator';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>

            <Stack.Navigator
                initialRouteName="Login" // Aplikasi dimulai dari halaman Login
                screenOptions={{ headerShown: false }}
            >
                {/* Grup Layar untuk Autentikasi */}
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetLinkSent" component={ResetLinkSentScreen} />
                <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />

                {/* Layar untuk Aplikasi Utama (setelah login) */}
                {/* MainTabNavigator diperlakukan sebagai satu layar tunggal di sini */}
                <Stack.Screen name="MainApp" component={MainTabNavigator} />
                <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
