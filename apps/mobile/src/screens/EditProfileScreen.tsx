import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
type EditProfileScreenRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen = () => {
    const navigation = useNavigation<EditProfileScreenNavigationProp>();
    const route = useRoute<EditProfileScreenRouteProp>();
    const { user, token, login } = useAuth();

    const [name, setName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [location, setLocation] = useState(user?.addresses?.[0]?.addressLine1 || '');
    const [selectedCoords, setSelectedCoords] = useState<any>(null);
    const [image, setImage] = useState(user?.profileImage || '');
    const [loading, setLoading] = useState(false);

    // Handle return from MapSelection
    useEffect(() => {
        if (route.params?.selectedLocation) {
            setSelectedCoords(route.params.selectedLocation);
            if (route.params.selectedAddress) {
                setLocation(route.params.selectedAddress);
            }
        }
    }, [route.params?.selectedLocation, route.params?.selectedAddress]);

    const handleLocationPress = () => {
        navigation.navigate('MapSelection', {
            returnScreen: 'EditProfile',
            currentAddress: location,
            ...route.params
        });
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Error', 'Please fill in name and phone number');
            return;
        }

        setLoading(true);
        try {
            if (token) {
                let finalImageUrl = image;

                // Check if the image is a local URI (needs upload)
                if (image && (image.startsWith('file://') || image.startsWith('content://'))) {
                    console.log('Detected new local image, uploading to Cloudinary...');
                    const uploadResult = await authApi.uploadProfileImage(token, image);
                    finalImageUrl = uploadResult.imageUrl;
                }

                const updatedUser = await authApi.updateProfile(token, {
                    fullName: name,
                    phone: phone,
                    profileImage: finalImageUrl,
                    selectedLocation: selectedCoords,
                    selectedAddress: location
                });

                // Update local context
                await login(updatedUser, token);

                Alert.alert('Success', 'Profile updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Image Picker */}
                <View style={styles.imageContainer}>
                    <View style={styles.imageWrapper}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImage, { backgroundColor: COLORS.orange, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ color: COLORS.white, fontSize: 40, fontWeight: 'bold' }}>
                                    {name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                            <Ionicons name="camera" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                            placeholderTextColor={COLORS.gray}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.gray}
                            editable={false}
                        />
                        <Text style={styles.helperText}>Email cannot be changed.</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                            placeholderTextColor={COLORS.gray}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location</Text>
                        <View style={styles.locationInputWrapper}>
                            <TextInput
                                style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Start typing address..."
                                placeholderTextColor={COLORS.gray}
                                editable={false}
                            />
                            <TouchableOpacity style={styles.locationBtn} onPress={handleLocationPress}>
                                <Ionicons name="location" size={20} color={COLORS.orange} />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>

            </ScrollView>
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    imageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#F3F4F6',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.darkBlue,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    formContainer: {
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: '#F9FAFB',
    },
    disabledInput: {
        backgroundColor: '#F3F4F6',
        color: '#9CA3AF',
    },
    helperText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
        marginLeft: 4,
    },
    locationInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationBtn: {
        height: 56, // Match input height roughly
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: '#E5E7EB',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditProfileScreen;
