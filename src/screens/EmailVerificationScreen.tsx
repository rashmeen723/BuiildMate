import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';

type EmailVerificationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EmailVerification'>;
type EmailVerificationScreenRouteProp = RouteProp<RootStackParamList, 'EmailVerification'>;

const { width } = Dimensions.get('window');

const EmailVerificationScreen = () => {
    const navigation = useNavigation<EmailVerificationScreenNavigationProp>();
    const route = useRoute<EmailVerificationScreenRouteProp>();
    const { email = 'your email' } = route.params || {};

    // State for OTP
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        // Auto focus the first box on mount
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 500);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (text: string, index: number) => {
        // Remove non-digit characters
        const cleanText = text.replace(/[^0-9]/g, '');

        if (cleanText.length > 1) {
            // Handle pasting or rapid entry
            const newOtp = [...otp];
            const chars = cleanText.split('').slice(0, 6);

            // If the user pastes a full or partial code, we often want to fill from the start 
            // OR from current position. Let's assume they want to fill the whole thing if it's 6 digits.
            if (chars.length === 6) {
                setOtp(chars);
                inputRefs.current[5]?.focus();
            } else {
                chars.forEach((char, i) => {
                    if (index + i < 6) {
                        newOtp[index + i] = char;
                    }
                });
                setOtp(newOtp);
                const nextToFocus = Math.min(index + chars.length, 5);
                inputRefs.current[nextToFocus]?.focus();
            }
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = cleanText;
        setOtp(newOtp);

        // Auto-advance
        if (cleanText.length === 1 && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleBackspace = (text: string, index: number) => {
        if (text.length === 0 && index > 0) {
            // If backspace is pressed on an empty box, move focus back
            const newOtp = [...otp];
            newOtp[index - 1] = ''; // Optional: clear the previous box
            setOtp(newOtp);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        if (canResend) {
            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            console.log("Resending code...");
        }
    };

    const handleVerify = () => {
        const code = otp.join('');
        if (code.length === 6) {
            console.log("Verifying code:", code);
            navigation.navigate('LocationPicker');
        } else {
            // Shake animation or error message could go here
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <View style={styles.backIconContainer}>
                            <Ionicons name="chevron-back" size={24} color={COLORS.darkBlue} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Verification</Text>
                    <View style={{ width: 40 }} />
                </View>

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        style={styles.content}
                    >
                        <View style={styles.illustrationContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="mail-open" size={40} color={COLORS.darkBlue} />
                            </View>
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.title}>Check your email</Text>
                            <Text style={styles.subtitle}>
                                We've sent a 6-digit verification code to <Text style={{ color: COLORS.darkBlue, fontWeight: '700' }}>{email}</Text>. Please enter it below to continue.
                            </Text>
                        </View>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <View key={index} style={styles.otpInputWrapper}>
                                    <TextInput
                                        ref={(ref) => { inputRefs.current[index] = ref; }}
                                        style={[
                                            styles.otpInput,
                                            digit ? styles.otpInputFilled : null,
                                            focusedIndex === index ? styles.otpInputFocused : null
                                        ]}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={({ nativeEvent }) => {
                                            if (nativeEvent.key === 'Backspace') {
                                                handleBackspace(digit, index);
                                            }
                                        }}
                                        onFocus={() => setFocusedIndex(index)}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        textAlign="center"
                                        cursorColor={COLORS.darkBlue}
                                        selectTextOnFocus
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        importantForAutofill="yes"
                                        textContentType="oneTimeCode"
                                    />
                                </View>
                            ))}
                        </View>

                        <View style={styles.timerSection}>
                            <Text style={styles.timerText}>
                                Code expires in: <Text style={styles.timerValue}>{formatTime(timer)}</Text>
                            </Text>

                            <View style={styles.resendWrapper}>
                                <Text style={styles.resendText}>Didn't receive the code? </Text>
                                <TouchableOpacity
                                    onPress={handleResend}
                                    disabled={!canResend}
                                >
                                    <Text style={[
                                        styles.resendLink,
                                        !canResend && styles.resendDisabled
                                    ]}>
                                        Resend Code
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[
                                    styles.verifyButton,
                                    otp.join('').length < 6 && styles.verifyButtonDisabled
                                ]}
                                onPress={handleVerify}
                                activeOpacity={0.8}
                                disabled={otp.join('').length < 6}
                            >
                                <Text style={styles.verifyButtonText}>Verify Account</Text>
                                <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    gradient: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    backButton: {
        zIndex: 10,
    },
    backIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.darkBlue,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.darkBlue,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.gray,
        lineHeight: 22,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    otpInputWrapper: {
        width: (width - 48 - (5 * 10)) / 6, // Dynamic width based on screen and spacing
        aspectRatio: 0.85,
    },
    otpInput: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.darkBlue,
        backgroundColor: COLORS.white,
        padding: 0, // Ensure text isn't cut off
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    otpInputFilled: {
        borderColor: COLORS.darkBlue,
        backgroundColor: COLORS.white,
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    otpInputFocused: {
        borderColor: COLORS.darkBlue,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        shadowColor: COLORS.darkBlue,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    timerSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    timerText: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 10,
    },
    timerValue: {
        fontWeight: '700',
        color: COLORS.orange,
    },
    resendWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        color: COLORS.gray,
    },
    resendLink: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.darkBlue,
    },
    resendDisabled: {
        color: '#CBD5E1',
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 30,
    },
    verifyButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    verifyButtonDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0,
        elevation: 0,
    },
    verifyButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '700',
    },
});

export default EmailVerificationScreen;
