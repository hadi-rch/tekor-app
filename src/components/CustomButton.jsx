import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const CustomButton = ({ title, onPress, style }) => {
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 24,
        alignItems: 'center',
        width: '100%',
    },
    text: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CustomButton;