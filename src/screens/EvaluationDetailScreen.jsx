import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel } from '../../helper';

const EvaluationDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { aiEvaluationResult, testPackageName } = route.params;

    const handleGoBack = () => {
        navigation.navigate('MainApp', { screen: 'My Try out', params: { setActiveTab: 'History' } });
    };

    return (
        <View style={styles.container}>
            <FocusAwareStatusBar backgroundColor={COLORS.primary} />
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Evaluasi Try Out</Text>
                <View style={{ width: fontPixel(24) }} />

            </View>
            <ScrollView style={styles.content}>
                <Text style={styles.packageId}>{testPackageName}</Text>
                <Markdown style={markdownStyles}>
                    {aiEvaluationResult}
                </Markdown>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: 15, paddingVertical: 15, paddingTop: 40 },
    backButton: { marginRight: 10 },
    headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
    content: { flex: 1, padding: 15, marginBottom: 2 },
    packageId: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: COLORS.text },
});

const markdownStyles = {
    body: { fontSize: 14, lineHeight: 20, color: COLORS.text, marginBottom: 15, paddingBottom: 60 },
    heading1: { fontSize: 24, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: COLORS.primary },
    heading2: { fontSize: 20, fontWeight: 'bold', marginTop: 8, marginBottom: 4, color: COLORS.primary },
    heading3: { fontSize: 18, fontWeight: 'bold', marginTop: 6, marginBottom: 3, color: COLORS.primary },
};

export default EvaluationDetailScreen;
