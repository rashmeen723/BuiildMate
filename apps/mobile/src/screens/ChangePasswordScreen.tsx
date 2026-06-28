import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

type ChangePasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChangePassword'>;

const ChangePasswordScreen = () => {
    const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
    const { token } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    // Password requirements states
    const [hasMinLength, setHasMinLength] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasActionChar, setHasActionChar] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    useEffect(() => {
        setHasMinLength(newPassword.length >= 8);
        setHasNumber(/\d/.test(newPassword));
        setHasActionChar(/[a-zA-Z]/.test(newPassword) && /[^a-zA-Z0-9]/.test(newPassword));
        setPasswordsMatch(newPassword === confirmPassword && newPassword.length > 0);
    }, [newPassword, confirmPassword]);

    const isFormValid = hasMinLength && hasNumber && hasActionChar && passwordsMatch && currentPassword.length > 0;

    const handleChangePassword = async () => {
        if (!isFormValid) return;

        Keyboard.dismiss();
        setLoading(true);

        try {
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }

            await authApi.changePassword(token, currentPassword, newPassword);

            Alert.alert(
                "Success",
                "Your password has been changed successfully.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            console.error("Change password failed:", error);
            Alert.alert("Error", error.message || "Failed to change password. Please check your current password.");
        } finally {
            setLoading(false);
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
                            <Text style={styles.headerTitle}>Change Password</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        <View style={styles.contentContainer}>
                            <Text style={styles.subtitle}>
                                Update your password regularly to ensure your account security.
                            </Text>

                            {/* Current Password */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Current Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="••••••••"
                                        placeholderTextColor={COLORS.gray}
                                        secureTextEntry={!showCurrentPassword}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showCurrentPassword ? "eye-off" : "eye"}
                                            size={20}
                                            color={COLORS.gray}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Divider line */}
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
                                <Text style={styles.label}>Confirm New Password</Text>
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
                                {renderRequirement(passwordsMatch, "New passwords must match")}
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.button, !isFormValid && styles.disabledButton]}
                                onPress={handleChangePassword}
                                disabled={!isFormValid || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.buttonText}>Update Password</Text>
                                )}
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
        marginTop: 10,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 28,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 20,
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
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
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

export default ChangePasswordScreen;
