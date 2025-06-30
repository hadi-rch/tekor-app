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
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import TestScreen from '../screens/TestScreen';
import FlipCardGameScreen from '../screens/FlipCardGameScreen';
import GameCategoryScreen from '../screens/GameCategoryScreen';
import MemoryCardGameScreen from '../screens/MemoryCardGameScreen';
import TestResultScreen from '../screens/TestResultScreen';
import ReviewScreen from '../screens/ReviewScreen';

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
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                <Stack.Screen name="Test" component={TestScreen} />
                <Stack.Screen name="FlipCardGame" component={FlipCardGameScreen} />
                <Stack.Screen name="GameCategory" component={GameCategoryScreen} />
                <Stack.Screen name="MemoryCardGame" component={MemoryCardGameScreen} />
                <Stack.Screen name="TestResult" component={TestResultScreen} /> 
                <Stack.Screen name="Review" component={ReviewScreen} /> 
                

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
