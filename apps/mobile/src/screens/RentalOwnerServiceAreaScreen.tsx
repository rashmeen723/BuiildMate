import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';

type RentalOwnerServiceAreaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalOwnerServiceArea'>;
type RentalOwnerServiceAreaRouteProp = RouteProp<RootStackParamList, 'RentalOwnerServiceArea'>;

const RentalOwnerServiceAreaScreen = () => {
    const navigation = useNavigation<RentalOwnerServiceAreaNavigationProp>();
    const route = useRoute<RentalOwnerServiceAreaRouteProp>();
    const { email, fullName, phone, role, rentalDetails, documents, currentServiceArea } = route.params;

    const [address, setAddress] = useState(currentServiceArea?.address || '');
    const [previewLocation, setPreviewLocation] = useState(currentServiceArea?.location || null);
    const [offersDelivery, setOffersDelivery] = useState(currentServiceArea?.offersDelivery || false);

    useEffect(() => {
        if (route.params?.selectedAddress) {
            setAddress(route.params.selectedAddress);
        }
        if (route.params?.selectedLocation) {
            setPreviewLocation(route.params.selectedLocation);
        }
    }, [route.params?.selectedAddress, route.params?.selectedLocation]);

    const handleNext = () => {
        if (!address) {
            Alert.alert("Required", "Please set your store or warehouse location.");
            return;
        }

        navigation.navigate('CreatePassword', {
            email,
            fullName,
            phone,
            role,
            rentalDetails,
            documents,
            serviceArea: {
                address,
                location: previewLocation,
                offersDelivery
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Store Location</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Where are you located?</Text>
                <Text style={styles.subtitle}>Customers will pick up tools from this location.</Text>

                <View style={styles.section}>
                    <Text style={styles.label}>Store Address</Text>
                    <View style={styles.inputWithIcon}>
                        <TextInput
                            style={styles.flexInput}
                            placeholder="e.g. 45 Industrial Way"
                            value={address}
                            onChangeText={setAddress}
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('MapSelection', {
                            returnScreen: 'RentalOwnerServiceArea',
                            ...route.params
                        })}>
                            <Ionicons name="map-outline" size={24} color={COLORS.darkBlue} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.deliveryRow}
                        onPress={() => setOffersDelivery(!offersDelivery)}
                    >
                        <Ionicons
                            name={offersDelivery ? "checkbox" : "square-outline"}
                            size={24}
                            color={offersDelivery ? COLORS.darkBlue : COLORS.gray}
                        />
                        <View style={styles.deliveryTextContainer}>
                            <Text style={styles.deliveryTitle}>Deliver to Job Site</Text>
                            <Text style={styles.deliverySub}>Check this if you can deliver equipment to customers.</Text>
                        </View>
                    </TouchableOpacity>
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
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
    content: { padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.darkBlue, marginBottom: 8 },
    subtitle: { fontSize: 15, color: COLORS.gray, marginBottom: 30 },
    section: { marginBottom: 30 },
    label: { fontSize: 16, fontWeight: '600', color: COLORS.darkBlue, marginBottom: 12 },
    inputWithIcon: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#F8FAFC', paddingHorizontal: 12, height: 50 },
    flexInput: { flex: 1, fontSize: 16, color: COLORS.black },
    deliveryRow: { flexDirection: 'row', alignItems: 'flex-start' },
    deliveryTextContainer: { marginLeft: 12, flex: 1 },
    deliveryTitle: { fontSize: 16, fontWeight: '600', color: COLORS.darkBlue },
    deliverySub: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
    footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    button: { backgroundColor: COLORS.darkBlue, paddingVertical: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    backButton: { padding: 5 }
});

export default RentalOwnerServiceAreaScreen;
