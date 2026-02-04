import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';

type RentalOwnerDocumentsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalOwnerDocuments'>;
type RentalOwnerDocumentsRouteProp = RouteProp<RootStackParamList, 'RentalOwnerDocuments'>;

const RentalOwnerDocumentsScreen = () => {
    const navigation = useNavigation<RentalOwnerDocumentsNavigationProp>();
    const route = useRoute<RentalOwnerDocumentsRouteProp>();
    const { email, fullName, phone, role, rentalDetails, currentDocuments } = route.params;

    const [idImage, setIdImage] = useState<string | null>(currentDocuments?.idImage || null);
    const [businessDoc, setBusinessDoc] = useState<string | null>(currentDocuments?.businessDoc || null);

    const pickImage = async (type: 'id' | 'business') => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You've refused to allow this app to access your photos!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            if (type === 'id') {
                setIdImage(result.assets[0].uri);
            } else {
                setBusinessDoc(result.assets[0].uri);
            }
        }
    };

    const handleNext = () => {
        if (!idImage) {
            Alert.alert("Required", "Please upload a copy of your National ID or Passport.");
            return;
        }
        if (!businessDoc) {
            Alert.alert("Required", "Please upload your Business Registration or Permit.");
            return;
        }

        navigation.navigate('RentalOwnerServiceArea', {
            email,
            fullName,
            phone,
            role,
            rentalDetails,
            documents: {
                idImage,
                businessDoc
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verification</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Legal Documents</Text>
                <Text style={styles.subtitle}>Upload formal identification and business permits.</Text>

                {/* National ID */}
                <View style={styles.section}>
                    <Text style={styles.label}>Owner's National ID / Passport <Text style={styles.required}>*</Text></Text>
                    {!idImage ? (
                        <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('id')}>
                            <Ionicons name="person-outline" size={40} color={COLORS.darkBlue} />
                            <Text style={styles.uploadText}>Upload Identity Document</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: idImage }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => setIdImage(null)}>
                                <Ionicons name="close-circle" size={24} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Business Registration */}
                <View style={styles.section}>
                    <Text style={styles.label}>Business Registration / Permit <Text style={styles.required}>*</Text></Text>
                    {!businessDoc ? (
                        <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('business')}>
                            <Ionicons name="briefcase-outline" size={40} color={COLORS.darkBlue} />
                            <Text style={styles.uploadText}>Upload Business Permit</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: businessDoc }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => setBusinessDoc(null)}>
                                <Ionicons name="close-circle" size={24} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    )}
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
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
    content: { padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.darkBlue, marginBottom: 8 },
    subtitle: { fontSize: 15, color: COLORS.gray, marginBottom: 30 },
    section: { marginBottom: 28 },
    label: { fontSize: 16, fontWeight: '600', color: COLORS.darkBlue, marginBottom: 12 },
    required: { color: COLORS.error },
    uploadBox: {
        height: 150,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: { fontSize: 14, fontWeight: '600', color: COLORS.darkBlue, marginTop: 12 },
    previewContainer: {
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    previewImage: { width: '100%', height: '100%' },
    removeButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'white', borderRadius: 12 },
    footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    button: { backgroundColor: COLORS.darkBlue, paddingVertical: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default RentalOwnerDocumentsScreen;
