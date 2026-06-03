import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportIssue'>;

export default function ReportIssueScreen({ route, navigation }: Props) {
  const { reportType, id, targetId, title, subtitle, image } = route.params;
  const { user } = useAuth();
  
  const isProvider = user?.role === 'SERVICE_PROVIDER' || user?.role === 'RENTAL_OWNER';

  const customerReasons = reportType === 'RENTAL'
    ? ['Tool was damaged/broken', 'Incorrect billing', 'Unprofessional behavior', 'Other']
    : ['Provider did not show up', 'Poor quality of work', 'Unprofessional behavior', 'Payment issue', 'Other'];

  const providerReasons = reportType === 'RENTAL'
    ? ['Did not return tool', 'Tool returned damaged/broken', 'Payment issue', 'Other']
    : ['Customer did not show up', 'Unprofessional behavior', 'Scope of work mismatch', 'Safety concerns at location', 'Payment issue', 'Other'];

  const reasons = isProvider ? providerReasons : customerReasons;

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for your report.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description of the issue.');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload evidence photos to Cloudinary
      const uploadedUrls = await Promise.all(
        images.map(uri => authApi.uploadPublicFile(uri))
      );

      // Create dispute payload
      const disputePayload = {
        reporterId: user.id,
        reportedId: targetId,
        bookingId: reportType === 'SERVICE' ? id : undefined,
        rentalId: reportType === 'RENTAL' ? id : undefined,
        reason: selectedReason,
        description: description.trim(),
        evidenceImages: uploadedUrls,
      };

      // Call API
      await authApi.createDispute(disputePayload);

      Alert.alert(
        'Report Submitted',
        'Your report has been sent to our Trust & Safety team. We will review it shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Submit Dispute Failed:', error);
      Alert.alert('Submission Failed', error.message || 'Could not submit dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={isSubmitting}>
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report an Issue</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Target Info */}
        <View style={styles.targetInfoCard}>
          {image ? (
            <Image source={{ uri: image }} style={styles.targetImage} />
          ) : (
            <View style={styles.targetImagePlaceholder}>
              <Ionicons name={reportType === 'SERVICE' ? "person" : "hammer"} size={24} color="#94A3B8" />
            </View>
          )}
          <View style={styles.targetTextContainer}>
            <Text style={styles.targetTitle}>{title}</Text>
            <Text style={styles.targetSubtitle}>
              {isProvider ? `Client: ${subtitle}` : `Provider: ${subtitle}`}
            </Text>
            <Text style={styles.targetId}>ID: {id.toString().substring(0,8)}...</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>What went wrong?</Text>
        
        <View style={styles.reasonsContainer}>
          {reasons.map((reason) => (
            <TouchableOpacity 
              key={reason}
              style={[
                styles.reasonChip, 
                selectedReason === reason && styles.reasonChipSelected
              ]}
              onPress={() => setSelectedReason(reason)}
              disabled={isSubmitting}
            >
              <Text style={[
                styles.reasonText,
                selectedReason === reason && styles.reasonTextSelected
              ]}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Provide Details</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Please describe the issue in detail..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
          editable={!isSubmitting}
        />

        <Text style={styles.sectionTitle}>Attach Evidence (Photos)</Text>
        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imagePreviewContainer}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => removeImage(index)}
                disabled={isSubmitting}
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage} disabled={isSubmitting}>
              <Ionicons name="camera-outline" size={32} color="#94A3B8" />
              <Text style={styles.addImageText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            (!selectedReason || !description.trim() || isSubmitting) && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          disabled={isSubmitting || !selectedReason || !description.trim()}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
    color: '#0F172A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  targetInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  targetImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  targetImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  targetTitle: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
    color: '#0F172A',
  },
  targetSubtitle: {
    fontSize: 14,
    fontFamily: 'Outfit-Medium',
    color: '#64748B',
    marginTop: 2,
  },
  targetId: {
    fontSize: 12,
    fontFamily: 'Outfit-Regular',
    color: '#94A3B8',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
    color: '#0F172A',
    marginBottom: 12,
    marginTop: 12,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  reasonChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonChipSelected: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  reasonText: {
    fontSize: 14,
    fontFamily: 'Outfit-Medium',
    color: '#64748B',
  },
  reasonTextSelected: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontFamily: 'Outfit-Regular',
    color: '#0F172A',
    marginBottom: 12,
    height: 120,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    marginBottom: 30,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  addImageText: {
    fontSize: 10,
    fontFamily: 'Outfit-Regular',
    color: '#94A3B8',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  submitButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
  },
});
