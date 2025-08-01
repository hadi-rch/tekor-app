import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import { COLORS } from '../constants/colors';
import LessonsScreen from '../screens/LessonsScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { fontPixel, heightPixel } from '../../helper';
import GameCategoryScreen from '../screens/GameCategoryScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false, // Menyembunyikan header default di setiap tab
                tabBarIcon: ({ focused, color }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Game') {
                        iconName = focused ? 'game-controller' : 'game-controller-outline';
                    } else if (route.name === 'My Try out') {
                        iconName = focused ? 'book' : 'book-outline';
                    } else if (route.name === 'Try out') {
                        iconName = focused ? 'cube' : 'cube-outline';
                    } else if (route.name === 'Profil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={fontPixel(24)} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.gray,
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.borderColor,
                    height: heightPixel(65) + insets.bottom,
                    paddingBottom: 5 + insets.bottom,
                },
                tabBarLabelStyle: {
                    fontSize: fontPixel(12),
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Beranda' }} />
            <Tab.Screen name="Try out" component={ProductsScreen} />
            <Tab.Screen name="My Try out" component={LessonsScreen} />
            <Tab.Screen name="Game" component={GameCategoryScreen} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
