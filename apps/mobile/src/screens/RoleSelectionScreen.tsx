import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';

type RoleSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoleSelection'>;
type RoleSelectionScreenRouteProp = RouteProp<RootStackParamList, 'RoleSelection'>;

const RoleSelectionScreen = () => {
    const navigation = useNavigation<RoleSelectionScreenNavigationProp>();
    const route = useRoute<RoleSelectionScreenRouteProp>();

    // No params needed for this screen anymore as it's the first step


    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const roles = [
        {
            id: 'household',
            title: 'Household User',
            description: 'I want to hire professionals for home repairs and maintenance.',
            icon: 'home-outline' as const,
        },
        {
            id: 'rental_owner',
            title: 'Tool Rental Owner',
            description: 'I own tools and equipment and want to rent them out.',
            icon: 'cube-outline' as const,
        },
        {
            id: 'service_provider',
            title: 'Service Provider',
            description: 'I am a professional offering repair and construction services.',
            icon: 'construct-outline' as const,
        },
    ];

    const handleNext = () => {
        if (selectedRole) {
            navigation.navigate('SignUp', {
                role: selectedRole
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Role</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>How do you plan to use BuildMate?</Text>
                <Text style={styles.subtitle}>
                    Choose the role that best describes your needs. This helps us customize your experience.
                </Text>

                <View style={styles.cardContainer}>
                    {roles.map((role) => {
                        const isSelected = selectedRole === role.id;
                        return (
                            <TouchableOpacity
                                key={role.id}
                                style={[
                                    styles.card,
                                    isSelected && styles.cardSelected
                                ]}
                                onPress={() => setSelectedRole(role.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                                    <Ionicons
                                        name={role.icon}
                                        size={28}
                                        color={isSelected ? COLORS.white : COLORS.darkBlue}
                                    />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                                        {role.title}
                                    </Text>
                                    <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
                                        {role.description}
                                    </Text>
                                </View>
                                <View style={styles.radioButton}>
                                    {isSelected && <View style={styles.radioButtonInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, !selectedRole && styles.buttonDisabled]}
                    onPress={handleNext}
                    disabled={!selectedRole}
                >
                    <Text style={styles.buttonText}>Next</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
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
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 100,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.gray,
        lineHeight: 22,
        marginBottom: 30,
    },
    cardContainer: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardSelected: {
        borderColor: COLORS.darkBlue,
        backgroundColor: '#F0F9FF', // Very light blue
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconContainerSelected: {
        backgroundColor: COLORS.darkBlue,
    },
    cardContent: {
        flex: 1,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.darkBlue,
        marginBottom: 4,
    },
    cardTitleSelected: {
        color: COLORS.darkBlue,
    },
    cardDescription: {
        fontSize: 13,
        color: COLORS.gray,
        lineHeight: 18,
    },
    cardDescriptionSelected: {
        color: '#475569',
    },
    radioButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.darkBlue,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: COLORS.white,
    },
    button: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RoleSelectionScreen;
