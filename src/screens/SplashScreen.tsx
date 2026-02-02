import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
    const navigation = useNavigation<SplashScreenNavigationProp>();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Start Animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate after delay
        const timer = setTimeout(() => {
            navigation.replace('OnboardingScreen1');
        }, 3000);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, navigation]);

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
                <Image
                    source={require('../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>BuildMate</Text>
                <Text style={styles.subtitle}>EXPERTISE AT YOUR DOOR</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: SIZES.large,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#14213D', // Dark Blue from request
        marginBottom: SIZES.base,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.gray,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});

export default SplashScreen;
