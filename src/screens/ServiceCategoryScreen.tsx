import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';

type ServiceCategoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ServiceCategory'>;
type ServiceCategoryScreenRouteProp = RouteProp<RootStackParamList, 'ServiceCategory'>;

interface Provider {
    id: number;
    name: string;
    distance: string;
    rating: number;
    reviews: number;
    price: string;
    priceUnit: string;
    availability: string;
    image: string;
    verified: boolean;
}

const ServiceCategoryScreen = () => {
    const navigation = useNavigation<ServiceCategoryScreenNavigationProp>();
    const route = useRoute<ServiceCategoryScreenRouteProp>();

    const { categoryName = 'Electrician' } = route.params || {};

    // State management
    const [address, setAddress] = useState('216 Ananda Road, Moratuwa, Colombo');
    const [tempAddress, setTempAddress] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Fetch providers from API
    const fetchProviders = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API endpoint when backend is ready
            // const response = await fetch(`${API_BASE_URL}/providers?category=${categoryName}&location=${address}&date=${selectedDate.toISOString()}`);
            // const data = await response.json();

            // Mock data for now - simulating API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockProviders: Provider[] = [
                {
                    id: 1,
                    name: 'John Perera',
                    distance: '1.5 km away',
                    rating: 4.8,
                    reviews: 120,
                    price: 'LKR 1500',
                    priceUnit: '/ per hour',
                    availability: `Available at ${formatTime(selectedTime)}`,
                    image: 'https://randomuser.me/api/portraits/men/32.jpg',
                    verified: true,
                },
                {
                    id: 2,
                    name: 'Kamal Silva',
                    distance: '2.00 km away',
                    rating: 4.8,
                    reviews: 120,
                    price: 'LKR 1200',
                    priceUnit: '/ per hour',
                    availability: 'Available at 2:00 PM',
                    image: 'https://randomuser.me/api/portraits/men/45.jpg',
                    verified: false,
                },
                {
                    id: 3,
                    name: 'Nimal Fernando',
                    distance: '1.5 km away',
                    rating: 4.8,
                    reviews: 120,
                    price: 'LKR 1500',
                    priceUnit: '/ per hour',
                    availability: 'Available at 2:30 PM',
                    image: 'https://randomuser.me/api/portraits/men/12.jpg',
                    verified: true,
                },
            ];

            setProviders(mockProviders);
        } catch (error) {
            console.error('Error fetching providers:', error);
            Alert.alert('Error', 'Failed to load service providers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, [categoryName, address, selectedDate, selectedTime]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatTimeRange = (date: Date) => {
        const start = formatTime(date);
        const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
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

    const handleSaveAddress = () => {
        if (tempAddress.trim()) {
            setAddress(tempAddress);
            setShowAddressModal(false);
            setTempAddress('');
        } else {
            Alert.alert('Error', 'Please enter a valid address');
        }
    };

    const openAddressModal = () => {
        setTempAddress(address);
        setShowAddressModal(true);
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
                <Text style={styles.headerTitle}>{categoryName} Services</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Service Address */}
                <View style={styles.addressCard}>
                    <View style={styles.addressHeader}>
                        <Ionicons name="location" size={20} color={COLORS.orange} />
                        <Text style={styles.addressLabel}>SERVICE ADDRESS</Text>
                    </View>
                    <View style={styles.addressRow}>
                        <Text style={styles.addressText}>{address}</Text>
                        <TouchableOpacity onPress={openAddressModal}>
                            <Ionicons name="pencil" size={20} color={COLORS.orange} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date & Time Selection */}
                <Text style={styles.sectionLabel}>When do you need the service?</Text>
                <View style={styles.dateTimeRow}>
                    <TouchableOpacity style={styles.dateTimeCard} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.orange} />
                        <View style={styles.dateTimeInfo}>
                            <Text style={styles.dateTimeLabel}>DATE</Text>
                            <Text style={styles.dateTimeValue}>{formatDate(selectedDate)}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dateTimeCard} onPress={() => setShowTimePicker(true)}>
                        <Ionicons name="time-outline" size={20} color={COLORS.orange} />
                        <View style={styles.dateTimeInfo}>
                            <Text style={styles.dateTimeLabel}>TIME</Text>
                            <Text style={styles.dateTimeValue}>{formatTimeRange(selectedTime)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Recommended List */}
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Recommended List</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {/* Loading Indicator */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.darkBlue} />
                        <Text style={styles.loadingText}>Finding available providers...</Text>
                    </View>
                )}

                {/* Provider Cards */}
                {!loading && providers.map((provider) => (
                    <View key={provider.id} style={styles.providerCard}>
                        <Image source={{ uri: provider.image }} style={styles.providerImage} />

                        <View style={styles.providerInfo}>
                            <View style={styles.providerHeader}>
                                <Text style={styles.providerName}>{provider.name}</Text>
                                {provider.verified && (
                                    <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />
                                )}
                            </View>

                            <View style={styles.providerMeta}>
                                <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                                <Text style={styles.distanceText}>{provider.distance}</Text>
                            </View>

                            <View style={styles.ratingRow}>
                                <Text style={styles.ratingValue}>{provider.rating}</Text>
                                <View style={styles.starsContainer}>{renderStars(provider.rating)}</View>
                                <Text style={styles.reviewCount}>({provider.reviews} reviews)</Text>
                            </View>

                            <View style={styles.priceRow}>
                                <Text style={styles.priceValue}>{provider.price}</Text>
                                <Text style={styles.priceUnit}>{provider.priceUnit}</Text>
                            </View>

                            <View style={styles.availabilityRow}>
                                <View style={styles.availabilityDot} />
                                <Text style={styles.availabilityText}>{provider.availability}</Text>
                            </View>

                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.viewProfileBtn}
                                    onPress={() => navigation.navigate('ProviderProfile', {
                                        providerId: provider.id,
                                        providerName: provider.name,
                                        providerImage: provider.image,
                                        providerRating: provider.rating,
                                        providerReviews: provider.reviews,
                                    })}
                                >
                                    <Text style={styles.viewProfileText}>View profile</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.bookNowBtn}
                                    onPress={() => navigation.navigate('BookService', {
                                        providerId: provider.id,
                                        providerName: provider.name,
                                        providerImage: provider.image,
                                        providerRating: provider.rating,
                                        providerReviews: provider.reviews,
                                    })}
                                >
                                    <Text style={styles.bookNowText}>Book Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

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

            {/* Address Edit Modal */}
            <Modal
                visible={showAddressModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddressModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Service Address</Text>
                            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.black} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.addressInput}
                            value={tempAddress}
                            onChangeText={setTempAddress}
                            placeholder="Enter your address"
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                            <Text style={styles.saveButtonText}>Save Address</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bottom Navigation */}
            <BottomNavBar />
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
    addressCard: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.gray,
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    addressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.black,
        lineHeight: 20,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 12,
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    dateTimeCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
    },
    dateTimeInfo: {
        marginLeft: 12,
    },
    dateTimeLabel: {
        fontSize: 11,
        color: COLORS.gray,
        fontWeight: '600',
        marginBottom: 2,
    },
    dateTimeValue: {
        fontSize: 13,
        color: COLORS.black,
        fontWeight: '600',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    viewAllText: {
        fontSize: 14,
        color: COLORS.gray,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.gray,
    },
    providerCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    providerImage: {
        width: 90,
        height: 120,
        borderRadius: 12,
        marginRight: 16,
    },
    providerInfo: {
        flex: 1,
    },
    providerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    providerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    providerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    distanceText: {
        fontSize: 13,
        color: COLORS.gray,
        marginLeft: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        marginRight: 6,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 6,
    },
    reviewCount: {
        fontSize: 12,
        color: COLORS.gray,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    priceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    priceUnit: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 4,
    },
    availabilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    availabilityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    availabilityText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    viewProfileBtn: {
        flex: 1,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.orange,
        borderRadius: 8,
        alignItems: 'center',
    },
    viewProfileText: {
        fontSize: 12,
        color: COLORS.orange,
        fontWeight: '600',
    },
    bookNowBtn: {
        flex: 1,
        paddingVertical: 8,
        backgroundColor: COLORS.darkBlue,
        borderRadius: 8,
        alignItems: 'center',
    },
    bookNowText: {
        fontSize: 12,
        color: COLORS.white,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    addressInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: COLORS.black,
        marginBottom: 20,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
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

export default ServiceCategoryScreen;
