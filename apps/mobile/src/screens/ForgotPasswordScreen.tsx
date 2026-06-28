import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { authApi } from '../services/api';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: Email Input, 2: OTP & Reset
    
    // Step 2 inputs
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Password requirements states
    const [hasMinLength, setHasMinLength] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasActionChar, setHasActionChar] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    const inputRefs = useRef<Array<TextInput | null>>([]);

    // Timer logic for resending code
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    // Password requirements check
    useEffect(() => {
        setHasMinLength(newPassword.length >= 8);
        setHasNumber(/\d/.test(newPassword));
        setHasActionChar(/[a-zA-Z]/.test(newPassword) && /[^a-zA-Z0-9]/.test(newPassword));
        setPasswordsMatch(newPassword === confirmPassword && newPassword.length > 0);
    }, [newPassword, confirmPassword]);

    const isResetFormValid = hasMinLength && hasNumber && hasActionChar && passwordsMatch && otp.join('').length === 6;

    const handleSendCode = async () => {
        if (!email.trim() || !email.includes('@')) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        Keyboard.dismiss();
        setLoading(true);

        try {
            await authApi.forgotPassword(email.trim());
            Alert.alert(
                "Verification Code Sent",
                `We have sent a 6-digit verification code to ${email}.`,
                [{ text: "OK", onPress: () => {
                    setStep(2);
                    setTimer(60);
                    setCanResend(false);
                }}]
            );
        } catch (error: any) {
            console.error("Forgot password request failed:", error);
            Alert.alert("Request Failed", error.message || "Failed to send reset code. Please make sure the email is registered.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;

        setLoading(true);
        try {
            await authApi.forgotPassword(email);
            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 200);
            Alert.alert("Code Resent", "A new reset code has been sent to your email.");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to resend code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!isResetFormValid) return;

        Keyboard.dismiss();
        setLoading(true);

        try {
            const code = otp.join('');
            await authApi.resetPassword({
                email: email.trim(),
                code,
                newPassword
            });

            Alert.alert(
                "Password Reset Success",
                "Your password has been reset successfully. You can now login with your new password.",
                [{ text: "Login Now", onPress: () => navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })}]
            );
        } catch (error: any) {
            console.error("Reset password failed:", error);
            Alert.alert("Reset Failed", error.message || "Invalid or expired verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (text: string, index: number) => {
        const cleanText = text.replace(/[^0-9]/g, '');

        if (cleanText.length > 1) {
            const newOtp = [...otp];
            const chars = cleanText.split('').slice(0, 6);
            if (chars.length === 6) {
                setOtp(chars);
                inputRefs.current[5]?.focus();
            } else {
                chars.forEach((char, i) => {
                    if (index + i < 6) newOtp[index + i] = char;
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

        if (cleanText.length === 1 && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleBackspace = (text: string, index: number) => {
        if (text.length === 0 && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const renderRequirement = (met: boolean, text: string) => (
        <View style={styles.requirementRow}>
            <Ionicons
                name={met ? "checkmark-circle" : "radio-button-off"}
                size={18}
                color={met ? COLORS.primary : COLORS.gray}
            />
            <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
                {text}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
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
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Reset Password</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {step === 1 ? (
                            /* Step 1: Email Input Layout */
                            <View style={styles.contentContainer}>
                                <Text style={styles.title}>Forgot Password?</Text>
                                <Text style={styles.subtitle}>
                                    Enter your registered email address and we'll send you a 6-digit code to reset your password.
                                </Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="example@email.com"
                                            placeholderTextColor={COLORS.gray}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            value={email}
                                            onChangeText={setEmail}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, !email.includes('@') && styles.disabledButton]}
                                    onPress={handleSendCode}
                                    disabled={!email.includes('@') || loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.buttonText}>Send Reset Code</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* Step 2: Verification and Reset Layout */
                            <View style={styles.contentContainer}>
                                <Text style={styles.title}>Enter Reset Code</Text>
                                <Text style={styles.subtitle}>
                                    We have sent a verification code to <Text style={{ fontWeight: '700' }}>{email}</Text>. Enter the code and set your new password below.
                                </Text>

                                {/* OTP Grid */}
                                <Text style={styles.label}>Verification Code</Text>
                                <View style={styles.otpContainer}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => { inputRefs.current[index] = ref; }}
                                            style={styles.otpInput}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={(text) => handleOtpChange(text, index)}
                                            onKeyPress={({ nativeEvent }) => {
                                                if (nativeEvent.key === 'Backspace') {
                                                    handleBackspace(digit, index);
                                                }
                                            }}
                                            selectTextOnFocus
                                        />
                                    ))}
                                </View>

                                {/* Resend Section */}
                                <View style={styles.resendContainer}>
                                    {canResend ? (
                                        <TouchableOpacity onPress={handleResendCode} disabled={loading}>
                                            <Text style={styles.resendLink}>Resend Code</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text style={styles.timerText}>
                                            Resend code in {timer}s
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.divider} />

                                {/* New Password */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>New Password</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            placeholderTextColor={COLORS.gray}
                                            secureTextEntry={!showNewPassword}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowNewPassword(!showNewPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            <Ionicons
                                                name={showNewPassword ? "eye-off" : "eye"}
                                                size={20}
                                                color={COLORS.gray}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Confirm Password */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Confirm Password</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            placeholderTextColor={COLORS.gray}
                                            secureTextEntry={!showConfirmPassword}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            <Ionicons
                                                name={showConfirmPassword ? "eye-off" : "eye"}
                                                size={20}
                                                color={COLORS.gray}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Requirements Checklist */}
                                <View style={styles.requirementsContainer}>
                                    <Text style={styles.requirementsTitle}>Password Requirements</Text>
                                    {renderRequirement(hasMinLength, "At least 8 characters")}
                                    {renderRequirement(hasNumber, "At least 1 number")}
                                    {renderRequirement(hasActionChar, "At least 1 special character (e.g. @, #, $)")}
                                    {renderRequirement(passwordsMatch, "Passwords must match")}
                                </View>

                                {/* Reset Submit Button */}
                                <TouchableOpacity
                                    style={[styles.button, !isResetFormValid && styles.disabledButton]}
                                    onPress={handleResetPassword}
                                    disabled={!isResetFormValid || loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.buttonText}>Reset Password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
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
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    contentContainer: {
        marginTop: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.black,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 28,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 16,
        height: 52,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
        height: '100%',
    },
    eyeIcon: {
        padding: 8,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    otpInput: {
        width: 48,
        height: 52,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#FAFAFA',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    resendLink: {
        fontSize: 14,
        color: COLORS.darkBlue,
        fontWeight: '600',
    },
    timerText: {
        fontSize: 14,
        color: COLORS.gray,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
    },
    requirementsContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 12,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 13,
        color: COLORS.gray,
        marginLeft: 8,
    },
    requirementTextMet: {
        color: COLORS.black,
        fontWeight: '500',
    },
    button: {
        height: 52,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    disabledButton: {
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ForgotPasswordScreen;
