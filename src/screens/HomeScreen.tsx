import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const HomeScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to BuildMate!</Text>
            <Text style={styles.subText}>Project Init Complete</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: SIZES.extraLarge,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginBottom: SIZES.base,
    },
    subText: {
        fontSize: SIZES.medium,
        color: COLORS.gray,
    },
});

export default HomeScreen;
