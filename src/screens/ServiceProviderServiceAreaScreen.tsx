import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
import CustomMap, { Marker, PROVIDER_GOOGLE } from '../components/CustomMap';
import Slider from '@react-native-community/slider';

type ServiceProviderServiceAreaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ServiceProviderServiceArea'>;
type ServiceProviderServiceAreaRouteProp = RouteProp<RootStackParamList, 'ServiceProviderServiceArea'>;

const WORK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ServiceProviderServiceAreaScreen = () => {
    const navigation = useNavigation<ServiceProviderServiceAreaNavigationProp>();
    const route = useRoute<ServiceProviderServiceAreaRouteProp>();

    // Destructure all previous data to pass forward
    const { email, fullName, phone, role, professionalDetails, documents, currentServiceArea } = route.params;

    const [address, setAddress] = useState(currentServiceArea?.address || '');
    const [previewLocation, setPreviewLocation] = useState<{
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null>(currentServiceArea?.location || null);

    // Default 10km radius
    const [radius, setRadius] = useState(currentServiceArea?.radius || 10);
    const [selectedDays, setSelectedDays] = useState<string[]>(currentServiceArea?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

    // Simple strings for now, could be Date objects later
    const [startTime, setStartTime] = useState(currentServiceArea?.workingHours?.start || '09:00 AM');
    const [endTime, setEndTime] = useState(currentServiceArea?.workingHours?.end || '05:00 PM');

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    // Update address from map selection return
    useEffect(() => {
        if (route.params?.selectedAddress) {
            setAddress(route.params.selectedAddress);
        }
        if (route.params?.selectedLocation) {
            setPreviewLocation(route.params.selectedLocation);
        }
    }, [route.params?.selectedAddress, route.params?.selectedLocation]);

    const openMapSelection = () => {
        navigation.navigate('MapSelection', { returnScreen: 'ServiceProviderServiceArea' });
    };

    // Listen for map updates (rudimentary polling/check on focus could work, or useEffect on route.params if updated via navigate)
    // MapSelection would need to navigate back to THIS screen.
    // If MapSelection blindly goes back, it might work if we just use route.params.
    // Note: React Navigation params merge.
    // However, if MapSelection hardcodes "Navigate to LocationPicker", we have a problem.
    // I will check MapSelection later. addressing it via manual input emphasis for now.

    const handleNext = () => {
        if (!address) {
            Alert.alert("Required", "Please enter your service base location/address.");
            return;
        }
        if (selectedDays.length === 0) {
            Alert.alert("Required", "Please select your working days.");
            return;
        }

        navigation.navigate('CreatePassword', {
            email,
            fullName,
            phone,
            role,
            professionalDetails,
            documents,
            serviceArea: {
                address,
                location: previewLocation,
                radius,
                workingDays: selectedDays,
                workingHours: { start: startTime, end: endTime }
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Service Area & Availability</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Where do you work?</Text>
                <Text style={styles.subtitle}>Define your service radius and working hours.</Text>

                {/* Address Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Base Service Address</Text>
                    <View style={styles.inputWithIcon}>
                        <TextInput
                            style={styles.flexInput}
                            placeholder="e.g. 123 Main St, Springfield"
                            placeholderTextColor={COLORS.gray}
                            value={address}
                            onChangeText={setAddress}
                        />
                        <TouchableOpacity onPress={openMapSelection} style={styles.iconButton}>
                            <Ionicons name="map-outline" size={24} color={COLORS.darkBlue} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.helperText}>Used to calculate travel distance.</Text>
                </View>

                {/* Radius Slider */}
                <View style={styles.section}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Service Radius</Text>
                        <Text style={styles.valueText}>{radius} km</Text>
                    </View>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={5}
                        maximumValue={50}
                        step={5}
                        value={radius}
                        onValueChange={setRadius}
                        minimumTrackTintColor={COLORS.darkBlue}
                        maximumTrackTintColor="#CBD5E1"
                        thumbTintColor={COLORS.darkBlue}
                    />
                    <View style={styles.radiusLabels}>
                        <Text style={styles.tinyText}>5km</Text>
                        <Text style={styles.tinyText}>50km</Text>
                    </View>
                </View>

                {/* Working Days */}
                <View style={styles.section}>
                    <Text style={styles.label}>Working Days</Text>
                    <View style={styles.daysContainer}>
                        {WORK_DAYS.map(day => {
                            const isSelected = selectedDays.includes(day);
                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                                    onPress={() => toggleDay(day)}
                                >
                                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Working Hours */}
                <View style={styles.section}>
                    <Text style={styles.label}>Working Hours</Text>
                    <View style={styles.rowInput}>
                        <View style={styles.halfInputContainer}>
                            <Text style={styles.subLabel}>Start Time</Text>
                            <TextInput
                                style={styles.timeInput}
                                value={startTime}
                                onChangeText={setStartTime}
                                placeholder="09:00 AM"
                            />
                        </View>
                        <View style={styles.dash} />
                        <View style={styles.halfInputContainer}>
                            <Text style={styles.subLabel}>End Time</Text>
                            <TextInput
                                style={styles.timeInput}
                                value={endTime}
                                onChangeText={setEndTime}
                                placeholder="05:00 PM"
                            />
                        </View>
                    </View>
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
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkBlue,
        marginBottom: 12,
    },
    subLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 6,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        height: 50,
    },
    flexInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
    },
    iconButton: {
        padding: 8,
    },
    helperText: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 6,
        fontStyle: 'italic',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    valueText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    radiusLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    tinyText: {
        fontSize: 12,
        color: COLORS.gray,
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayChip: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dayChipSelected: {
        backgroundColor: COLORS.darkBlue,
        borderColor: COLORS.darkBlue,
    },
    dayText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    dayTextSelected: {
        color: COLORS.white,
    },
    rowInput: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    halfInputContainer: {
        flex: 1,
    },
    dash: {
        width: 16,
        height: 2,
        backgroundColor: '#CBD5E1',
        marginHorizontal: 16,
        marginTop: 20, // Align with input
    },
    timeInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 16,
        fontSize: 16,
        color: COLORS.black,
        textAlign: 'center',
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

export default ServiceProviderServiceAreaScreen;
