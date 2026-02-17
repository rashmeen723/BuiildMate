import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';

type ServiceProviderPendingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ServiceProviderPending'>;

const ServiceProviderPendingScreen = () => {
    const navigation = useNavigation<ServiceProviderPendingNavigationProp>();

    const handleGoToLogin = () => {
        // Reset navigation stack to Login
        navigation.reset({
            index: 0,
            routes: [{ name: 'LoginSignup' }, { name: 'Login' }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={100} color="#10B981" />
                </View>

                <Text style={styles.title}>Application Submitted!</Text>

                <Text style={styles.message}>
                    Your account is currently under review by our admin team.
                </Text>

                <View style={styles.infoBox}>
                    <Ionicons name="time-outline" size={24} color={COLORS.darkBlue} style={{ marginBottom: 8 }} />
                    <Text style={styles.infoTitle}>Verification Timeline</Text>
                    <Text style={styles.infoText}>Usually takes 24-48 hours</Text>
                </View>

                <Text style={styles.subMessage}>
                    You can log in to your account now, but you will have limited access until your documents are verified.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleGoToLogin}>
                    <Text style={styles.buttonText}>Go to Login</Text>
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    iconContainer: {
        marginBottom: 24,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    infoBox: {
        backgroundColor: '#F0F9FF',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        width: '100%',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#0369A1',
    },
    subMessage: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    footer: {
        padding: 30,
        paddingBottom: 40,
    },
    button: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ServiceProviderPendingScreen;
