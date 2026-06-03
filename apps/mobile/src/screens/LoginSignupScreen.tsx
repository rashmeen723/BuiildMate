import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';

type LoginSignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginSignup'>;

const { width, height } = Dimensions.get('window');

const LoginSignupScreen = () => {
    const navigation = useNavigation<LoginSignupScreenNavigationProp>();

    const handleSignUp = () => {
        navigation.navigate('RoleSelection');
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            {/* Background Image */}
            <Image
                source={require('../assets/login_background.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            {/* Gradient Overlay for Fade Effect */}
            <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.7)', '#ffffff', '#ffffff']}
                locations={[0, 0.45, 0.58, 1]}
                style={styles.gradient}
            >
                <View style={styles.contentContainer}>
                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.logoText}>BuildMate</Text>
                    </View>
                    <View style={styles.logoUnderline} />

                    {/* Main Headings */}
                    <Text style={styles.headline}>
                        Connecting homes,
                    </Text>
                    <Text style={styles.headline}>
                        hands, and tools —
                    </Text>
                    <Text style={[styles.headline, styles.italicHeadline]}>
                        effortlessly.
                    </Text>

                    {/* Description */}
                    <Text style={styles.description}>
                        The all-in-one corporate-grade platform for maintenance services, skilled professionals, and tool rentals.
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                            <Text style={styles.signUpButtonText}>Sign Up</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                            <Text style={styles.loginButtonText}>Log In</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <Text style={styles.policyText}>
                        By continuing, you agree to our <Text style={styles.linkText}>Terms</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                    </Text>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    backgroundImage: {
        width: width,
        height: height * 0.6, // Cover top 60% of the screen
        position: 'absolute',
        top: 0,
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: Platform.OS === 'ios' ? SIZES.padding * 4 : SIZES.padding * 2,
    },
    contentContainer: {
        paddingHorizontal: SIZES.padding * 3,
        paddingBottom: SIZES.padding,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    logoImage: {
        width: 36,
        height: 36,
        marginRight: 10,
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#14213D',
    },
    logoUnderline: {
        width: 30,
        height: 3,
        backgroundColor: '#FCA311', // Orange accent
        marginBottom: SIZES.large,
        marginLeft: 46, // aligned to logoImage width (36) + marginRight (10)
    },
    headline: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#14213D',
        lineHeight: 34,
    },
    italicHeadline: {
        fontStyle: 'italic',
        marginBottom: SIZES.medium,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: SIZES.extraLarge,
    },
    buttonContainer: {
        gap: 15,
        marginBottom: SIZES.large,
    },
    signUpButton: {
        backgroundColor: '#14213D',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    signUpButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginButton: {
        backgroundColor: COLORS.white,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    loginButtonText: {
        color: '#14213D',
        fontSize: 16,
        fontWeight: 'bold',
    },
    policyText: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
    },
    linkText: {
        textDecorationLine: 'underline',
    },
});

export default LoginSignupScreen;
