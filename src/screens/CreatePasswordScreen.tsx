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
    Keyboard,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { authApi } from '../services/api';

type CreatePasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreatePassword'>;
type CreatePasswordScreenRouteProp = RouteProp<RootStackParamList, 'CreatePassword'>;

const CreatePasswordScreen = () => {
    const navigation = useNavigation<CreatePasswordScreenNavigationProp>();
    const route = useRoute<CreatePasswordScreenRouteProp>();

    // Get collected data
    const params = route.params || {};
    const { role } = params;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Validation States
    const [hasMinLength, setHasMinLength] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasActionChar, setHasActionChar] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    useEffect(() => {
        setHasMinLength(password.length >= 8);
        setHasNumber(/\d/.test(password));
        setHasActionChar(/[a-zA-Z]/.test(password) && /[^a-zA-Z0-9]/.test(password));
        setPasswordsMatch(password === confirmPassword && password.length > 0);
    }, [password, confirmPassword]);

    const isFormValid = hasMinLength && hasNumber && hasActionChar && passwordsMatch;

    const handleNext = async () => {
        if (!isFormValid) return;

        if (role === 'service_provider') {
            navigation.navigate('ServiceProviderReview', {
                ...params,
                email: params.email!,
                fullName: params.fullName!,
                phone: params.phone!,
                role: params.role!,
                professionalDetails: params.professionalDetails,
                documents: params.documents,
                serviceArea: params.serviceArea,
                password
            });
        } else if (role === 'rental_owner') {
            navigation.navigate('RentalOwnerReview', {
                ...params,
                email: params.email!,
                fullName: params.fullName!,
                phone: params.phone!,
                role: params.role!,
                rentalDetails: params.rentalDetails,
                documents: params.documents,
                serviceArea: params.serviceArea,
                password
            });
        } else {
            // Household User - Submit directly
            setLoading(true);
            try {
                // Prepare registration data
                const registrationData: any = {
                    email: params.email,
                    fullName: params.fullName,
                    phone: params.phone,
                    role: 'HOUSEHOLD',
                    password: password,
                    address: params.address,
                };

                // Add location if available
                if (params.location) {
                    registrationData.location = {
                        latitude: params.location.latitude,
                        longitude: params.location.longitude,
                    };
                }

                console.log('Registering household user:', registrationData);
                const result = await authApi.register(registrationData);

                console.log('Registration successful! User created:', result);

                Alert.alert(
                    "Account Created",
                    "Congratulations! Your BuildMate account has been created successfully. You can now login to get started.",
                    [{
                        text: "Login Now", onPress: () => {
                            Keyboard.dismiss();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        }
                    }]
                );
            } catch (error: any) {
                console.error("Registration failed:", error);
                Alert.alert("Registration Failed", error.message);
            } finally {
                setLoading(false);
            }
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
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
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
                                        placeholder="••••••••"
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
                        style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
                        onPress={handleNext}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.buttonText}>Continue</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    scrollContent: { paddingHorizontal: 20, flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, marginBottom: 20, backgroundColor: COLORS.white },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
    contentContainer: { flex: 1 },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.darkBlue, marginBottom: 10 },
    subtitle: { fontSize: 16, color: COLORS.gray, marginBottom: 30, lineHeight: 22 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: COLORS.darkBlue, marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#F8FAFC', height: 56, paddingHorizontal: 15 },
    input: { flex: 1, fontSize: 16, color: COLORS.black },
    eyeIcon: { padding: 10 },
    requirementsContainer: { marginTop: 10, gap: 12 },
    requirementRow: { flexDirection: 'row', alignItems: 'center', opacity: 0.9 },
    requirementText: { marginLeft: 10, fontSize: 14, color: COLORS.gray },
    requirementTextMet: { color: COLORS.darkBlue, fontWeight: '500' },
    footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 0 : 20 },
    button: { backgroundColor: COLORS.darkBlue, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.darkBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    buttonDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0, elevation: 0 },
    buttonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
});

export default CreatePasswordScreen;
