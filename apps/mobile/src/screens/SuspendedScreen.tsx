import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

type SuspendedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Suspended'>;

const SuspendedScreen = () => {
    const navigation = useNavigation<SuspendedScreenNavigationProp>();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'LoginSignup' }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed" size={64} color="#EF4444" />
                </View>

                <Text style={styles.title}>Account Suspended</Text>
                
                <Text style={styles.description}>
                    Your BuildMate account has been suspended due to safety policy violations or a low reputation score.
                </Text>

                <View style={styles.reasonCard}>
                    <Text style={styles.reasonLabel}>REASON FOR SUSPENSION</Text>
                    <Text style={styles.reasonValue}>
                        {user?.suspensionReason || 'Your account trust score fell below the acceptable threshold (2.0).'}
                    </Text>
                </View>

                <Text style={styles.supportText}>
                    If you believe this is a mistake or wish to appeal this decision, please contact our Trust & Safety team.
                </Text>

                <TouchableOpacity style={styles.supportButton}>
                    <Ionicons name="mail" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                    <Text style={styles.supportButtonText}>Email Support</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out" size={20} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutButtonText}>Log Out / Switch Account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    reasonCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    reasonLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: 8,
    },
    reasonValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
        lineHeight: 22,
    },
    supportText: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 32,
        paddingHorizontal: 12,
    },
    supportButton: {
        width: '100%',
        backgroundColor: COLORS.darkBlue,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    supportButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        width: '100%',
        backgroundColor: 'transparent',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    logoutButtonText: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SuspendedScreen;
