import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        setLoading(true);
        try {
            const result = await authApi.login({ email, password });
            console.log("Login Success:", result);

            // Save user and token in Context
            await login(result.user, result.token);

            // Navigate to Home
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error: any) {
            Alert.alert("Login Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = () => {
        navigation.navigate('RoleSelection'); // Fixed: Should go to role selection
    };

    const handleForgotPassword = () => {
        console.log("Forgot password");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>Welcome back</Text>
                            <Text style={styles.subtitle}>
                                Log in to manage your tools and services.
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="example@email.com"
                                    placeholderTextColor={COLORS.gray}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="••••••••"
                                        placeholderTextColor={COLORS.gray}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off" : "eye"}
                                            size={20}
                                            color={COLORS.gray}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.forgotPasswordButton}
                                onPress={handleForgotPassword}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, loading && { opacity: 0.7 }]}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.loginButtonText}>Log In</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Or log in with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-google" size={24} color={COLORS.black} />
                                <Text style={styles.socialButtonText}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={24} color={COLORS.black} />
                                <Text style={styles.socialButtonText}>Apple</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => {
                                Keyboard.dismiss();
                                handleSignUp();
                            }}>
                                <Text style={styles.footerLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 60,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    textContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray,
        lineHeight: 22,
    },
    form: {
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkBlue,
        marginBottom: 8,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: COLORS.white,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        backgroundColor: COLORS.white,
        height: 52,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: COLORS.darkBlue,
        fontWeight: '600',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: COLORS.darkBlue,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#94A3B8',
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 40,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        backgroundColor: COLORS.white,
    },
    socialButtonText: {
        marginLeft: 8,
        color: COLORS.black,
        fontWeight: '600',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.black,
        fontSize: 14,
    },
    footerLink: {
        color: COLORS.primary || '#007AFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default LoginScreen;
