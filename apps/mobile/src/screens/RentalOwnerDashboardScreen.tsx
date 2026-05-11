import React, { useState, useEffect, useCallback } from 'react';
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
    RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { rentalsApi } from '../services/api';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalOwnerDashboard'>;

const RentalOwnerDashboardScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<DashboardNavigationProp>();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [toolsCount, setToolsCount] = useState(0);
    const [rentals, setRentals] = useState<any[]>([]);
    const [stats, setStats] = useState({
        earnings: 0,
        pendingPickups: 0,
        activeRentals: 0
    });

    const firstName = user?.fullName?.split(' ')[0] || 'Store Owner';
    const isPending = user?.rentalOwner?.status === 'PENDING';

    const fetchData = async () => {
        if (!user?.id) return;
        try {
            const [toolsData, statsData, rentalsData] = await Promise.all([
                rentalsApi.getOwnerTools(user.id),
                rentalsApi.getOwnerStats(user.id),
                rentalsApi.getOwnerRentals(user.id)
            ]);
            setToolsCount(toolsData.length);
            setStats(statsData);
            setRentals(rentalsData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [user?.id])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={COLORS.darkBlue} />
            </View>
        );
    }

    const renderRequestCard = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={styles.requestCard}
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
                paymentMethod: item.paymentMethod,
                isPaid: item.isPaid
            })}
        >
            <View style={styles.requestHeader}>
                <Image
                    source={{ uri: item.customer.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.customer.fullName)}&background=random` }}
                    style={styles.requestAvatar}
                />
                <View style={styles.requestInfo}>
                    <Text style={styles.requestCustomerName}>{item.customer.fullName}</Text>
                    <Text style={styles.requestDate}>
                        {new Date(item.startDate).toLocaleDateString()}
                    </Text>
                </View>
                <View style={[styles.statusBadge, {
                    backgroundColor: item.status === 'PENDING' ? '#FEF3C7' :
                        item.status === 'IN_PROGRESS' ? '#EDE9FE' : '#DCFCE7'
                }]}>
                    <Text style={[styles.statusBadgeText, {
                        color: item.status === 'PENDING' ? '#92400E' :
                            item.status === 'IN_PROGRESS' ? '#7C3AED' : '#15803D'
                    }]}>
                        {item.status}
                    </Text>
                </View>
            </View>
            <View style={styles.requestFooter}>
                <Text style={styles.requestToolName} numberOfLines={1}>{item.tool.name}</Text>
                <Text style={styles.requestAmount}>LKR {item.totalAmount.toLocaleString()}</Text>
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
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitial}>{user?.fullName?.[0] || 'U'}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greetingText}>
                            Good Morning, <Text style={styles.userName}>{firstName}</Text>
                        </Text>
                        <Text style={styles.subGreeting}>{isPending ? 'Almost ready to rent tools' : "Your store is active"}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notification')}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.darkBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.darkBlue]} />
                }
            >
                {/* Earnings Card */}
                <LinearGradient
                    colors={['#1e1b4b', '#312e81', '#1e1b4b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.earningsCard}
                >
                    <View style={styles.earningsMainRow}>
                        <View>
                            <Text style={styles.earningsLabel}>TOTAL EARNINGS</Text>
                            <Text style={styles.earningsAmount}>LKR {stats.earnings.toLocaleString()}</Text>
                        </View>
                        <MaterialCommunityIcons name="currency-usd" size={48} color="rgba(255,255,255,0.2)" />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>PENDING PICKUPS</Text>
                            <Text style={styles.statValue}>{stats.pendingPickups}</Text>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>ACTIVE RENTALS</Text>
                            <Text style={styles.statValue}>{stats.activeRentals}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {!isPending && (
                    <>
                        {/* New Simple Inventory Card */}
                        <TouchableOpacity
                            style={styles.inventoryCard}
                            onPress={() => navigation.navigate('RentalInventory')}
                        >
                            <View style={styles.inventoryCardLeft}>
                                <View style={styles.inventoryIconBg}>
                                    <MaterialCommunityIcons name="toolbox" size={28} color={COLORS.white} />
                                </View>
                                <View style={styles.inventoryInfo}>
                                    <Text style={styles.inventoryTitle}>My Tools</Text>
                                    <Text style={styles.inventorySubtitle} numberOfLines={1}>Manage your equipment catalog</Text>
                                </View>
                            </View>
                            <View style={styles.inventoryCardRight}>
                                <View style={styles.countBadge}>
                                    <Text style={styles.countBadgeText}>{toolsCount}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                            </View>
                        </TouchableOpacity>

                        {/* Rental Overview Card */}
                        <TouchableOpacity
                            style={[styles.inventoryCard, { marginTop: 16 }]}
                            onPress={() => navigation.navigate('RentalOwnerSchedule')}
                        >
                            <View style={styles.inventoryCardLeft}>
                                <View style={[styles.inventoryIconBg, { backgroundColor: COLORS.orange }]}>
                                    <MaterialCommunityIcons name="calendar-clock" size={28} color={COLORS.darkBlue} />
                                </View>
                                <View style={styles.inventoryInfo}>
                                    <Text style={styles.inventoryTitle}>Rental Request</Text>
                                    <Text style={styles.inventorySubtitle} numberOfLines={1}>Check pickups & returns</Text>
                                </View>
                            </View>
                            <View style={styles.inventoryCardRight}>
                                <View style={[styles.countBadge, { backgroundColor: '#FFF7ED' }]}>
                                    <Text style={[styles.countBadgeText, { color: COLORS.orange }]}>{stats.pendingPickups + stats.activeRentals}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                            </View>
                        </TouchableOpacity>


                    </>
                )}

                {isPending && (
                    <View style={styles.verificationProgress}>
                        <Text style={styles.sectionTitle}>Verification Status</Text>
                        <View style={styles.progressItem}>
                            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            <Text style={styles.progressText}>Documents Uploaded</Text>
                        </View>
                        <View style={styles.progressItem}>
                            <Ionicons name="time-outline" size={24} color="#F59E0B" />
                            <Text style={styles.progressText}>Store Profile Review in Progress</Text>
                        </View>
                        <TouchableOpacity style={styles.progressItem} onPress={() => navigation.navigate('RentalInventory')}>
                            <Ionicons name="ellipse-outline" size={24} color="#CBD5E1" />
                            <Text style={styles.progressText}>List Your First Equipment</Text>
                        </TouchableOpacity>
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
        backgroundColor: '#F8FAFC',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
        paddingBottom: 16,
        backgroundColor: COLORS.white,
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
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    scrollContent: {
        padding: 24,
    },
    earningsCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
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
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    verticalDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    inventoryCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inventoryCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    inventoryIconBg: {
        width: 54,
        height: 54,
        borderRadius: 16,
        backgroundColor: COLORS.darkBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inventoryInfo: {
        marginLeft: 16,
        flex: 1,
    },
    inventoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    inventorySubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    inventoryCardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
    },
    countBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 10,
    },
    countBadgeText: {
        color: COLORS.darkBlue,
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.darkBlue,
        fontWeight: '600',
    },
    requestsScroll: {
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    requestCard: {
        width: width * 0.7,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
    },
    requestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    requestAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    requestInfo: {
        flex: 1,
        marginLeft: 12,
    },
    requestCustomerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    requestDate: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    requestFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requestToolName: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
    },
    requestAmount: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    emptyRequests: {
        padding: 30,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
    },
    emptyRequestsText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    verificationProgress: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
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
});

export default RentalOwnerDashboardScreen;
