import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
import { authApi } from '../services/api';

type ServiceProviderDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ServiceProviderDetails'>;
type ServiceProviderDetailsRouteProp = RouteProp<RootStackParamList, 'ServiceProviderDetails'>;

const SERVICE_CATEGORIES = [
    'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician', 'Mason', 'Gardener', 'Cleaner', 'Other'
];

const SKILLS_BY_CATEGORY: Record<string, string[]> = {
    'Electrician': ['Wiring', 'Panel Installation', 'Lighting', 'Appliance Repair', 'Emergency Services'],
    'Plumber': ['Pipe Repair', 'Installation', 'Leak Detection', 'Drain Cleaning'],
    'Carpenter': ['Furniture Repair', 'Installation', 'Custom Woodwork', 'Framing'],
    'Painter': ['Interior Painting', 'Exterior Painting', 'Wallpaper Removal', 'Staining'],
    'AC Technician': ['Installation', 'Service & Repair', 'Gas Refill', 'Duct Cleaning'],
    // Add others as needed
};

const ServiceProviderDetailsScreen = () => {
    const navigation = useNavigation<ServiceProviderDetailsNavigationProp>();
    const route = useRoute<ServiceProviderDetailsRouteProp>();
    const { email, fullName, phone, role, currentDetails } = route.params;

    // Initialize from currentDetails if provided (for editing)
    const initialCategory = currentDetails?.categories?.[0] || null;
    const initialExperience = currentDetails?.yearsOfExperience || '';
    const initialSkills = currentDetails?.skills || [];
    const initialHourlyRate = currentDetails?.hourlyRate ? currentDetails.hourlyRate.toString() : '';

    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
    const [yearsOfExperience, setYearsOfExperience] = useState(initialExperience);
    const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
    const [hourlyRate, setHourlyRate] = useState(initialHourlyRate);
    const [dbCategories, setDbCategories] = useState<string[]>([]);

    useEffect(() => {
        authApi.getCategories()
            .then(res => {
                if (res && res.services) {
                    const serviceNames = res.services.map((s: any) => s.name);
                    setDbCategories(serviceNames);
                }
            })
            .catch(err => console.error('Error fetching service categories:', err));
    }, []);

    const serviceCategories = dbCategories.length > 0
        ? dbCategories
        : ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician', 'Mason', 'Gardener', 'House Cleaner', 'Other'];

    // Derived state for available skills based on selected category
    const availableSkills = selectedCategory 
        ? (SKILLS_BY_CATEGORY[selectedCategory] || ['General Work', 'Installation', 'Maintenance', 'Consultation', 'Repair']) 
        : [];

    const toggleCategory = (category: string) => {
        if (selectedCategory === category) {
            setSelectedCategory(null);
            setSelectedSkills([]);
        } else {
            setSelectedCategory(category);
            setSelectedSkills([]);
        }
    };

    const toggleSkill = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const handleNext = () => {
        if (!selectedCategory) {
            Alert.alert("Required", "Please select a service category.");
            return;
        }
        if (!yearsOfExperience) {
            Alert.alert("Required", "Please enter your years of experience.");
            return;
        }
        if (!hourlyRate) {
            Alert.alert("Required", "Please enter your hourly rate.");
            return;
        }

        navigation.navigate('ServiceProviderDocuments', {
            email,
            fullName,
            phone,
            role,
            professionalDetails: {
                categories: [selectedCategory], // Still passing as array for compatibility if needed elsewhere
                yearsOfExperience,
                skills: selectedSkills,
                hourlyRate: parseFloat(hourlyRate)
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Professional Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Tell us about your work</Text>
                <Text style={styles.subtitle}>Help us match you with the right customers.</Text>

                {/* Service Category */}
                <View style={styles.section}>
                    <Text style={styles.label}>Service Category</Text>
                    <View style={styles.chipContainer}>
                        {serviceCategories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
                                onPress={() => toggleCategory(cat)}
                            >
                                <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextSelected]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Experience */}
                <View style={styles.section}>
                    <Text style={styles.label}>Years of Experience</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 5"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="numeric"
                        value={yearsOfExperience}
                        onChangeText={setYearsOfExperience}
                    />
                </View>

                {/* Skills */}
                {availableSkills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Specializations & Skills</Text>
                        <View style={styles.chipContainer}>
                            {[...new Set(availableSkills)].map(skill => (
                                <TouchableOpacity
                                    key={skill}
                                    style={[styles.chip, selectedSkills.includes(skill) && styles.chipSelected]}
                                    onPress={() => toggleSkill(skill)}
                                >
                                    <Text style={[styles.chipText, selectedSkills.includes(skill) && styles.chipTextSelected]}>
                                        {skill}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Hourly Rate */}
                <View style={styles.section}>
                    <Text style={styles.label}>Hourly Rate (LKR)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 1000"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="numeric"
                        value={hourlyRate}
                        onChangeText={setHourlyRate}
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
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F1F5F9', // Light gray
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
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ServiceProviderDetailsScreen;
