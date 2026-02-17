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
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ServiceProviderDashboard'>;

const ServiceProviderDashboardScreen = () => {
    const { user, logout } = useAuth();
    const navigation = useNavigation<DashboardNavigationProp>();

    const firstName = user?.fullName?.split(' ')[0] || 'John';
    const categoryName = user?.serviceProvider?.category || 'Electrical';
    const isPending = user?.serviceProvider?.status === 'PENDING';

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
                                <Text style={styles.avatarInitial}>{user?.fullName?.[0] || 'J'}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greetingText}>
                            Good Morning, <Text style={styles.userName}>{firstName}</Text>
                        </Text>
                        <Text style={styles.subGreeting}>{isPending ? 'Almost ready to start working' : "Ready for today's tasks ?"}</Text>
                    </View>
                </View>
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
                <View style={styles.earningsCard}>
                    <View style={styles.earningsMainRow}>
                        <View>
                            <Text style={styles.earningsLabel}>TODAY'S EARNINGS</Text>
                            <Text style={styles.earningsAmount}>{isPending ? 'LKR 0.00' : 'LKR 8500.00'}</Text>
                        </View>
                        <MaterialCommunityIcons name="wallet-outline" size={48} color="rgba(255,255,255,0.3)" />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>NEW REQUESTS</Text>
                            <Text style={styles.statValue}>{isPending ? '0' : '12'}</Text>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>ACTIVE JOBS</Text>
                            <Text style={styles.statValue}>{isPending ? '0' : '4'}</Text>
                        </View>
                    </View>
                </View>

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
                        {/* Section Title */}
                        <Text style={styles.sectionTitle}>Upcoming {categoryName} Jobs</Text>

                        {/* Job Card 1 */}
                        <TouchableOpacity style={styles.jobCard}>
                            <View style={styles.jobTopSection}>
                                <View style={[styles.iconContainer, { backgroundColor: '#EBF2FF' }]}>
                                    <Ionicons name="flash-sharp" size={24} color="#3B82F6" />
                                </View>
                                <View style={styles.jobInfo}>
                                    <View style={styles.jobTitleRow}>
                                        <Text style={styles.jobTitleText}>Full House Rewiring</Text>
                                        <Text style={styles.jobTimeText}>09:30 AM</Text>
                                    </View>
                                    <View style={styles.locationRow}>
                                        <Ionicons name="location-sharp" size={14} color="#94A3B8" />
                                        <Text style={styles.locationText}>Colombo 07, Cinnamon Gardens</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                            </View>
                            <View style={styles.jobBottomSection}>
                                <Text style={styles.estValueLabel}>Est. Value</Text>
                                <Text style={styles.estValueAmount}>LKR 6000</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Job Card 2 */}
                        <TouchableOpacity style={styles.jobCard}>
                            <View style={styles.jobTopSection}>
                                <View style={[styles.iconContainer, { backgroundColor: '#FFF7ED' }]}>
                                    <MaterialCommunityIcons name="power-plug" size={24} color="#F97316" />
                                </View>
                                <View style={styles.jobInfo}>
                                    <View style={styles.jobTitleRow}>
                                        <Text style={styles.jobTitleText}>Short Circuit Repair</Text>
                                        <Text style={styles.jobTimeText}>02:00 PM</Text>
                                    </View>
                                    <View style={styles.locationRow}>
                                        <Ionicons name="location-sharp" size={14} color="#94A3B8" />
                                        <Text style={styles.locationText}>Dehiwala, Hill Street</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                            </View>
                            <View style={styles.jobBottomSection}>
                                <Text style={styles.estValueLabel}>Est. Value</Text>
                                <Text style={styles.estValueAmount}>LKR 1500</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Completed Job */}
                        <View style={[styles.jobCard, styles.completedCard]}>
                            <View style={styles.completedHeader}>
                                <View style={styles.completedBadge}>
                                    <Text style={styles.completedBadgeText}>COMPLETED</Text>
                                </View>
                                <Text style={styles.jobTimeText}>08:00 AM</Text>
                            </View>
                            <View style={styles.jobTopSection}>
                                <View style={[styles.iconContainer, { backgroundColor: '#F1F5F9' }]}>
                                    <MaterialCommunityIcons name="lightbulb-outline" size={24} color="#94A3B8" />
                                </View>
                                <View style={styles.jobInfo}>
                                    <Text style={[styles.jobTitleText, { color: '#64748B' }]}>Light Fitting Installation</Text>
                                    <Text style={styles.locationText}>Mount Lavinia</Text>
                                </View>
                                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            </View>
                        </View>
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
        backgroundColor: COLORS.white,
    },
    pendingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7ED',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#FFEDD5',
        borderTopWidth: 1,
        borderTopColor: '#FFEDD5',
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
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
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
        padding: 24,
    },
    earningsCard: {
        backgroundColor: '#14213D',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 20,
    },
    jobCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
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
});

export default ServiceProviderDashboardScreen;
