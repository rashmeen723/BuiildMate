import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

type ScheduleNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProviderSchedule'>;

const ProviderScheduleScreen = () => {
    const navigation = useNavigation<ScheduleNavigationProp>();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // generate a week of dates starting from 3 days ago
    const generateDates = () => {
        const dates = [];
        const start = new Date();
        start.setDate(start.getDate() - 3); // Start 3 days ago
        for (let i = 0; i < 14; i++) { // Show 14 days
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const weekDates = generateDates();

    const fetchSchedule = async (dateObj: Date) => {
        if (!user?.serviceProvider?.id && !user?.id) return;
        setLoading(true);
        try {
            // we have to adjust to UTC format without losing local day string
            const tzoffset = dateObj.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(dateObj.getTime() - tzoffset)).toISOString().slice(0, 10);

            const data = await authApi.getProviderBookings(user.id, localISOTime);
            setBookings(data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSchedule(selectedDate);
        }, [user, selectedDate])
    );

    const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const getDayNumber = (date: Date) => date.getDate();

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const isPast = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < today;
    };

    const estimatedEarnings = bookings
        .filter(b => b.status === 'COMPLETED' || b.status === 'PAID')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

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
                        const dayPast = isPast(date);
                        return (
                            <TouchableOpacity
                                key={index}
                                disabled={dayPast}
                                style={[
                                    styles.dateCell,
                                    isSelected && styles.dateCellActive,
                                    dayPast && { opacity: 0.3 }
                                ]}
                                onPress={() => {
                                    setSelectedDate(date);
                                }}
                            >
                                <Text style={[styles.dayName, isSelected && styles.dayNameActive, dayPast && { color: '#CBD5E1' }]}>{getDayName(date)}</Text>
                                <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive, dayPast && { color: '#CBD5E1' }]}>{getDayNumber(date)}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={styles.titleRow}>
                <Text style={styles.screenTitle}>{isSameDay(selectedDate, new Date()) ? "Today's Tasks" : "Tasks"}</Text>
                <Text style={styles.estEarnings}>Est. Earnings: <Text style={styles.estEarningsAmount}>LKR {estimatedEarnings.toLocaleString()}</Text></Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.orange} style={{ marginTop: 40 }} />
                ) : bookings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-clear-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyStateText}>No tasks scheduled for this day.</Text>
                    </View>
                ) : (
                    <View style={styles.timelineContainer}>
                        {bookings.map((job, index) => {
                            const isFirst = index === 0;
                            const isLast = index === bookings.length - 1;

                            let cardStyle: any = styles.jobCard;
                            let statusBadgeStyle: any = styles.statusBadge;
                            let statusTextStyle: any = styles.statusBadgeText;

                            if (job.status === 'COMPLETED' || job.status === 'PAID') {
                                cardStyle = [styles.jobCard, styles.completedCard];
                                statusBadgeStyle = [styles.statusBadge, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }];
                                statusTextStyle = [styles.statusBadgeText, { color: '#6B7280' }];
                            } else if (job.status === 'ON_THE_WAY' || job.status === 'ARRIVED') {
                                cardStyle = [styles.jobCard, styles.activeCard];
                                statusBadgeStyle = [styles.statusBadge, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }];
                                statusTextStyle = [styles.statusBadgeText, { color: '#3B82F6' }];
                            } else {
                                statusBadgeStyle = [styles.statusBadge, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }];
                                statusTextStyle = [styles.statusBadgeText, { color: '#64748B' }];
                            }

                            return (
                                <View key={job.id} style={styles.timelineRow}>
                                    <View style={styles.timeColumn}>
                                        <Text style={styles.timeText}>{job.startTime}</Text>
                                        <View style={styles.timelineLine}>
                                            <View style={[styles.timelineDot, job.status === 'ON_THE_WAY' || job.status === 'ARRIVED' ? { backgroundColor: COLORS.darkBlue, borderColor: COLORS.darkBlue } : {}]} />
                                            {!isLast && <View style={styles.lineVertical} />}
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={cardStyle}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            if (job.status === 'ON_THE_WAY' || job.status === 'ARRIVED' || job.status === 'COMPLETED') {
                                                navigation.navigate('TrackService', {
                                                    serviceId: job.id,
                                                    providerId: job.customer?.userId,
                                                    providerName: job.customer?.fullName,
                                                    serviceType: job.serviceType,
                                                    status: job.status,
                                                    latitude: job.latitude || job.customer?.addresses?.[0]?.latitude,
                                                    longitude: job.longitude || job.customer?.addresses?.[0]?.longitude,
                                                    arrivedAt: job.arrivedAt,
                                                    serviceImage: job.customer?.profileImage || 'https://via.placeholder.com/150'
                                                } as any);
                                            }
                                        }}
                                    >
                                        <View style={styles.cardHeader}>
                                            <View style={statusBadgeStyle}>
                                                <Text style={statusTextStyle}>
                                                    {job.status === 'ON_THE_WAY' || job.status === 'ARRIVED' ? 'IN PROGRESS' : job.status === 'COMPLETED' || job.status === 'PAID' ? 'COMPLETED' : 'UPCOMING'}
                                                </Text>
                                            </View>
                                            {(job.status === 'ON_THE_WAY' || job.status === 'ARRIVED') && (
                                                <Text style={styles.activeTimeText}>{job.startTime} - Est. 2 Hrs</Text>
                                            )}
                                            {(job.status === 'COMPLETED' || job.status === 'PAID') && (
                                                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                            )}
                                        </View>

                                        <Text style={styles.jobTitle}>{job.serviceType}</Text>

                                        <View style={styles.customerInfo}>
                                            <Text style={styles.customerText}>
                                                {job.customer?.fullName || 'Customer'}
                                            </Text>
                                            <Text style={styles.dotSeparator}>•</Text>
                                            <Text style={styles.addressText} numberOfLines={1}>
                                                {job.address}
                                            </Text>
                                            {(job.status === 'PENDING' || job.status === 'CONFIRMED') && job.issueImage && (
                                                <Image source={{ uri: job.issueImage }} style={styles.issueImage} />
                                            )}
                                        </View>

                                        {(job.status === 'COMPLETED' || job.status === 'PAID') && (
                                            <View style={styles.earnedRow}>
                                                <Ionicons name="cash-outline" size={14} color="#94A3B8" />
                                                <Text style={styles.earnedText}>LKR {job.totalAmount.toLocaleString()} earned</Text>
                                            </View>
                                        )}

                                        {(job.status === 'PENDING' || job.status === 'CONFIRMED') && (
                                            <View style={styles.upcomingFooter}>
                                                <Text style={styles.feeText}>Fee: LKR {job.totalAmount.toLocaleString()}</Text>
                                                <View style={styles.detailsBtn}>
                                                    <Text style={styles.detailsBtnText}>Details</Text>
                                                    <Ionicons name="chevron-forward" size={14} color="#64748B" />
                                                </View>
                                            </View>
                                        )}

                                        {(job.status === 'ON_THE_WAY' || job.status === 'ARRIVED') && (
                                            <View style={styles.activeActions}>
                                                <TouchableOpacity style={styles.updateStatusBtn} onPress={() => {
                                                    // This handles status update (e.g. from start to arrrived, etc)
                                                    // Let's reuse track service for active work
                                                    navigation.navigate('TrackService', {
                                                        serviceId: job.id,
                                                        providerId: job.customer?.userId,
                                                        providerName: job.customer?.fullName,
                                                        serviceType: job.serviceType,
                                                        status: job.status,
                                                        latitude: job.latitude || job.customer?.addresses?.[0]?.latitude,
                                                        longitude: job.longitude || job.customer?.addresses?.[0]?.longitude,
                                                        arrivedAt: job.arrivedAt,
                                                        serviceImage: job.customer?.profileImage || 'https://via.placeholder.com/150'
                                                    } as any);
                                                }}>
                                                    <Text style={styles.updateStatusText}>Update Status</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.navBtn}>
                                                    <Ionicons name="navigate" size={18} color={COLORS.darkBlue} />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
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
        backgroundColor: '#0F172A',
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
    estEarnings: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    estEarningsAmount: {
        color: '#10B981',
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        color: '#94A3B8',
        fontSize: 16,
        marginTop: 12,
        fontWeight: '500',
    },
    timelineContainer: {
        marginTop: 10,
    },
    timelineRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    timeColumn: {
        width: 50,
        alignItems: 'center',
        marginRight: 10,
    },
    timeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94A3B8',
        marginBottom: 8,
    },
    timelineLine: {
        flex: 1,
        alignItems: 'center',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        zIndex: 1,
    },
    lineVertical: {
        position: 'absolute',
        top: 12,
        bottom: -32,
        width: 2,
        backgroundColor: '#E2E8F0',
    },
    jobCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    activeCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#0F172A',
        shadowOpacity: 0.08,
    },
    completedCard: {
        backgroundColor: '#FAFAFA',
        opacity: 0.9,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    activeTimeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    customerText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    dotSeparator: {
        color: '#CBD5E1',
        marginHorizontal: 6,
    },
    addressText: {
        flex: 1,
        fontSize: 13,
        color: '#94A3B8',
    },
    issueImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginLeft: 10,
    },
    earnedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    earnedText: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '500',
    },
    upcomingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    feeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    detailsBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748B',
    },
    activeActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    updateStatusBtn: {
        flex: 1,
        backgroundColor: '#0F172A',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    updateStatusText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    navBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ProviderScheduleScreen;
