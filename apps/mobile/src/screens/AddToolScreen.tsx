import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import { rentalsApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddToolScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RootStackParamList, 'AddTool'>>();
    const toolToEdit = route?.params?.tool;
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(toolToEdit?.images?.[0] || null);

    const [formData, setFormData] = useState({
        name: toolToEdit?.name || '',
        description: toolToEdit?.description || '',
        category: toolToEdit?.category || '',
        dailyRate: toolToEdit?.dailyRate?.toString() || '',
    });

    const categories = ['Power Tools', 'Hand Tools', 'Ladders', 'Painting', 'Construction', 'Gardening', 'Cleaning', 'Safety Gear', 'Scaffolding', 'Other'];

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to upload tool images.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleDelete = async () => {
        if (!toolToEdit) return;

        Alert.alert(
            "Delete Tool",
            "Are you sure you want to remove this tool from your inventory?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await rentalsApi.deleteTool(toolToEdit.id);
                            Alert.alert("Success", "Tool removed from inventory!");
                            navigation.goBack();
                        } catch (error: any) {
                            Alert.alert("Error", error.message || "Failed to delete tool.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        if (!formData.name || !formData.dailyRate || !formData.category) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (isNaN(Number(formData.dailyRate))) {
            Alert.alert('Error', 'Daily rate must be a number');
            return;
        }

        setLoading(true);
        try {
            let toolImages: string[] = [];

            if (selectedImage) {
                if (selectedImage.startsWith('http')) {
                    toolImages.push(selectedImage);
                } else {
                    setUploadingImage(true);
                    try {
                        const imageUrl = await authApi.uploadPublicFile(selectedImage);
                        toolImages.push(imageUrl);
                    } catch (uploadError) {
                        console.error('Cloudinary upload failed:', uploadError);
                        Alert.alert('Upload Warning', 'Failed to upload image. Saving without image.');
                    } finally {
                        setUploadingImage(false);
                    }
                }
            }

            if (toolToEdit) {
                await rentalsApi.updateTool(toolToEdit.id, {
                    ...formData,
                    dailyRate: Number(formData.dailyRate),
                    images: toolImages,
                });
                Alert.alert('Success', 'Tool updated successfully!');
            } else {
                await rentalsApi.addTool(user?.id || '', {
                    ...formData,
                    dailyRate: Number(formData.dailyRate),
                    images: toolImages,
                });
                Alert.alert('Success', 'Tool added to your inventory!');
            }
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save tool');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{toolToEdit ? 'Edit Tool Details' : 'Add New Tool'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity
                        style={styles.imagePlaceholder}
                        onPress={pickImage}
                        disabled={uploadingImage || loading}
                    >
                        {selectedImage ? (
                            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                        ) : (
                            <>
                                <Ionicons name="camera-outline" size={40} color="#94A3B8" />
                                <Text style={styles.imagePlaceholderText}>Add Tool Image</Text>
                            </>
                        )}
                        {uploadingImage && (
                            <View style={styles.uploadOverlay}>
                                <ActivityIndicator color={COLORS.white} />
                                <Text style={styles.uploadingText}>Uploading...</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tool Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Bosch Hammer Drill"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category *</Text>
                        <View style={styles.categoryContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        formData.category === cat && styles.categoryChipActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, category: cat })}
                                >
                                    <Text style={[
                                        styles.categoryChipText,
                                        formData.category === cat && styles.categoryChipTextActive
                                    ]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Daily Rate (LKR) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 1500"
                            keyboardType="numeric"
                            value={formData.dailyRate}
                            onChangeText={(text) => setFormData({ ...formData, dailyRate: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe the tool condition, specs, etc."
                            multiline
                            numberOfLines={4}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, (loading || uploadingImage) && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading || uploadingImage}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>{toolToEdit ? 'Save Changes' : 'Add to Inventory'}</Text>
                        )}
                    </TouchableOpacity>

                    {toolToEdit && (
                        <TouchableOpacity
                            style={[styles.deleteButton, loading && { opacity: 0.7 }]}
                            onPress={handleDelete}
                            disabled={loading || uploadingImage}
                        >
                            {loading ? (
                                <ActivityIndicator color="#EF4444" />
                            ) : (
                                <Text style={styles.deleteButtonText}>Remove Tool</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    scrollContent: {
        padding: 24,
    },
    imagePlaceholder: {
        height: 220,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        overflow: 'hidden',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholderText: {
        marginTop: 12,
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '500',
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingText: {
        color: COLORS.white,
        marginTop: 8,
        fontSize: 12,
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.black,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
    },
    categoryChipActive: {
        backgroundColor: COLORS.darkBlue,
    },
    categoryChipText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    categoryChipTextActive: {
        color: COLORS.white,
    },
    saveButton: {
        backgroundColor: COLORS.darkBlue,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        borderWidth: 1.5,
        borderColor: '#EF4444',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 40,
    },
    deleteButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddToolScreen;
