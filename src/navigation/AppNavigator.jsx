import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { StatusBar } from 'react-native'; 
import { COLORS } from '../constants/colors';
import ResetLinkSentScreen from '../screens/ResetLinkSentScreen';
import CreateNewPasswordScreen from '../screens/CreateNewPasswordScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetLinkSent" component={ResetLinkSentScreen} />
                <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} /> 
            </Stack.Navigator>
        </NavigationContainer>

    );
};

export default AppNavigator;