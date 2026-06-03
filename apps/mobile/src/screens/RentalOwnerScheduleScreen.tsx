import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import { rentalsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

type ScheduleNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalOwnerSchedule'>;

const RentalOwnerScheduleScreen = () => {
    const navigation = useNavigation<ScheduleNavigationProp>();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [rentals, setRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [overdueRentals, setOverdueRentals] = useState<any[]>([]);
    const [showAllCompleted, setShowAllCompleted] = useState(false);

    const generateDates = () => {
        const dates = [];
        const start = new Date();
        start.setDate(start.getDate() - 3);
        for (let i = 0; i < 14; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const weekDates = generateDates();

    const isRentalOverdue = (rental: any) => {
        if (rental.status === 'COMPLETED' || rental.status === 'CANCELLED' || rental.status === 'REJECTED' || rental.status === 'RETURNED') {
            return false;
        }
        const end = new Date(rental.endDate);
        end.setHours(23, 59, 59, 999);
        return end < new Date();
    };

    const fetchSchedule = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await rentalsApi.getOwnerRentals(user.id);
            
            // Find overdue rentals
            const overdue = data.filter(isRentalOverdue);
            setOverdueRentals(overdue);

            // Filter rentals for the selected date
            const filtered = data.filter((rental: any) => {
                const start = new Date(rental.startDate);
                const end = new Date(rental.endDate);
                const current = new Date(selectedDate);
                current.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);

                return current >= start && current <= end;
            });
            setRentals(filtered);
        } catch (error) {
            console.error('Error fetching rental schedule:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSchedule();
        }, [user?.id, selectedDate])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchSchedule();
    };

    const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const getDayNumber = (date: Date) => date.getDate();

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const renderRentalCard = (item: any) => {
        const overdue = isRentalOverdue(item);
        return (
            <View key={item.id} style={styles.rentalCard}>
                <View style={styles.timeLine}>
                    <View style={[styles.timeDot, overdue && { backgroundColor: '#EF4444' }]} />
                    <View style={styles.timeLineBar} />
                </View>
                <TouchableOpacity
                    style={[styles.rentalContent, overdue && styles.overdueCard]}
                    onPress={() => navigation.navigate('RentalRequestDetails', {
                        rentalId: item.id,
                        toolName: item.tool.name,
                        customerName: item.customer.fullName,
                        customerPhone: item.customer.phone || 'N/A',
                        startDate: item.startDate,
                        endDate: item.endDate,
                        totalAmount: item.totalAmount,
                        status: item.status,
                        toolImage: item.tool.images?.[0],
                        customerImage: item.customer.profileImage,
                        pickupLocation: item.pickupLocation,
                        extensionDays: item.extensionDays,
                        extensionStatus: item.extensionStatus,
                        extensionCost: item.extensionCost
                    })}
                >
                    <View style={[styles.statusBadge, {
                        backgroundColor: overdue ? '#FEF2F2' :
                            item.status === 'PENDING' ? '#FEF3C7' :
                            item.status === 'CONFIRMED' ? '#DBEAFE' :
                                item.status === 'IN_PROGRESS' ? '#EDE9FE' :
                                    item.status === 'COMPLETED' ? '#DCFCE7' : '#F1F5F9'
                    }]}>
                        <Text style={[styles.statusBadgeText, {
                            color: overdue ? '#EF4444' :
                                item.status === 'PENDING' ? '#92400E' :
                                item.status === 'CONFIRMED' ? '#1E40AF' :
                                    item.status === 'IN_PROGRESS' ? '#7C3AED' :
                                        item.status === 'COMPLETED' ? '#15803D' : '#64748B'
                        }]}>{overdue ? 'OVERDUE' : item.status}</Text>
                    </View>

                <View style={styles.customerRow}>
                    <Image
                        source={{ uri: item.customer.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.customer.fullName)}&background=random` }}
                        style={styles.customerAvatar}
                    />
                    <View style={styles.toolInfo}>
                        <Text style={styles.toolName}>{item.tool.name}</Text>
                        <Text style={styles.customerName}>Renter: {item.customer.fullName}</Text>
                    </View>
                </View>

                <View style={styles.rentalDetails}>
                    <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                        <Text style={styles.detailText}>
                            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="call-outline" size={14} color="#94A3B8" />
                        <Text style={styles.detailText}>{item.customer.phone || 'No phone'}</Text>
                    </View>
                </View>

                {item.status === 'CONFIRMED' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => navigation.navigate('RentalRequestDetails', {
                                rentalId: item.id,
                                toolName: item.tool.name,
                                customerName: item.customer.fullName,
                                customerPhone: item.customer.phone || 'N/A',
                                startDate: item.startDate,
                                endDate: item.endDate,
                                totalAmount: item.totalAmount,
                                status: item.status,
                                toolImage: item.tool.images?.[0],
                                customerImage: item.customer.profileImage,
                                pickupLocation: item.pickupLocation,
                                extensionDays: item.extensionDays,
                                extensionStatus: item.extensionStatus,
                                extensionCost: item.extensionCost,
                                pickupPhotos: item.pickupPhotos,
                                returnPhotos: item.returnPhotos
                            })}
                        >
                            <Text style={styles.acceptText}>Confirm Pickup</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {item.status === 'IN_PROGRESS' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.acceptButton, { backgroundColor: '#10B981' }]}
                            onPress={() => navigation.navigate('RentalRequestDetails', {
                                rentalId: item.id,
                                toolName: item.tool.name,
                                customerName: item.customer.fullName,
                                customerPhone: item.customer.phone || 'N/A',
                                startDate: item.startDate,
                                endDate: item.endDate,
                                totalAmount: item.totalAmount,
                                status: item.status,
                                toolImage: item.tool.images?.[0],
                                customerImage: item.customer.profileImage,
                                pickupLocation: item.pickupLocation,
                                extensionDays: item.extensionDays,
                                extensionStatus: item.extensionStatus,
                                extensionCost: item.extensionCost,
                                pickupPhotos: item.pickupPhotos,
                                returnPhotos: item.returnPhotos
                            })}
                        >
                            <Text style={styles.acceptText}>Confirm Return</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.reportCustomerButton}
                            onPress={() => navigation.navigate('ReportIssue', {
                                reportType: 'RENTAL',
                                id: item.id.toString(),
                                targetId: item.customerId,
                                title: item.tool.name,
                                subtitle: item.customer.fullName,
                                image: item.tool.images?.[0] || 'https://images.unsplash.com/photo-1540539234-c14a205bf96e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                            })}
                        >
                            <Text style={styles.reportCustomerText}>Report Client</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {item.status === 'COMPLETED' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.reportCustomerButton}
                            onPress={() => navigation.navigate('ReportIssue', {
                                reportType: 'RENTAL',
                                id: item.id.toString(),
                                targetId: item.customerId,
                                title: item.tool.name,
                                subtitle: item.customer.fullName,
                                image: item.tool.images?.[0] || 'https://images.unsplash.com/photo-1540539234-c14a205bf96e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                            })}
                        >
                            <Text style={styles.reportCustomerText}>Report Customer</Text>
                            <Ionicons name="alert-circle-outline" size={14} color="#EF4444" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

    return (
        <SafeAreaView style={styles.container}>
            {/* Header / Week View */}
            <View style={styles.header}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.calendarStrip}
                >
                    {weekDates.map((date, index) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPast = date < today;
                        const hasOverdueOnDate = overdueRentals.some(ob => isSameDay(new Date(ob.endDate), date));

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dateCell,
                                    isSelected && styles.dateCellActive,
                                    isPast && !isSelected && { backgroundColor: '#F1F5F9' }
                                ]}
                                onPress={() => setSelectedDate(date)}
                            >
                                <Text style={[
                                    styles.dayName,
                                    isSelected && styles.dayNameActive,
                                    isPast && !isSelected && { color: '#94A3B8' }
                                ]}>
                                    {getDayName(date)}
                                </Text>
                                <Text style={[
                                    styles.dayNumber,
                                    isSelected && styles.dayNumberActive,
                                    isPast && !isSelected && { color: '#64748B' }
                                ]}>
                                    {getDayNumber(date)}
                                </Text>
                                {hasOverdueOnDate && <View style={styles.overdueDot} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={styles.titleRow}>
                <Text style={styles.screenTitle}>{isSameDay(selectedDate, new Date()) ? "Today's Schedule" : "Rental Schedule"}</Text>
                <View style={styles.summaryBadge}>
                    <Text style={styles.summaryText}>{rentals.length} Bookings</Text>
                </View>
            </View>

            {overdueRentals.length > 0 && (
                <View style={styles.overdueBanner}>
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <Text style={styles.overdueBannerText}>
                        You have {overdueRentals.length} overdue rental{overdueRentals.length > 1 ? 's' : ''} from past days.
                    </Text>
                    <TouchableOpacity 
                        style={styles.viewOverdueBtn}
                        onPress={() => {
                            const firstOverdue = overdueRentals[0];
                            setSelectedDate(new Date(firstOverdue.endDate));
                        }}
                    >
                        <Text style={styles.viewOverdueBtnText}>View</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.darkBlue]} />
                }
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={COLORS.darkBlue} style={{ marginTop: 40 }} />
                ) : rentals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="tools" size={60} color="#CBD5E1" />
                        <Text style={styles.emptyStateText}>No tool pickups or returns scheduled.</Text>
                        <Text style={styles.emptyStateSubtext}>When customers book your tools, they will appear here.</Text>
                    </View>
                ) : (() => {
                    const ongoingRentals = rentals.filter(r => 
                        r.status !== 'COMPLETED' && 
                        r.status !== 'CANCELLED' && 
                        r.status !== 'REJECTED' && 
                        r.status !== 'RETURNED'
                    );
                    const completedRentals = rentals.filter(r => 
                        r.status === 'COMPLETED' || 
                        r.status === 'CANCELLED' || 
                        r.status === 'REJECTED' || 
                        r.status === 'RETURNED'
                    );
                    const displayedCompleted = showAllCompleted ? completedRentals : completedRentals.slice(0, 2);

                    return (
                        <View style={styles.timelineContainer}>
                            {ongoingRentals.length > 0 && (
                                <>
                                    <Text style={styles.sectionHeaderTitle}>Ongoing Pickups & Rentals ({ongoingRentals.length})</Text>
                                    {ongoingRentals.map(renderRentalCard)}
                                </>
                            )}

                            {completedRentals.length > 0 && (
                                <>
                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={styles.sectionHeaderTitle}>Completed Pickups & Rentals ({completedRentals.length})</Text>
                                        {completedRentals.length > 2 && (
                                            <TouchableOpacity onPress={() => setShowAllCompleted(!showAllCompleted)}>
                                                <Text style={styles.toggleBtnText}>{showAllCompleted ? 'Show Less' : 'View All'}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {displayedCompleted.map(renderRentalCard)}
                                </>
                            )}
                        </View>
                    );
                })()}
                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomNavBar />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        backgroundColor: COLORS.white,
        paddingTop: 10,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    calendarStrip: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 5,
    },
    dateCell: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 16,
        width: 55,
        marginRight: 10,
    },
    dateCellActive: {
        backgroundColor: COLORS.darkBlue,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    dayName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94A3B8',
        marginBottom: 4,
    },
    dayNameActive: {
        color: 'rgba(255,255,255,0.8)',
    },
    dayNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#334155',
    },
    dayNumberActive: {
        color: COLORS.white,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    summaryBadge: {
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    summaryText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyStateText: {
        color: '#475569',
        fontSize: 16,
        marginTop: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptyStateSubtext: {
        color: '#94A3B8',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    timelineContainer: {
        marginTop: 10,
    },
    rentalCard: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timeLine: {
        width: 30,
        alignItems: 'center',
    },
    timeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.orange,
        marginTop: 6,
        zIndex: 1,
    },
    timeLineBar: {
        width: 2,
        flex: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: -2,
    },
    rentalContent: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    customerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    toolInfo: {
        flex: 1,
    },
    toolName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    customerName: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    rentalDetails: {
        gap: 8,
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 12,
        color: '#64748B',
        marginLeft: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    declineButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    declineText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptText: {
        fontSize: 12,
        color: COLORS.white,
        fontWeight: '600',
    },
    reportCustomerButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    reportCustomerText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: 'bold',
    },
    overdueCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
        shadowColor: '#EF4444',
        shadowOpacity: 0.08,
    },
    overdueBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    overdueBannerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#991B1B',
        marginLeft: 8,
        flex: 1,
    },
    viewOverdueBtn: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    viewOverdueBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    overdueDot: {
        position: 'absolute',
        bottom: 6,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    sectionHeaderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#475569',
        marginTop: 14,
        marginBottom: 10,
    },
    toggleBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.orange,
    }
});

export default RentalOwnerScheduleScreen;
