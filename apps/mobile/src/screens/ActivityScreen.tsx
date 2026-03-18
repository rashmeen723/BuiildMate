import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import { authApi, rentalsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

type ActivityScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Activity'>;

const { width } = Dimensions.get('window');

const ActivityScreen = () => {
    const navigation = useNavigation<ActivityScreenNavigationProp>();
    const { user } = useAuth();
    const isProvider = user?.role === 'SERVICE_PROVIDER';
    const [ongoingServices, setOngoingServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('ALL');

    // Mock Data for Active Rentals (Customer side)
    const [rentals, setRentals] = useState<any[]>([]);

    const route = useRoute<RouteProp<RootStackParamList, 'Activity'>>();

    useFocusEffect(
        useCallback(() => {
            const fetchActivity = async () => {
                if (!user) return;
                try {
                    setLoading(true);
                    let data;
                    if (isProvider) {
                        data = await authApi.getProviderBookings(user.id);
                    } else {
                        data = await authApi.getUserBookings(user.id);
                        const rentalData = await rentalsApi.getUserRentals(user.id);
                        setRentals(rentalData);
                    }
                    setOngoingServices(data);
                } catch (error) {
                    console.error('Error fetching activity:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchActivity();
        }, [user, isProvider])
    );

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'WAITING CONFIRMATION';
            case 'CONFIRMED': return 'PROVIDER CONFIRMED';
            case 'COMPLETED': return 'COMPLETED';
            case 'PAID': return 'COMPLETED';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return COLORS.orange;
            case 'CONFIRMED': return '#4F46E5';
            case 'COMPLETED': return '#10B981';
            case 'PAID': return '#059669';
            default: return COLORS.gray;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Activity</Text>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('Notification')}
                >
                    <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {isProvider && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
                        {['ALL', 'PENDING', 'ACTIVE', 'COMPLETED'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Ongoing Services</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{ongoingServices.length} ACTIVE</Text>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.orange} style={{ marginVertical: 20 }} />
                ) : (
                    (() => {
                        const filteredServices = ongoingServices.filter(s => {
                            if (!isProvider) return true;
                            if (selectedTab === 'ALL') return true;
                            if (selectedTab === 'PENDING') return s.status === 'PENDING';
                            if (selectedTab === 'ACTIVE') return s.status === 'CONFIRMED' || s.status === 'ON_THE_WAY' || s.status === 'ARRIVED';
                            if (selectedTab === 'COMPLETED') return s.status === 'COMPLETED' || s.status === 'PAID';
                            return true;
                        });

                        return filteredServices.length > 0 ? filteredServices.map((service) => (
                            <View key={service.id} style={styles.card}>
                                <View style={styles.cardContent}>
                                    <View style={styles.textContainer}>
                                        <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
                                            {getStatusText(service.status)}
                                        </Text>
                                        <Text style={styles.cardTitle}>{service.serviceType}</Text>
                                        <Text style={styles.subText}>
                                            {isProvider ? 'Customer: ' : 'Provider: '}
                                            {isProvider ? (service.customer?.fullName || 'N/A') : (service.provider?.fullName || 'N/A')}
                                        </Text>

                                        <View style={styles.buttonRow}>
                                            {isProvider && service.status === 'PENDING' ? (
                                                <TouchableOpacity
                                                    style={[styles.trackButton, { backgroundColor: COLORS.orange }]}
                                                    onPress={async () => {
                                                        try {
                                                            await authApi.updateBookingStatus(service.id.toString(), 'CONFIRMED');
                                                            const data = await authApi.getProviderBookings(user!.id);
                                                            setOngoingServices(data);
                                                        } catch (error) {
                                                            console.error(error);
                                                        }
                                                    }}
                                                >
                                                    <Text style={styles.trackButtonText}>Accept</Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.trackButton}
                                                    onPress={() => {
                                                        navigation.navigate('TrackService', {
                                                            serviceId: service.id,
                                                            providerId: isProvider ? service.customerId : (service.provider?.userId || service.providerId),
                                                            providerName: isProvider ? (service.customer?.fullName || 'Customer') : (service.provider?.fullName || 'Provider'),
                                                            serviceType: service.serviceType,
                                                            status: service.status,
                                                            arrivedAt: service.arrivedAt,
                                                            serviceImage: isProvider ? (service.customer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.customer?.fullName || 'User')}&background=random`) : (service.provider?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.fullName || 'User')}&background=random`)
                                                        });
                                                    }}
                                                >
                                                    <Text style={styles.trackButtonText}>
                                                        {service.status === 'COMPLETED' ? 'Review Invoice' : 'Track'}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                            <Text style={styles.dateTimeText}>
                                                {new Date(service.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | {service.startTime}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )) : (
                            <View style={styles.emptyCard}>
                                <Ionicons name="calendar-outline" size={40} color={COLORS.lightGray} />
                                <Text style={styles.emptyText}>No ongoing services found</Text>
                            </View>
                        );
                    })()
                )}

                {!isProvider && (
                    <>
                        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                            <Text style={styles.sectionTitle}>Active Rentals</Text>
                        </View>
                        {rentals.map((rental) => (
                            <View key={rental.id} style={styles.card}>
                                <View style={styles.cardContent}>
                                    <View style={styles.textContainer}>
                                        <Text style={[styles.statusText, rental.status === 'PENDING' ? { color: COLORS.orange } : {}]}>
                                            {rental.status}
                                        </Text>
                                        <Text style={styles.cardTitle}>{rental.tool.name}</Text>
                                        <Text style={styles.subText}>Rental ID: #{rental.id.slice(0, 8)}</Text>
                                        <TouchableOpacity
                                            style={styles.extendButton}
                                            onPress={() => navigation.navigate('RentalStatus', {
                                                rentalId: rental.id,
                                                toolName: rental.tool.name,
                                                dueDate: new Date(rental.endDate).toLocaleDateString(),
                                                startDate: new Date(rental.startDate).toLocaleDateString(),
                                                image: rental.tool.images?.[0],
                                                status: rental.status,
                                                ownerName: rental.tool.owner.user.fullName,
                                                ownerId: rental.tool.owner.userId,
                                                ownerAddress: rental.pickupLocation,
                                                paymentMethod: rental.paymentMethod,
                                                isPaid: rental.isPaid,
                                                totalAmount: rental.totalAmount,
                                                reviews: rental.reviews || []
                                            })}
                                        >
                                            <Text style={styles.extendButtonText}>View Status</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Image source={{ uri: rental.tool.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
                                </View>
                            </View>
                        ))}
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomNavBar />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.black,
    },
    headerTitle: {
        fontSize: 20,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4F46E5',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    subText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 16,
    },
    trackButton: {
        backgroundColor: '#111827',
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    trackButtonText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    extendButton: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.black,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    extendButtonText: {
        color: COLORS.black,
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateTimeText: {
        fontSize: 11,
        color: COLORS.gray,
        fontWeight: '500',
    },
    emptyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyText: {
        marginTop: 12,
        color: COLORS.gray,
        fontSize: 14,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingBottom: 20,
        gap: 12,
        paddingHorizontal: 4,
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 8,
    },
    tabButtonActive: {
        backgroundColor: COLORS.darkBlue,
        borderColor: COLORS.darkBlue,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray,
    },
    tabTextActive: {
        color: COLORS.white,
    }
});

export default ActivityScreen;
