import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { authApi } from '../services/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import BottomNavBar from '../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ServiceProviderDashboard'>;

const ServiceProviderDashboardScreen = () => {
    const { user, logout } = useAuth();
    const navigation = useNavigation<DashboardNavigationProp>();
    const [bookings, setBookings] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [hasUnread, setHasUnread] = React.useState(false);

    const firstName = user?.fullName?.split(' ')[0] || 'Professional';
    const categoryName = user?.serviceProvider?.category || 'Service';
    const isPending = user?.serviceProvider?.status === 'PENDING';

    const fetchBookings = async () => {
        if (!user?.id) return;
        try {
            const data = await authApi.getProviderBookings(user.id);
            setBookings(data);
        } catch (error) {
            console.error('Error fetching provider bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        if (!user?.id) return;
        try {
            const data = await authApi.getNotifications(user.id);
            setHasUnread(data.some((n: any) => !n.isRead));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchBookings();
            fetchNotifications();
        }, [user?.id])
    );

    const handleAccept = async (bookingId: string) => {
        try {
            await authApi.updateBookingStatus(bookingId, 'CONFIRMED');
            await fetchBookings(); // Refresh
        } catch (error) {
            console.error('Error accepting booking:', error);
        }
    };

    const handleDecline = async (bookingId: string) => {
        try {
            await authApi.updateBookingStatus(bookingId, 'REJECTED');
            await fetchBookings(); // Refresh
        } catch (error) {
            console.error('Error declining booking:', error);
        }
    };

    const handleUpdateStatus = async (bookingId: string, status: string) => {
        try {
            await authApi.updateBookingStatus(bookingId, status);
            await fetchBookings(); // Refresh
            if (status === 'ON_THE_WAY') {
                Alert.alert("Journey Started", "You are now on your way to the location!");
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert("Error", "Failed to update job status.");
        }
    };

    const newRequests = bookings.filter(b => b.status === 'PENDING');
    const activeJobs = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'ON_THE_WAY' || b.status === 'ARRIVED');

    const renderJobCard = (job: any) => (
        <TouchableOpacity
            key={job.id}
            style={[styles.jobCard, job.status === 'COMPLETED' && styles.completedCard]}
            onPress={() => {
                if (job.status === 'PENDING') {
                    navigation.navigate('BookingRequest', {
                        bookingId: job.id,
                        customerName: job.customer?.fullName || 'Customer',
                        address: job.address,
                        date: job.bookingDate || 'Today',
                        time: job.startTime || '10:30 AM',
                        description: job.description || job.serviceType,
                        estimatedTotal: job.totalAmount,
                        phone: job.customer?.phone || '+94 77 123 4567',
                        latitude: job.latitude || job.customer?.addresses?.[0]?.latitude,
                        longitude: job.longitude || job.customer?.addresses?.[0]?.longitude,
                        customerImage: job.customer?.profileImage,
                        issueImage: job.issueImage
                    });
                }
            }}
            activeOpacity={0.7}
        >
            <View style={styles.jobTopSection}>
                <View style={[styles.iconContainer, { backgroundColor: job.status === 'PENDING' ? '#FFF7ED' : '#EBF2FF' }]}>
                    <Ionicons
                        name={job.serviceType.toLowerCase().includes('electric') ? 'flash-sharp' : 'construct'}
                        size={24}
                        color={job.status === 'PENDING' ? '#F97316' : '#3B82F6'}
                    />
                </View>
                <View style={styles.jobInfo}>
                    <View style={styles.jobTitleRow}>
                        <Text style={styles.jobTitleText}>{job.customer?.fullName || 'Customer'}</Text>
                        <Text style={styles.jobTimeText}>{job.startTime}</Text>
                    </View>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-sharp" size={14} color="#94A3B8" />
                        <Text style={styles.locationText} numberOfLines={1}>{job.address}</Text>
                    </View>
                </View>
                {job.status === 'PENDING' && (
                    <View style={styles.statusBadgePending}>
                        <Text style={styles.statusBadgeTextPending}>Pending</Text>
                    </View>
                )}
                {job.status === 'CONFIRMED' && (
                    <View style={[styles.statusBadge, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
                        <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>Confirmed</Text>
                    </View>
                )}
                {job.status === 'ON_THE_WAY' && (
                    <View style={[styles.statusBadge, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                        <Text style={[styles.statusBadgeText, { color: '#3B82F6' }]}>On Route</Text>
                    </View>
                )}
                {job.status === 'ARRIVED' && (
                    <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                        <Text style={[styles.statusBadgeText, { color: '#D97706' }]}>Working</Text>
                    </View>
                )}
                {job.status === 'COMPLETED' && (
                    <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}>
                        <Text style={[styles.statusBadgeText, { color: '#6B7280' }]}>Awaiting Pay</Text>
                    </View>
                )}
                {job.status === 'PAID' && (
                    <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }]}>
                        <Text style={[styles.statusBadgeText, { color: '#059669' }]}>Completed</Text>
                    </View>
                )}
            </View>

            <View style={styles.jobActionsRow}>
                {job.status === 'CONFIRMED' && (
                    <TouchableOpacity
                        style={styles.startJourneyBtn}
                        onPress={() => handleUpdateStatus(job.id, 'ON_THE_WAY')}
                    >
                        <Ionicons name="car-outline" size={16} color={COLORS.white} />
                        <Text style={styles.startJourneyBtnText}>Start Journey</Text>
                    </TouchableOpacity>
                )}
                {(job.status === 'CONFIRMED' || job.status === 'ON_THE_WAY' || job.status === 'ARRIVED' || job.status === 'COMPLETED') && (
                    <TouchableOpacity
                        style={styles.onTheWayBtn}
                        onPress={() => navigation.navigate('TrackService', {
                            serviceId: job.id,
                            providerId: job.customerId,
                            providerName: job.customer?.fullName || 'Customer',
                            serviceType: job.serviceType,
                            status: job.status,
                            latitude: job.latitude || job.customer?.addresses?.[0]?.latitude,
                            longitude: job.longitude || job.customer?.addresses?.[0]?.longitude,
                            arrivedAt: job.arrivedAt,
                            serviceImage: job.customer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.customer?.fullName || 'User')}&background=random`
                        } as any)}
                    >
                        <Text style={styles.onTheWayBtnText}>{job.status === 'CONFIRMED' ? 'View Details' : job.status === 'ARRIVED' ? 'Active Work' : job.status === 'COMPLETED' ? 'Review & Close' : 'Track Job'}</Text>
                        {job.status === 'ARRIVED' || job.status === 'COMPLETED' ? (
                            <Ionicons name="time-outline" size={16} color={COLORS.darkBlue} />
                        ) : (
                            <Ionicons name="location-outline" size={16} color={COLORS.darkBlue} />
                        )}
                    </TouchableOpacity>
                )}
                {(job.status === 'COMPLETED' || job.status === 'PAID') && (
                    <TouchableOpacity
                        style={styles.reportCustomerBtn}
                        onPress={() => navigation.navigate('ReportIssue', {
                            reportType: 'SERVICE',
                            id: job.id.toString(),
                            targetId: job.customerId,
                            title: job.serviceType,
                            subtitle: job.customer?.fullName || 'Customer',
                            image: job.customer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.customer?.fullName || 'User')}&background=random`
                        })}
                    >
                        <Text style={styles.reportCustomerBtnText}>Report Client</Text>
                        <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.jobBottomSection}>
                <Text style={styles.estValueLabel}>Est. Value</Text>
                <Text style={styles.estValueAmount}>LKR {job.totalAmount.toLocaleString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        {user?.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
                        ) : (
                            <Image source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=random` }} style={styles.avatar} />
                        )}
                    </TouchableOpacity>
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greetingText}>
                            Good Morning, <Text style={styles.userName}>{firstName}</Text>
                        </Text>
                        <Text style={styles.subGreeting}>{isPending ? 'Almost ready to start working' : "Ready for today's tasks?"}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notification')}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.darkBlue} />
                    {hasUnread && <View style={styles.notificationDot} />}
                </TouchableOpacity>
            </View>

            {/* Verification Pending Banner */}
            {isPending && (
                <View style={styles.pendingBanner}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#854d0e" />
                    <Text style={styles.pendingBannerText}>
                        Account under review. Some features will be limited until verified.
                    </Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Earnings Card */}
                <LinearGradient
                    colors={[COLORS.primary, COLORS.darkBlue, '#1E293B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.earningsCard}
                >
                    <View style={styles.earningsMainRow}>
                        <View>
                            <Text style={[styles.earningsLabel, { color: 'rgba(255,255,255,0.8)' }]}>TODAY'S EARNINGS</Text>
                            <Text style={styles.earningsAmount}>
                                LKR {bookings
                                    .filter(b => (b.status === 'COMPLETED' || b.status === 'PAID') && new Date(b.updatedAt).toDateString() === new Date().toDateString())
                                    .reduce((sum, b) => sum + b.totalAmount, 0)
                                    .toLocaleString()}
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="wallet-outline" size={48} color="rgba(255,255,255,0.2)" />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>NEW REQUESTS</Text>
                            <Text style={styles.statValue}>{newRequests.length}</Text>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>ACTIVE JOBS</Text>
                            <Text style={styles.statValue}>{activeJobs.length}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {isPending && (
                    <View style={styles.verificationProgress}>
                        <Text style={styles.sectionTitle}>Verification Status</Text>
                        <View style={styles.progressItem}>
                            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            <Text style={styles.progressText}>Document Uploaded</Text>
                        </View>
                        <View style={styles.progressItem}>
                            <Ionicons name="time-outline" size={24} color="#F59E0B" />
                            <Text style={styles.progressText}>Admin Review in Progress</Text>
                        </View>
                        <View style={styles.progressItem}>
                            <Ionicons name="ellipse-outline" size={24} color="#CBD5E1" />
                            <Text style={styles.progressText}>Accept Your First Job</Text>
                        </View>
                    </View>
                )}

                {!isPending && (
                    <>
                        <View style={{ paddingTop: 24, paddingBottom: 8 }}>
                            <Text style={styles.sectionTitle}>Upcoming {categoryName} Jobs</Text>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
                        ) : bookings.length > 0 ? (
                            <>
                                {newRequests.length > 0 && (
                                    <View>
                                        <View style={{ paddingBottom: 10 }}>
                                            <Text style={styles.sectionTitle}>New Booking Requests</Text>
                                        </View>
                                        {newRequests.slice(0, 3).map((job) => renderJobCard(job))}
                                        <View style={styles.horizontalDivider} />
                                    </View>
                                )}
                                <View style={{ paddingTop: 12, paddingBottom: 10 }}>
                                    <Text style={styles.sectionTitle}>Confirmed & Active</Text>
                                </View>
                                {bookings.filter(b => b.status !== 'PENDING').slice(0, 3).map((job) => renderJobCard(job))}
                                {bookings.filter(b => b.status !== 'PENDING').length === 0 && (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
                                        <Text style={styles.emptyStateText}>No upcoming jobs scheduled.</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
                                <Text style={styles.emptyStateText}>No upcoming {categoryName.toLowerCase()} jobs yet.</Text>
                            </View>
                        )}
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomNavBar />
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    pendingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#FEF3C7',
    },
    pendingBannerText: {
        fontSize: 13,
        color: '#854d0e',
        fontWeight: '500',
        marginLeft: 8,
        flex: 1,
    },
    verificationProgress: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    progressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    progressText: {
        fontSize: 15,
        color: '#475569',
        marginLeft: 12,
        fontWeight: '500',
    },
    header: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.darkBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    greetingContainer: {
        marginLeft: 16,
    },
    greetingText: {
        fontSize: 18,
        color: '#475569',
    },
    userName: {
        fontWeight: 'bold',
        color: COLORS.black,
    },
    subGreeting: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 2,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    earningsCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    earningsMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    earningsLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1,
    },
    earningsAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    verticalDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
    },
    jobCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
    },
    jobTopSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobInfo: {
        flex: 1,
        marginLeft: 16,
    },
    jobTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    jobTitleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        flex: 1,
        marginRight: 8,
    },
    jobTimeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#94A3B8',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 13,
        color: '#64748B',
        marginLeft: 4,
    },
    jobBottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FCFCFC',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    estValueLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
    },
    estValueAmount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    completedCard: {
        backgroundColor: '#F8FAFC',
        paddingTop: 12,
    },
    completedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: -8,
    },
    completedBadge: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    completedBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748B',
    },
    pendingActions: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptBtn: {
        backgroundColor: '#10B981',
        padding: 8,
        borderRadius: 8,
    },
    declineBtn: {
        backgroundColor: '#EF4444',
        padding: 8,
        borderRadius: 8,
    },
    detailsBtn: {
        padding: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        marginTop: 10,
    },
    emptyStateText: {
        marginTop: 12,
        color: '#94A3B8',
        fontSize: 16,
    },
    confirmedActions: {
        flexDirection: 'row',
    },
    onTheWayBtnText: {
        color: COLORS.darkBlue,
        fontSize: 12,
        fontWeight: 'bold',
    },
    startJourneyBtnText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    statusBadgePending: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    statusBadgeTextPending: {
        fontSize: 10,
        fontWeight: '800',
        color: '#F97316',
        textTransform: 'uppercase',
    },
    jobActionsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    startJourneyBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    onTheWayBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E0E7FF',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    reportCustomerBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FEE2E2',
        gap: 6,
    },
    reportCustomerBtnText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    notificationButton: {
        position: 'relative',
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 10,
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: COLORS.orange,
        borderWidth: 1,
        borderColor: COLORS.white,
    },
    horizontalDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
        marginHorizontal: 20
    }
});

export default ServiceProviderDashboardScreen;
