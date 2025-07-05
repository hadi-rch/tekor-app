import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  errorToastContainer: {
    height: 60,
    width: '90%',
    backgroundColor: '#F8D7DA',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    borderLeftColor: '#D9534F',
    borderLeftWidth: 5,
  },
  errorToastText1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#721C24',
  },
  errorToastText2: {
    fontSize: 14,
    color: '#721C24',
  },
});

export const toastConfig = {
  error: ({ text1, text2 }) => (
    <View style={styles.errorToastContainer}>
      <Text style={styles.errorToastText1}>{text1}</Text>
      <Text style={styles.errorToastText2}>{text2}</Text>
    </View>
  )
};