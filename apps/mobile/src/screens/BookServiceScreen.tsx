import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';

type BookServiceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookService'>;
type BookServiceScreenRouteProp = RouteProp<RootStackParamList, 'BookService'>;

const BookServiceScreen = () => {
    const navigation = useNavigation<BookServiceScreenNavigationProp>();
    const route = useRoute<BookServiceScreenRouteProp>();

    const {
        providerName = 'John Perera',
        providerImage = 'https://randomuser.me/api/portraits/men/32.jpg',
        providerRating = 4.8,
        providerReviews = 120,
        providerPhone = '+9477-7863456',
        providerEmail = 'johnperera@gmail.com',
    } = route.params || {};

    const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 4)); // Nov 4, 2025
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [issuePhoto, setIssuePhoto] = useState<string | null>(null);
    const [issueDescription, setIssueDescription] = useState('');
    const [address, setAddress] = useState('216 Ananda Road, Moratuwa, Colombo');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

    const hourlyRate = 1500;
    const estimatedHours = 1.5;
    const estimatedTotal = hourlyRate * estimatedHours;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatTimeRange = (date: Date) => {
        const start = formatTime(date);
        const endDate = new Date(date.getTime() + estimatedHours * 60 * 60 * 1000);
        const end = formatTime(endDate);
        return `${start} - ${end}`;
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleTimeChange = (event: any, time?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (time) {
            setSelectedTime(time);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            setIssuePhoto(result.assets[0].uri);
        }
    };

    const handleConfirmBooking = () => {
        if (!issueDescription.trim()) {
            Alert.alert('Missing Information', 'Please describe the issue');
            return;
        }

        // TODO: Send booking request to API
        // Navigate to confirmation screen with booking details
        navigation.navigate('BookingConfirmed', {
            providerName,
            serviceType: 'Electrician', // You can pass this from route params or determine from context
            date: formatDate(selectedDate),
            time: formatTimeRange(selectedTime),
            address,
            estimatedTotal: `LKR ${estimatedTotal}`,
        });
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= Math.floor(rating) ? 'star' : i - rating < 1 ? 'star-half' : 'star-outline'}
                    size={14}
                    color={COLORS.orange}
                />
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
                <Text style={styles.headerTitle}>Book Service</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Provider Info */}
                <View style={styles.providerCard}>
                    <Image source={{ uri: providerImage }} style={styles.providerImage} />
                    <View style={styles.providerInfo}>
                        <Text style={styles.providerName}>{providerName}</Text>
                        <View style={styles.ratingRow}>
                            <Text style={styles.ratingValue}>{providerRating}</Text>
                            <View style={styles.starsContainer}>{renderStars(providerRating)}</View>
                            <Text style={styles.reviewCount}>({providerReviews} reviews)</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Ionicons name="call-outline" size={14} color={COLORS.gray} />
                            <Text style={styles.contactText}>{providerPhone}</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Ionicons name="mail-outline" size={14} color={COLORS.gray} />
                            <Text style={styles.contactText}>{providerEmail}</Text>
                        </View>
                    </View>
                </View>

                {/* Date Selection */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>DATE</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputCard}>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.orange} />
                        <View style={styles.inputInfo}>
                            <Text style={styles.inputLabel}>Date</Text>
                            <Text style={styles.inputValue}>{formatDate(selectedDate)}</Text>
                        </View>
                    </View>
                </View>

                {/* Time Selection */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>TIME</Text>
                        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputCard}>
                        <Ionicons name="time-outline" size={20} color={COLORS.orange} />
                        <View style={styles.inputInfo}>
                            <Text style={styles.inputLabel}>Time</Text>
                            <Text style={styles.inputValue}>{formatTimeRange(selectedTime)}</Text>
                        </View>
                    </View>
                </View>

                {/* Upload Photo */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>UPLOAD THE PHOTO OF THE ISSUE</Text>
                    <TouchableOpacity style={styles.uploadCard} onPress={pickImage}>
                        {issuePhoto ? (
                            <Image source={{ uri: issuePhoto }} style={styles.uploadedImage} />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload-outline" size={40} color={COLORS.orange} />
                                <Text style={styles.uploadHint}>Please upload square image less than 1 MB</Text>
                                <View style={styles.chooseFileButton}>
                                    <Text style={styles.chooseFileText}>Choose file</Text>
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Describe Issue */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DESCRIBE THE ISSUE</Text>
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="Tell us more about what needs fixing..."
                        placeholderTextColor={COLORS.gray}
                        value={issueDescription}
                        onChangeText={setIssueDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Service Address */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>SERVICE ADDRESS</Text>
                        <TouchableOpacity>
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.addressCard}>
                        <Text style={styles.addressLabel}>Address :</Text>
                        <Text style={styles.addressText}>{address}</Text>
                    </View>
                </View>

                {/* Price Estimate */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>PRICE ESTIMATE</Text>
                    <View style={styles.priceCard}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Hourly Rate</Text>
                            <Text style={styles.priceValue}>LKR {hourlyRate}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Estimated Time</Text>
                            <Text style={styles.priceValue}>{estimatedHours} hours</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.priceRow}>
                            <Text style={styles.totalLabel}>Estimated Total</Text>
                            <Text style={styles.totalValue}>LKR {estimatedTotal}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
                    <TouchableOpacity
                        style={styles.paymentOption}
                        onPress={() => setPaymentMethod('cash')}
                    >
                        <View style={styles.radioOuter}>
                            {paymentMethod === 'cash' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.paymentText}>Pay after service Cash</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.paymentOption}
                        onPress={() => setPaymentMethod('card')}
                    >
                        <View style={styles.radioOuter}>
                            {paymentMethod === 'card' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.paymentText}>Pay after service Card</Text>
                    </TouchableOpacity>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
                    <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {/* Time Picker */}
            {showTimePicker && (
                <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color={COLORS.secondary} />
                    <Text style={[styles.navText, { color: COLORS.secondary }]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="document-text-outline" size={24} color={COLORS.gray} />
                    <Text style={styles.navText}>Activity</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.gray} />
                    <Text style={styles.navText}>Notification</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person-outline" size={24} color={COLORS.gray} />
                    <Text style={styles.navText}>Account</Text>
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
    notificationButton: {
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    providerCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    providerImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 16,
    },
    providerInfo: {
        flex: 1,
    },
    providerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        marginRight: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 4,
    },
    reviewCount: {
        fontSize: 12,
        color: COLORS.gray,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    contactText: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 6,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.gray,
        letterSpacing: 0.5,
    },
    editText: {
        fontSize: 14,
        color: COLORS.darkBlue,
        fontWeight: '600',
    },
    inputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
    },
    inputInfo: {
        marginLeft: 12,
    },
    inputLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 2,
    },
    inputValue: {
        fontSize: 14,
        color: COLORS.black,
        fontWeight: '600',
    },
    uploadCard: {
        backgroundColor: '#FFFBEB',
        borderWidth: 2,
        borderColor: '#FEF3C7',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 180,
    },
    uploadedImage: {
        width: '100%',
        height: 180,
        borderRadius: 8,
    },
    uploadHint: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 12,
        marginBottom: 16,
        textAlign: 'center',
    },
    chooseFileButton: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    chooseFileText: {
        fontSize: 14,
        color: '#D97706',
        fontWeight: '600',
    },
    descriptionInput: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: COLORS.black,
        minHeight: 100,
    },
    addressCard: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
    },
    addressLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: COLORS.black,
        lineHeight: 20,
    },
    priceCard: {
        backgroundColor: COLORS.darkBlue,
        borderRadius: 12,
        padding: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 14,
        color: COLORS.white,
    },
    priceValue: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.darkBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.darkBlue,
    },
    paymentText: {
        fontSize: 14,
        color: COLORS.black,
    },
    confirmButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    confirmButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.white,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        marginTop: 4,
        color: COLORS.gray,
    },
});

export default BookServiceScreen;
