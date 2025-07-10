import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { fontPixel, pixelSizeHorizontal } from '../../helper';

const AudioPlayer = ({ uri }) => {
    console.log("first")
    // Pastikan URI valid sebelum membuat player
    const player = useAudioPlayer(uri);
    console.log("second")
    const status = useAudioPlayerStatus(player);
    console.log("third")
    
    const handlePlayAudio = async () => {
        console.log("empat")
        try {
            console.log("lima")
            if (!status?.isLoaded || !player) {
                console.warn("Player not loaded yet.");
                return;
            }
            
            // Jika audio sedang diputar, jeda. Jika tidak, putar.
            if (status.playing) {
                await player.pause();
            } else {
                 // Jika sudah selesai, putar dari awal
                const isFinished = status.didJustFinish || status.positionMillis >= status.durationMillis;
                if (isFinished) {
                    await player.seekTo(0);
                }
                await player.play();
            }
        } catch (error) {
            console.warn("Audio playback control error:", error);
        }
    };

    return (
        <TouchableOpacity style={styles.audioPlayer} onPress={handlePlayAudio}>
            <Ionicons
                name={status.playing ? "pause-circle" : "play-circle"}
                size={fontPixel(32)}
                color={COLORS.primary}
            />
            <Text style={styles.audioText}>
                {status.playing ? "Audio sedang diputar..." : "Putar Audio Soal"}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    audioPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: pixelSizeHorizontal(10),
        marginBottom: 15, // Disesuaikan dari pixelSizeVertical
    },
    audioText: {
        marginLeft: pixelSizeHorizontal(10),
        fontSize: fontPixel(14),
        color: COLORS.text,
    },
});

export default AudioPlayer;