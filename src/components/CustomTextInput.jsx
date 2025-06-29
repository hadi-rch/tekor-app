import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const CustomTextInput = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    secureTextEntry = false, 
    keyboardType = 'default',
    rightIcon,
    error,
    hasError = false,
    ...props 
}) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input, 
                        rightIcon && styles.inputWithIcon,
                        hasError && styles.inputError
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    placeholderTextColor={COLORS.gray}
                    {...props}
                />
                {rightIcon && (
                    <View style={styles.rightIconContainer}>
                        {rightIcon}
                    </View>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 8,
    },
    inputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.text,
        backgroundColor: COLORS.white,
    },
    inputWithIcon: {
        paddingRight: 50, // Memberikan ruang untuk icon
    },
    inputError: {
        borderColor: '#FF6B6B', // Red color for error state
        borderWidth: 1.5,
    },
    rightIconContainer: {
        position: 'absolute',
        right: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 12,
        color: '#FF6B6B',
        marginTop: 4,
        marginLeft: 4,
    },
});

export default CustomTextInput;