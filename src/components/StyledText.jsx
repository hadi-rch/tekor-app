import React from 'react';
import { Text, StyleSheet } from 'react-native';

const StyledText = ({ style, children, fontType = 'opensans', ...props }) => {
    const textStyle = [
        styles.base,
        fontType === 'montserrat' ? styles.montserrat : styles.opensans,
        style,
    ];

    return (
        <Text style={textStyle} {...props}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    base: {
        color: '#333',
    },
    opensans: {
        fontFamily: 'OpenSans',
    },
    montserrat: {
        fontFamily: 'Montserrat',
    },
});

export default StyledText;

