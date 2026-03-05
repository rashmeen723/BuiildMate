import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator } from 'react-native';

type ActivityScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Activity'>;

const { width } = Dimensions.get('window');

const ActivityScreen = () => {
    const navigation = useNavigation<ActivityScreenNavigationProp>();
    const { user } = useAuth();
    const isProvider = user?.role === 'SERVICE_PROVIDER';
    const [ongoingServices, setOngoingServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('ALL');

    // Mock Data for Ongoing Services
    const initialServices = [
        {
            id: 1,
            title: 'Electrical Repair',
            status: 'Provider On Route',
            provider: 'Alex R.',
            image: 'https://randomuser.me/api/portraits/men/32.jpg',
            statusColor: 'blue'
        },
        {
            id: 2,
            title: 'Deep House Cleaning',
            status: 'Accepted Schedule',
            provider: 'Sarah W.',
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            statusColor: 'blue'
        },
        {
            id: 3,
            title: 'Plumbing Service',
            status: 'PAYMENT DUE',
            provider: 'Mike T.',
            image: 'https://randomuser.me/api/portraits/men/45.jpg',
            statusColor: 'red'
        }
    ];

    // Mock Data for Active Rentals
    const [rentals, setRentals] = useState([
        {
            id: 1,
            title: 'Makita LXT Power Drill',
            rentalId: '#BM-9921',
            status: 'DUE IN 2 DAYS',
            image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            statusColor: 'blue'
        },
        {
            id: 2,
            title: 'Bosch Professional Grinder',
            rentalId: '#BM-3341',
            status: 'PAYMENT DUE',
            image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            statusColor: 'red'
        }
    ]);

    const route = useRoute<RouteProp<RootStackParamList, 'Activity'>>();

    useFocusEffect(
        useCallback(() => {
            const fetchBookings = async () => {
                if (!user) return;
                try {
                    let data;
                    if (isProvider) {
                        data = await authApi.getProviderBookings(user.id);
                    } else {
                        data = await authApi.getUserBookings(user.id);
                    }
                    setOngoingServices(data);
                } catch (error) {
                    console.error('Error fetching bookings:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchBookings();
        }, [user])
    );

    React.useEffect(() => {
        if (route.params?.updatedRentalId && route.params?.newStatus) {
            setRentals(prevRentals => prevRentals.map(rental =>
                rental.id === (route.params as any).updatedRentalId
                    ? { ...rental, status: (route.params as any).newStatus || rental.status }
                    : rental
            ));
        }
    }, [route.params]);

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

                {/* Ongoing Services Section */}
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
                            if (!isProvider) return true; // Show all to Customers (or handle differently)
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
                                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                                    <TouchableOpacity
                                                        style={[styles.trackButton, { backgroundColor: COLORS.orange }]}
                                                        onPress={async () => {
                                                            try {
                                                                await authApi.updateBookingStatus(service.id.toString(), 'CONFIRMED');
                                                                // Reload bookings
                                                                const data = await authApi.getProviderBookings(user.id);
                                                                setOngoingServices(data);
                                                            } catch (error) {
                                                                console.error(error);
                                                            }
                                                        }}
                                                    >
                                                        <Text style={styles.trackButtonText}>Accept</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[styles.trackButton, { backgroundColor: COLORS.gray }]}
                                                        onPress={async () => {
                                                            try {
                                                                await authApi.updateBookingStatus(service.id.toString(), 'REJECTED');
                                                                // Reload bookings
                                                                const data = await authApi.getProviderBookings(user.id);
                                                                setOngoingServices(data);
                                                            } catch (error) {
                                                                console.error(error);
                                                            }
                                                        }}
                                                    >
                                                        <Text style={styles.trackButtonText}>Decline</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : service.status !== 'PAID' ? (
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
                                            ) : (
                                                !isProvider && (
                                                    service.reviews?.some((r: any) => r.reviewerId === user?.id) ? (
                                                        <View style={[styles.trackButton, { backgroundColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }]}>
                                                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                                            <Text style={[styles.trackButtonText, { color: '#6B7280', marginLeft: 4 }]}>Rated</Text>
                                                        </View>
                                                    ) : (
                                                        <TouchableOpacity
                                                            style={[styles.trackButton, { backgroundColor: COLORS.orange }]}
                                                            onPress={() => {
                                                                navigation.navigate('WriteReview', {
                                                                    serviceId: service.id.toString(),
                                                                    providerId: service.provider?.id || service.provider?.userId || service.providerId,
                                                                    serviceName: service.serviceType,
                                                                    providerName: service.provider?.fullName || 'Provider',
                                                                    serviceImage: service.provider?.profileImage || 'https://via.placeholder.com/150'
                                                                });
                                                            }}
                                                        >
                                                            <Text style={styles.trackButtonText}>Rate Provider</Text>
                                                        </TouchableOpacity>
                                                    )
                                                )
                                            )}

                                            <Text style={styles.dateTimeText}>
                                                {new Date(service.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | {service.startTime}
                                            </Text>
                                        </View>
                                    </View>
                                    <Image
                                        source={{ uri: isProvider ? (service.customer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.customer?.fullName || 'User')}&background=random`) : (service.provider?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.fullName || 'User')}&background=random`) }}
                                        style={styles.cardImage}
                                    />
                                </View>
                            </View>
                        )) : (
                            <View style={styles.emptyCard}>
                                <Ionicons name="calendar-outline" size={40} color={COLORS.lightGray} />
                                <Text style={styles.emptyText}>No ongoing services found</Text>
                            </View>
                        );
                    }))()}

                {/* Active Rentals Section */}
                {!isProvider && (
                    <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                        <Text style={styles.sectionTitle}>Active Rentals</Text>
                    </View>
                )}

                {!isProvider && rentals.map((rental) => (
                    <View key={rental.id} style={styles.card}>
                        <View style={styles.cardContent}>
                            <View style={styles.textContainer}>
                                <Text style={[styles.statusText, rental.status === 'EXTENSION PENDING' ? { color: COLORS.orange } : {}]}>
                                    {rental.status}
                                </Text>
                                <Text style={styles.cardTitle}>{rental.title}</Text>
                                <Text style={styles.subText}>Rental ID: {rental.rentalId}</Text>
                                {rental.status === 'PAYMENT DUE' ? (
                                    <TouchableOpacity
                                        style={[styles.trackButton, { backgroundColor: COLORS.darkBlue }]}
                                        onPress={() => navigation.navigate('Payment', {
                                            id: rental.id,
                                            title: rental.title,
                                            amount: 1200, // Mock rental amount
                                            type: 'RENTAL'
                                        })}
                                    >
                                        <Text style={styles.trackButtonText}>Pay Now</Text>
                                    </TouchableOpacity>
                                ) : rental.status === 'EXTENSION PENDING' ? (
                                    <View style={styles.pendingBadge}>
                                        <Ionicons name="time-outline" size={14} color={COLORS.orange} />
                                        <Text style={styles.pendingText}>Waiting for approval</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.extendButton}
                                        onPress={() => navigation.navigate('RentalStatus', {
                                            rentalId: rental.id,
                                            toolName: rental.title,
                                            dueDate: 'November 24, 2025', // Mock due date
                                            image: rental.image
                                        })}
                                    >
                                        <Text style={styles.extendButtonText}>Extend</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Image source={{ uri: rental.image }} style={styles.cardImage} />
                        </View>
                    </View>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNavBar />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light gray background for contrast
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
        backgroundColor: '#F3F4F6', // Light gray background for section header area
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black, // Dark/Black color
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        fontSize: 12,
        color: '#9CA3AF', // Gray color
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
        color: '#4F46E5', // Indigo/Blue color
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
        color: '#6B7280', // Gray color
        marginBottom: 16,
    },
    trackButton: {
        backgroundColor: '#111827', // Dark/Black background
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
        borderTopColor: '#E5E7EB',
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        marginTop: 4,
        color: '#6B7280',
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FFF7ED',
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    pendingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.orange,
        marginLeft: 6,
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
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
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
