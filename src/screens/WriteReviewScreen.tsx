import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';

type WriteReviewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WriteReview'>;
type WriteReviewScreenRouteProp = RouteProp<RootStackParamList, 'WriteReview'>;

const WriteReviewScreen = () => {
    const navigation = useNavigation<WriteReviewScreenNavigationProp>();
    const route = useRoute<WriteReviewScreenRouteProp>();

    // Default params in case they aren't passed (for testing)
    const {
        serviceName = 'Plumbing Service',
        providerName = 'Nimal Fernando',
        serviceImage = 'https://randomuser.me/api/portraits/men/32.jpg'
    } = route.params || {};

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating before submitting.');
            return;
        }

        // Mock API call
        setTimeout(() => {
            Alert.alert('Review Submitted', 'Thank you for your feedback!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }, 1000);
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity key={i} onPress={() => setRating(i)}>
                    <Ionicons
                        name={i <= rating ? 'star' : 'star-outline'}
                        size={40}
                        color={COLORS.orange}
                        style={{ marginHorizontal: 4 }}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Write a Review</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Service/Provider Card */}
                <View style={styles.serviceCard}>
                    <Image source={{ uri: serviceImage }} style={styles.serviceImage} />
                    <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{serviceName}</Text>
                        <Text style={styles.providerName}>by {providerName}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Completed</Text>
                        </View>
                    </View>
                </View>

                {/* Rating Section */}
                <View style={styles.ratingSection}>
                    <Text style={styles.questionText}>How was your experience?</Text>
                    <View style={styles.starsContainer}>
                        {renderStars()}
                    </View>
                    <Text style={styles.ratingLabel}>
                        {rating === 1 ? 'Poor' :
                            rating === 2 ? 'Fair' :
                                rating === 3 ? 'Good' :
                                    rating === 4 ? 'Very Good' :
                                        rating === 5 ? 'Excellent!' : 'Tap a star to rate'}
                    </Text>
                </View>

                {/* Review Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Write your review</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Share your experience with this service..."
                        placeholderTextColor={COLORS.gray}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        value={review}
                        onChangeText={setReview}
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit Review</Text>
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
    content: {
        padding: 24,
    },
    serviceCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    serviceImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#F3F4F6',
    },
    serviceInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    providerName: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 8,
    },
    statusBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#10B981',
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.orange,
    },
    inputContainer: {
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 8,
        marginLeft: 4,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: '#F9FAFB',
        minHeight: 120,
    },
    submitButton: {
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
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default WriteReviewScreen;
