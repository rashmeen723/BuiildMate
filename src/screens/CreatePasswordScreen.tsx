import React, { useState, useEffect } from 'react';
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
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';

type CreatePasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreatePassword'>;

const CreatePasswordScreen = () => {
    const navigation = useNavigation<CreatePasswordScreenNavigationProp>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation States
    const [hasMinLength, setHasMinLength] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasActionChar, setHasActionChar] = useState(false); // e.g. uppercase or special
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    useEffect(() => {
        // Minimum 8 characters
        setHasMinLength(password.length >= 8);

        // At least one number
        setHasNumber(/\d/.test(password));

        // At least one special character OR uppercase letter (interpreting "etc" loosely for good UX, but typically implies complexity)
        // Let's go with: At least one letter and at least one special character/uppercase
        // Use a simpler standard: Min 8 chars, 1 number, 1 letter.
        // Or strictly: 1 special char, 1 uppercase, 1 lowercase.
        // User request: "include charaters , letters ,etc"
        // Let's implement: 8+ chars, 1 Letter, 1 Number, 1 Special Char.
        setHasActionChar(/[a-zA-Z]/.test(password) && /[^a-zA-Z0-9]/.test(password));

        // Passwords match
        setPasswordsMatch(password === confirmPassword && password.length > 0);
    }, [password, confirmPassword]);

    const isFormValid = hasMinLength && hasNumber && hasActionChar && passwordsMatch;

    const handleNext = () => {
        if (isFormValid) {
            console.log("Password created successfully");
            navigation.navigate('Welcome');
        }
    };

    const renderRequirement = (met: boolean, text: string) => (
        <View style={styles.requirementRow}>
            <Ionicons
                name={met ? "checkmark-circle" : "radio-button-off"}
                size={20}
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
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Sign Up</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        <View style={styles.contentContainer}>
                            <Text style={styles.title}>Create a Password</Text>
                            <Text style={styles.subtitle}>
                                Choose a secure password that will be easy for you to remember.
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="········"
                                        placeholderTextColor={COLORS.gray}
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off" : "eye"}
                                            size={20}
                                            color={COLORS.gray}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="········"
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

                            <View style={styles.requirementsContainer}>
                                {renderRequirement(hasMinLength, "At least 8 characters")}
                                {renderRequirement(hasNumber, "Contains a number")}
                                {renderRequirement(hasActionChar, "Letters and special characters")}
                                {renderRequirement(passwordsMatch && hasMinLength, "Passwords match")}
                            </View>

                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, !isFormValid && styles.buttonDisabled]}
                        onPress={handleNext}
                        disabled={!isFormValid}
                    >
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
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
        paddingHorizontal: 20,
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
        marginBottom: 20,
        backgroundColor: COLORS.white,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray,
        marginBottom: 30,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        height: 56,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
    },
    eyeIcon: {
        padding: 10,
    },
    requirementsContainer: {
        marginTop: 10,
        gap: 12,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.9,
    },
    requirementText: {
        marginLeft: 10,
        fontSize: 14,
        color: COLORS.gray,
    },
    requirementTextMet: {
        color: COLORS.darkBlue,
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    },
    button: {
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
    buttonDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreatePasswordScreen;
