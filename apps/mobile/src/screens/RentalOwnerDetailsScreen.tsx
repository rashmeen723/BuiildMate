import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';

type RentalOwnerDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalOwnerDetails'>;
type RentalOwnerDetailsRouteProp = RouteProp<RootStackParamList, 'RentalOwnerDetails'>;

const TOOL_CATEGORIES = [
    'Power Tools', 'Hand Tools', 'Heavy Machinery', 'Scaffolding', 'Ladders', 'Painting Equipment', 'Cleaning Equipment', 'Other'
];

const RentalOwnerDetailsScreen = () => {
    const navigation = useNavigation<RentalOwnerDetailsNavigationProp>();
    const route = useRoute<RentalOwnerDetailsRouteProp>();
    const { email, fullName, phone, role, currentDetails } = route.params;

    const [businessName, setBusinessName] = useState(currentDetails?.businessName || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(currentDetails?.categories || []);
    const [yearsInBusiness, setYearsInBusiness] = useState(currentDetails?.yearsInBusiness || '');

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const handleNext = () => {
        if (!businessName) {
            Alert.alert("Required", "Please enter your business or store name.");
            return;
        }
        if (selectedCategories.length === 0) {
            Alert.alert("Required", "Please select at least one tool category.");
            return;
        }

        navigation.navigate('RentalOwnerDocuments', {
            email,
            fullName,
            phone,
            role,
            rentalDetails: {
                businessName,
                categories: selectedCategories,
                yearsInBusiness
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Business Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Describe your business</Text>
                <Text style={styles.subtitle}>Help us set up your rental store profile.</Text>

                {/* Business Name */}
                <View style={styles.section}>
                    <Text style={styles.label}>Business / Store Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. BuildLink Tool Rentals"
                        placeholderTextColor={COLORS.gray}
                        value={businessName}
                        onChangeText={setBusinessName}
                    />
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={styles.label}>Tool Categories (Select all that apply)</Text>
                    <View style={styles.chipContainer}>
                        {TOOL_CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, selectedCategories.includes(cat) && styles.chipSelected]}
                                onPress={() => toggleCategory(cat)}
                            >
                                <Text style={[styles.chipText, selectedCategories.includes(cat) && styles.chipTextSelected]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Years in Business */}
                <View style={styles.section}>
                    <Text style={styles.label}>Years in Business (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 3"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="numeric"
                        value={yearsInBusiness}
                        onChangeText={setYearsInBusiness}
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>Continue</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
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
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.gray,
        marginBottom: 30,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkBlue,
        marginBottom: 12,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#F8FAFC',
        color: COLORS.black,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipSelected: {
        backgroundColor: COLORS.darkBlue,
        borderColor: COLORS.darkBlue,
    },
    chipText: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    chipTextSelected: {
        color: COLORS.white,
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
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RentalOwnerDetailsScreen;
