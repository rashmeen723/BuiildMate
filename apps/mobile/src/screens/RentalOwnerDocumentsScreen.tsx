import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

type RentalOwnerDocumentsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalOwnerDocuments'>;
type RentalOwnerDocumentsRouteProp = RouteProp<RootStackParamList, 'RentalOwnerDocuments'>;

const RentalOwnerDocumentsScreen = () => {
    const navigation = useNavigation<RentalOwnerDocumentsNavigationProp>();
    const route = useRoute<RentalOwnerDocumentsRouteProp>();
    const { email, fullName, phone, role, rentalDetails, currentDocuments } = route.params;

    const [idImageFront, setIdImageFront] = useState<string | null>(currentDocuments?.idImageFront || null);
    const [idImageBack, setIdImageBack] = useState<string | null>(currentDocuments?.idImageBack || null);
    const [profileImage, setProfileImage] = useState<string | null>(currentDocuments?.profileImage || null);
    const [businessDoc, setBusinessDoc] = useState<string | null>(currentDocuments?.businessDoc || null);

    const pickImage = async (type: 'idFront' | 'idBack' | 'profile') => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You've refused to allow this app to access your photos!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.5,
        });

        if (!result.canceled) {
            if (type === 'idFront') {
                setIdImageFront(result.assets[0].uri);
            } else if (type === 'idBack') {
                setIdImageBack(result.assets[0].uri);
            } else if (type === 'profile') {
                setProfileImage(result.assets[0].uri);
            }
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                setBusinessDoc(result.assets[0].uri);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to pick document");
        }
    };

    const handleNext = () => {
        if (!profileImage) {
            Alert.alert("Required", "Please upload a professional profile photo.");
            return;
        }
        if (!idImageFront) {
            Alert.alert("Required", "Please upload the Front side of your National ID or Passport.");
            return;
        }
        if (!idImageBack) {
            Alert.alert("Required", "Please upload the Back side of your National ID or Passport.");
            return;
        }

        const isIndividual = rentalDetails?.ownerType === 'INDIVIDUAL';
        if (isIndividual && !businessDoc) {
            Alert.alert("Required", "Please upload your Utility Bill or Proof of Address.");
            return;
        }
        if (!isIndividual && !businessDoc) {
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
                idImageFront,
                idImageBack,
                profileImage,
                ...(isIndividual ? { utilityBill: businessDoc } : { businessDoc })
            }
        });
    };

    const isIndividual = rentalDetails?.ownerType === 'INDIVIDUAL';

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
                <Text style={styles.subtitle}>
                    {isIndividual ? 'Upload formal identification and proof of home address.' : 'Upload formal identification and business permits.'}
                </Text>

                {/* Profile Photo */}
                <View style={styles.section}>
                    <Text style={styles.label}>Profile Photo <Text style={styles.required}>*</Text></Text>
                    <Text style={styles.helperText}>A clear photo for your profile.</Text>
                    {!profileImage ? (
                        <TouchableOpacity style={[styles.uploadBox, { height: 120 }]} onPress={() => pickImage('profile')}>
                            <Ionicons name="camera-outline" size={32} color={COLORS.darkBlue} />
                            <Text style={styles.uploadText}>Tap to Upload Photo</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.avatarPreviewContainer}>
                            <Image source={{ uri: profileImage }} style={styles.avatarPreview} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => setProfileImage(null)}>
                                <Ionicons name="close-circle" size={24} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* National ID Front */}
                <View style={styles.section}>
                    <Text style={styles.label}>National ID / Passport (Front Side) <Text style={styles.required}>*</Text></Text>
                    {!idImageFront ? (
                        <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('idFront')}>
                            <Ionicons name="person-outline" size={40} color={COLORS.darkBlue} />
                            <Text style={styles.uploadText}>Upload Front Side Image</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: idImageFront }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => setIdImageFront(null)}>
                                <Ionicons name="close-circle" size={24} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* National ID Back */}
                <View style={styles.section}>
                    <Text style={styles.label}>National ID / Passport (Back Side) <Text style={styles.required}>*</Text></Text>
                    {!idImageBack ? (
                        <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('idBack')}>
                            <Ionicons name="card-outline" size={40} color={COLORS.darkBlue} />
                            <Text style={styles.uploadText}>Upload Back Side Image (Address Side)</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: idImageBack }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => setIdImageBack(null)}>
                                <Ionicons name="close-circle" size={24} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Business Registration or Utility Bill */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        {isIndividual ? 'Utility Bill / Proof of Address' : 'Business Registration / Permit'}{' '}
                        <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={styles.helperText}>
                        {isIndividual 
                            ? 'Upload a recent utility bill (Electricity, Water, or Fixed Line/Broadband bill) or tenancy agreement showing your registered home address.'
                            : 'Upload your BR or Trading License (PDF or Image).'}
                    </Text>
                    {!businessDoc ? (
                        <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
                            <Ionicons name="document-text-outline" size={40} color={COLORS.darkBlue} />
                            <Text style={styles.uploadText}>Select Document / Photo</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.previewContainer}>
                            {businessDoc.toLowerCase().endsWith('.pdf') ? (
                                <View style={styles.pdfPlaceholder}>
                                    <Ionicons name="document-attach" size={48} color={COLORS.darkBlue} />
                                    <Text style={styles.pdfText}>{businessDoc.split('/').pop()}</Text>
                                </View>
                            ) : (
                                <Image source={{ uri: businessDoc }} style={styles.previewImage} />
                            )}
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
    helperText: { fontSize: 13, color: COLORS.gray, marginBottom: 8 },
    avatarPreviewContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 2,
        borderColor: COLORS.darkBlue,
        alignSelf: 'center',
    },
    avatarPreview: {
        width: '100%',
        height: '100%',
    },
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
    pdfPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        padding: 20,
    },
    pdfText: {
        marginTop: 10,
        fontSize: 12,
        color: COLORS.gray,
        textAlign: 'center',
    },
});

export default RentalOwnerDocumentsScreen;
