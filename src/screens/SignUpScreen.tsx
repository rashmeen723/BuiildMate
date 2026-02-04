import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
// Using a simple text for back button to avoid dependency issues if vector icons aren't set up, 
// strictly generic. Or assume vector icons are safe (usually are in Expo).
// Let's use a simple View or Image if needed, but unicode is safest for now or just generic.
import { Ionicons } from '@expo/vector-icons';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
type SignUpScreenRouteProp = RouteProp<RootStackParamList, 'SignUp'>;

const SignUpScreen = () => {
    const navigation = useNavigation<SignUpScreenNavigationProp>();
    const route = useRoute<SignUpScreenRouteProp>();

    // Get the role passed from the previous screen
    const { role } = route.params;

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleNext = () => {
        if (!fullName.trim()) {
            Alert.alert("Error", "Please enter your full name");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        if (!phone.trim() || phone.length !== 10) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number");
            return;
        }

        console.log("Next pressed", { fullName, email, phone, role });
        // Navigate to Email Verification step
        navigation.navigate('EmailVerification', { fullName, email, phone, role });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sign Up</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Let's start with the basics</Text>
                    <Text style={styles.subtitle}>
                        Please provide your contact details to create your BuildMate account. This information helps us verify your identity.
                    </Text>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. John Doe"
                                placeholderTextColor="#9CA3AF"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="john@example.com"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0771234567"
                                placeholderTextColor="#9CA3AF"
                                value={phone}
                                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                                keyboardType="number-pad"
                                maxLength={10}
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.button} onPress={handleNext}>
                        <Text style={styles.buttonText}>Next</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
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
    scrollContent: {
        paddingHorizontal: SIZES.padding * 2,
        paddingTop: SIZES.extraLarge,
        paddingBottom: 100, // Space for footer
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: SIZES.small,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.gray,
        lineHeight: 22,
        marginBottom: SIZES.extraLarge,
    },
    form: {
        gap: SIZES.large,
    },
    inputContainer: {
        marginBottom: SIZES.medium,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937', // Dark gray
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: COLORS.white,
    },
    footer: {
        padding: SIZES.padding * 2,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: COLORS.white,
    },
    button: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SignUpScreen;
