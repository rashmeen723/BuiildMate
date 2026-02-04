import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';

type ServiceProviderDocumentsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ServiceProviderDocuments'>;
type ServiceProviderDocumentsRouteProp = RouteProp<RootStackParamList, 'ServiceProviderDocuments'>;

const ServiceProviderDocumentsScreen = () => {
    const navigation = useNavigation<ServiceProviderDocumentsNavigationProp>();
    const route = useRoute<ServiceProviderDocumentsRouteProp>();
    const { email, fullName, phone, role, professionalDetails, currentDocuments } = route.params;

    const [idImage, setIdImage] = useState<string | null>(currentDocuments?.idImage || null);
    const [certificateImages, setCertificateImages] = useState<string[]>(currentDocuments?.certificateImages || []);
    const [businessRegNum, setBusinessRegNum] = useState(currentDocuments?.businessRegNum || '');

    const pickImage = async (type: 'id' | 'cert') => {
        // Request permissions
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
                setCertificateImages([...certificateImages, result.assets[0].uri]);
            }
        }
    };

    const removeCert = (index: number) => {
        const newCerts = [...certificateImages];
        newCerts.splice(index, 1);
        setCertificateImages(newCerts);
    };

    const handleNext = () => {
        if (!idImage) {
            Alert.alert("Required", "Please upload a copy of your National ID or Passport.");
            return;
        }

        navigation.navigate('ServiceProviderServiceArea', {
            email,
            fullName,
            phone,
            role,
            professionalDetails,
            documents: {
                idImage,
                certificateImages,
                businessRegNum
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Documents</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Verify your Identity</Text>
                <Text style={styles.subtitle}>Upload documents to verify your professional status.</Text>

                {/* National ID / Passport */}
                <View style={styles.section}>
                    <Text style={styles.label}>National ID / Passport <Text style={styles.required}>*</Text></Text>

                    {!idImage ? (
                        <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('id')}>
                            <Ionicons name="cloud-upload-outline" size={40} color={COLORS.darkBlue} />
                            <Text style={styles.uploadText}>Tap to Upload ID</Text>
                            <Text style={styles.uploadSubtext}>Supports JPG, PNG</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: idImage }} style={styles.previewImage} resizeMode="cover" />
                            <TouchableOpacity style={styles.removeButton} onPress={() => setIdImage(null)}>
                                <Ionicons name="close-circle" size={24} color={COLORS.error} />
                            </TouchableOpacity>
                            <View style={styles.successBadge}>
                                <Ionicons name="checkmark-circle" size={16} color="white" />
                                <Text style={styles.successText}>Uploaded</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Certificates */}
                <View style={styles.section}>
                    <Text style={styles.label}>Professional Certificates (Optional)</Text>
                    <TouchableOpacity style={styles.miniUploadButton} onPress={() => pickImage('cert')}>
                        <Ionicons name="add" size={20} color={COLORS.white} />
                        <Text style={styles.miniUploadText}>Add Certificate</Text>
                    </TouchableOpacity>

                    {certificateImages.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.certScroll}>
                            {certificateImages.map((uri, index) => (
                                <View key={index} style={styles.certPreview}>
                                    <Image source={{ uri }} style={styles.certImage} />
                                    <TouchableOpacity style={styles.certRemove} onPress={() => removeCert(index)}>
                                        <Ionicons name="close-circle" size={20} color={COLORS.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Business Registration */}
                <View style={styles.section}>
                    <Text style={styles.label}>Business Registration Number (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. BR-12345678"
                        placeholderTextColor={COLORS.gray}
                        value={businessRegNum}
                        onChangeText={setBusinessRegNum}
                        autoCapitalize="characters"
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
        marginBottom: 28,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkBlue,
        marginBottom: 12,
    },
    required: {
        color: '#EF4444',
    },
    uploadBox: {
        height: 180,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkBlue,
        marginTop: 12,
    },
    uploadSubtext: {
        fontSize: 13,
        color: COLORS.gray,
        marginTop: 4,
    },
    previewContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 12,
    },
    successBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#10B981', // Green
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    successText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    miniUploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.darkBlue,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    miniUploadText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    certScroll: {
        flexDirection: 'row',
    },
    certPreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
        position: 'relative',
    },
    certImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    certRemove: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    input: {
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

export default ServiceProviderDocumentsScreen;
