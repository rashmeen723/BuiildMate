import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import { rentalsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

type RentalRequestsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalRequests'>;

const RentalRequestsScreen = () => {
    const navigation = useNavigation<RentalRequestsScreenNavigationProp>();
    const { user } = useAuth();
    const [ownerRentals, setOwnerRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('ALL');

    useFocusEffect(
        useCallback(() => {
            const fetchRentals = async () => {
                if (!user) return;
                try {
                    setLoading(true);
                    const data = await rentalsApi.getOwnerRentals(user.id);
                    setOwnerRentals(data);
                } catch (error) {
                    console.error('Error fetching rentals:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchRentals();
        }, [user])
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return COLORS.orange;
            case 'CONFIRMED': return COLORS.darkBlue;
            case 'IN_PROGRESS': return '#8B5CF6';
            case 'COMPLETED': return '#10B981';
            case 'PAID': return '#059669';
            case 'CANCELLED': return '#EF4444';
            case 'REJECTED': return '#EF4444';
            default: return COLORS.gray;
        }
    };

    const filteredRentals = ownerRentals.filter(r => {
        if (selectedTab === 'ALL') return true;
        if (selectedTab === 'PENDING') return r.status === 'PENDING';
        if (selectedTab === 'ACTIVE') return r.status === 'CONFIRMED' || r.status === 'IN_PROGRESS';
        if (selectedTab === 'COMPLETED') return r.status === 'COMPLETED' || r.status === 'PAID';
        return true;
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rentals</Text>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('Notification')}
                >
                    <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Tabs */}
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

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Rental Requests</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{filteredRentals.length} TOTAL</Text>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.orange} style={{ marginVertical: 20 }} />
                ) : filteredRentals.length > 0 ? (
                    filteredRentals.map((rental) => (
                        <TouchableOpacity
                            key={rental.id}
                            style={styles.card}
                            onPress={() => navigation.navigate('RentalRequestDetails', {
                                rentalId: rental.id,
                                toolName: rental.tool.name,
                                customerName: rental.customer.fullName,
                                customerPhone: rental.customer.phone || 'N/A',
                                startDate: rental.startDate,
                                endDate: rental.endDate,
                                totalAmount: rental.totalAmount,
                                status: rental.status,
                                toolImage: rental.tool.images?.[0],
                                customerImage: rental.customer.profileImage,
                                pickupLocation: rental.pickupLocation,
                                paymentMethod: rental.paymentMethod,
                                isPaid: rental.isPaid
                            })}
                        >
                            <View style={styles.cardContent}>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.statusText, { color: getStatusColor(rental.status) }]}>
                                        {rental.status}
                                    </Text>
                                    <Text style={styles.cardTitle}>{rental.tool.name}</Text>
                                    <Text style={styles.subText}>Customer: {rental.customer.fullName}</Text>

                                    <View style={styles.buttonRow}>
                                        {rental.status === 'PENDING' && (
                                            <TouchableOpacity
                                                style={[styles.trackButton, { backgroundColor: COLORS.orange }]}
                                                onPress={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        await rentalsApi.updateRentalStatus(rental.id, 'CONFIRMED');
                                                        const data = await rentalsApi.getOwnerRentals(user!.id);
                                                        setOwnerRentals(data);
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }}
                                            >
                                                <Text style={styles.trackButtonText}>Accept</Text>
                                            </TouchableOpacity>
                                        )}
                                        {rental.status === 'CONFIRMED' && (
                                            <TouchableOpacity
                                                style={[styles.trackButton, { backgroundColor: COLORS.darkBlue }]}
                                                onPress={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        await rentalsApi.updateRentalStatus(rental.id, 'IN_PROGRESS');
                                                        const data = await rentalsApi.getOwnerRentals(user!.id);
                                                        setOwnerRentals(data);
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }}
                                            >
                                                <Text style={styles.trackButtonText}>Picked Up</Text>
                                            </TouchableOpacity>
                                        )}
                                        {rental.status === 'IN_PROGRESS' && (
                                            <TouchableOpacity
                                                style={[styles.trackButton, { backgroundColor: '#10B981' }]}
                                                onPress={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        await rentalsApi.updateRentalStatus(rental.id, 'COMPLETED');
                                                        const data = await rentalsApi.getOwnerRentals(user!.id);
                                                        setOwnerRentals(data);
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }}
                                            >
                                                <Text style={styles.trackButtonText}>Returned</Text>
                                            </TouchableOpacity>
                                        )}
                                        <Text style={styles.dateTimeText}>
                                            {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <Image
                                    source={{ uri: rental.tool.images?.[0] || 'https://via.placeholder.com/150' }}
                                    style={styles.cardImage}
                                />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyCard}>
                        <MaterialCommunityIcons name="tools" size={40} color={COLORS.lightGray} />
                        <Text style={styles.emptyText}>No matching rental requests found</Text>
                    </View>
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
});

export default RentalRequestsScreen;
