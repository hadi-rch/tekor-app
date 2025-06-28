import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import { COLORS } from '../constants/colors';


const PlaceholderScreen = ({ route }) => (
    <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>{route.name}</Text>
        <Text>Layar ini sedang dalam pengembangan.</Text>
    </View>
);

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false, // Menyembunyikan header default di setiap tab
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Les') {
                        iconName = focused ? 'book' : 'book-outline';
                    } else if (route.name === 'Produk') {
                        iconName = focused ? 'cube' : 'cube-outline';
                    } else if (route.name === 'Profil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.accent,
                tabBarInactiveTintColor: COLORS.gray,
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.borderColor,
                    height: 60,
                    paddingBottom: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Beranda' }} />
            <Tab.Screen name="Les" component={PlaceholderScreen} />
            <Tab.Screen name="Produk" component={PlaceholderScreen} />
            <Tab.Screen name="Profil" component={PlaceholderScreen} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    placeholderText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default MainTabNavigator;
