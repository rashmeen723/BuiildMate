import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';

type OnboardingScreen3NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingScreen3'>;

const { width, height } = Dimensions.get('window');

const OnboardingScreen3 = () => {
    const navigation = useNavigation<OnboardingScreen3NavigationProp>();

    const handleGetStarted = () => {
        // Complete onboarding and go to LoginSignup
        navigation.replace('LoginSignup');
    };

    const handleSkip = () => {
        navigation.replace('LoginSignup');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={require('../assets/onboarding_secure_trust.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Secure & Trustworthy</Text>
                    <Text style={styles.subtitle}>
                        Verified profiles and secure payments for your peace of mind. Build with confidence.
                    </Text>
                </View>

                {/* Pagination Dots */}
                <View style={styles.paginationContainer}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={[styles.dot, styles.activeDot]} />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        paddingHorizontal: SIZES.padding * 2,
        paddingTop: SIZES.padding,
        alignItems: 'flex-end',
    },
    skipText: {
        color: COLORS.gray,
        fontSize: SIZES.medium,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: SIZES.padding * 4,
        paddingTop: SIZES.padding * 2,
    },
    imageWrapper: {
        width: width * 0.8,
        height: width * 0.8,
        backgroundColor: '#E8F5E9', // Soft green background
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: SIZES.extraLarge,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: SIZES.padding * 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: SIZES.medium,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: SIZES.medium,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 24,
    },
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: SIZES.large,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.lightGray,
        marginHorizontal: 4,
    },
    activeDot: {
        width: 24, // Elongated active dot as per screenshot
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.darkBlue,
    },
    button: {
        backgroundColor: COLORS.darkBlue,
        width: width * 0.85,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: SIZES.large,
        fontWeight: 'bold',
    },
});

export default OnboardingScreen3;
