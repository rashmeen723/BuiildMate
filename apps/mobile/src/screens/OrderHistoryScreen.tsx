import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import { authApi, rentalsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

type OrderHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderHistory'>;

const OrderHistoryScreen = () => {
    const navigation = useNavigation<OrderHistoryScreenNavigationProp>();
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchOrders = async () => {
                if (!user) return;
                try {
                    setLoading(true);
                    const isProvider = user.role === 'SERVICE_PROVIDER';
                    
                    if (isProvider) {
                        const bookings = await authApi.getProviderBookings(user.id);
                        // Filter past bookings: COMPLETED, PAID, CANCELLED, REJECTED
                        const pastBookings = bookings.filter((b: any) => 
                            b.status === 'COMPLETED' || 
                            b.status === 'PAID' || 
                            b.status === 'CANCELLED' || 
                            b.status === 'REJECTED'
                        );
                        
                        const formatted = pastBookings.map((b: any) => ({
                            id: b.id,
                            type: 'SERVICE',
                            title: b.serviceType,
                            provider: b.customer?.fullName || 'Customer',
                            providerId: b.customerId,
                            amount: b.totalAmount,
                            date: new Date(b.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            rawDate: new Date(b.bookingDate).getTime(),
                            status: b.status === 'COMPLETED' || b.status === 'PAID' ? 'Completed' :
                                    b.status === 'CANCELLED' ? 'Cancelled' : 'Rejected',
                            image: b.customer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.customer?.fullName || 'User')}&background=random`,
                        }));
                        
                        // Sort by date descending
                        formatted.sort((a: any, b: any) => b.rawDate - a.rawDate);
                        setOrders(formatted);
                    } else {
                        // Customer side
                        const bookings = await authApi.getUserBookings(user.id);
                        let rentals: any[] = [];
                        try {
                            rentals = await rentalsApi.getUserRentals(user.id);
                        } catch (err) {
                            console.error('Error fetching rentals:', err);
                        }
                        
                        const pastBookings = bookings.filter((b: any) => 
                            b.status === 'COMPLETED' || 
                            b.status === 'PAID' || 
                            b.status === 'CANCELLED' || 
                            b.status === 'REJECTED'
                        );
                        
                        const pastRentals = rentals.filter((r: any) => 
                            r.status === 'COMPLETED' || 
                            r.status === 'CANCELLED' || 
                            r.status === 'REJECTED' ||
                            r.status === 'RETURNED'
                        );

                        const formattedBookings = pastBookings.map((b: any) => ({
                            id: b.id,
                            type: 'SERVICE',
                            title: b.serviceType,
                            provider: b.provider?.fullName || 'Provider',
                            providerId: b.providerId,
                            amount: b.totalAmount,
                            date: new Date(b.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            rawDate: new Date(b.bookingDate).getTime(),
                            status: b.status === 'COMPLETED' || b.status === 'PAID' ? 'Completed' :
                                    b.status === 'CANCELLED' ? 'Cancelled' : 'Rejected',
                            image: b.provider?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.provider?.fullName || 'User')}&background=random`,
                        }));

                        const formattedRentals = formattedRentalsMap(pastRentals);

                        const combined = [...formattedBookings, ...formattedRentals].sort((a, b) => 
                            b.rawDate - a.rawDate
                        );
                        
                        setOrders(combined);
                    }
                } catch (error) {
                    console.error('Error fetching order history:', error);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchOrders();
        }, [user])
    );

    const formattedRentalsMap = (pastRentals: any[]) => {
        return pastRentals.map((r: any) => ({
            id: r.id,
            type: 'RENTAL',
            title: r.tool?.name || 'Tool Rental',
            provider: r.tool?.owner?.businessName || 'Rental Store',
            providerId: r.tool?.ownerId,
            amount: r.totalAmount,
            date: new Date(r.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            rawDate: new Date(r.endDate).getTime(),
            status: r.status === 'COMPLETED' ? 'Completed' :
                    r.status === 'CANCELLED' ? 'Cancelled' : 'Returned',
            image: r.tool?.images?.[0] || 'https://via.placeholder.com/150',
        }));
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderInfo}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.details}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.provider}>
                        {user?.role === 'SERVICE_PROVIDER' ? 'Client: ' : 'Provider: '}
                        {item.provider}
                    </Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
            </View>
            <View style={styles.statusCol}>
                <Text style={styles.amount}>LKR {item.amount}</Text>
                <View style={[styles.statusBadge,
                item.status === 'Completed' ? styles.statusCompleted :
                    item.status === 'Cancelled' ? styles.statusCancelled : styles.statusReturn
                ]}>
                    <Text style={[styles.statusText,
                    item.status === 'Completed' ? styles.statusTextCompleted :
                        item.status === 'Cancelled' ? styles.statusTextCancelled : styles.statusTextReturn
                    ]}>{item.status}</Text>
                </View>
                {item.status === 'Completed' && user?.role !== 'SERVICE_PROVIDER' && (
                    <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => navigation.navigate('WriteReview', {
                            reviewType: item.type as 'SERVICE' | 'RENTAL',
                            id: item.id.toString(),
                            targetId: item.providerId,
                            title: item.title,
                            subtitle: item.provider,
                            image: item.image,
                        })}
                    >
                        <Text style={styles.reviewButtonText}>Write Review</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.reportButton}
                    onPress={() => navigation.navigate('ReportIssue', {
                        reportType: item.type as 'SERVICE' | 'RENTAL',
                        id: item.id.toString(),
                        targetId: item.providerId,
                        title: item.title,
                        subtitle: item.provider,
                        image: item.image,
                    })}
                >
                    <Text style={styles.reportButtonText}>Report Issue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order History</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.orange} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No past orders found.</Text>
                        </View>
                    }
                />
            )}

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
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    orderCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    orderInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#F3F4F6',
    },
    details: {
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 2,
    },
    provider: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    statusCol: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 6,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusCompleted: {
        backgroundColor: '#ECFDF5',
    },
    statusCancelled: {
        backgroundColor: '#FEF2F2',
    },
    statusReturn: {
        backgroundColor: '#EFF6FF',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusTextCompleted: {
        color: '#10B981',
    },
    statusTextCancelled: {
        color: '#EF4444',
    },
    statusTextReturn: {
        color: COLORS.darkBlue,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: COLORS.gray,
        fontSize: 16,
    },
    reviewButton: {
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: COLORS.orange,
        borderRadius: 8,
        alignItems: 'center',
    },
    reviewButtonText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.orange,
    },
    reportButton: {
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        alignItems: 'center',
    },
    reportButtonText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#EF4444',
    }
});

export default OrderHistoryScreen;
