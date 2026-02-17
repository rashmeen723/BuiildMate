import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';

type ActivityScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Activity'>;

const { width } = Dimensions.get('window');

const ActivityScreen = () => {
    const navigation = useNavigation<ActivityScreenNavigationProp>();

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

    React.useEffect(() => {
        if (route.params?.updatedRentalId && route.params?.newStatus) {
            setRentals(prevRentals => prevRentals.map(rental =>
                rental.id === route.params!.updatedRentalId
                    ? { ...rental, status: route.params!.newStatus || rental.status }
                    : rental
            ));
        }
    }, [route.params]);

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

                {/* Ongoing Services Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Ongoing Services</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{initialServices.length} ACTIVE</Text>
                    </View>
                </View>

                {initialServices.map((service) => (
                    <View key={service.id} style={styles.card}>
                        <View style={styles.cardContent}>
                            <View style={styles.textContainer}>
                                <Text style={[styles.statusText, service.status === 'PAYMENT DUE' ? { color: 'red' } : {}]}>{service.status}</Text>
                                <Text style={styles.cardTitle}>{service.title}</Text>
                                <Text style={styles.subText}>Provider: {service.provider}</Text>

                                {service.status === 'PAYMENT DUE' ? (
                                    <TouchableOpacity
                                        style={[styles.trackButton, { backgroundColor: COLORS.darkBlue }]}
                                        onPress={() => navigation.navigate('Payment', {
                                            id: service.id,
                                            title: service.title,
                                            amount: 2500, // Mock amount
                                            type: 'SERVICE'
                                        })}
                                    >
                                        <Text style={styles.trackButtonText}>Pay Now</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.trackButton}
                                        onPress={() => navigation.navigate('TrackService', {
                                            serviceId: service.id,
                                            providerName: service.provider,
                                            serviceType: service.title
                                        })}
                                    >
                                        <Text style={styles.trackButtonText}>Track</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Image source={{ uri: service.image }} style={styles.cardImage} />
                        </View>
                    </View>
                ))}

                {/* Active Rentals Section */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Active Rentals</Text>
                </View>

                {rentals.map((rental) => (
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
});

export default ActivityScreen;
