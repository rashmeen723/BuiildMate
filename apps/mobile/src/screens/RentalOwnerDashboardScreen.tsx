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

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalOwnerDashboard'>;

const RentalOwnerDashboardScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<DashboardNavigationProp>();

    const firstName = user?.fullName?.split(' ')[0] || 'John';
    const storeName = user?.rentalOwner?.businessName || 'My Tool Store';
    const isPending = user?.rentalOwner?.status === 'PENDING';

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
                        <Text style={styles.subGreeting}>{isPending ? 'Almost ready to rent tools' : "Your store is active"}</Text>
                    </View>
                </View>
            </View>

            {/* Verification Pending Banner */}
            {isPending && (
                <View style={styles.pendingBanner}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#854d0e" />
                    <Text style={styles.pendingBannerText}>
                        Store under review. Verification usually takes 24-48 hours.
                    </Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Earnings Card */}
                <View style={styles.earningsCard}>
                    <View style={styles.earningsMainRow}>
                        <View>
                            <Text style={styles.earningsLabel}>TOTAL RENTALS (TODAY)</Text>
                            <Text style={styles.earningsAmount}>{isPending ? 'LKR 0.00' : 'LKR 12400.00'}</Text>
                        </View>
                        <MaterialCommunityIcons name="tools" size={48} color="rgba(255,255,255,0.3)" />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>PENDING PICKUPS</Text>
                            <Text style={styles.statValue}>{isPending ? '0' : '3'}</Text>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>ACTIVE RENTALS</Text>
                            <Text style={styles.statValue}>{isPending ? '0' : '8'}</Text>
                        </View>
                    </View>
                </View>

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
                        <View style={styles.progressItem}>
                            <Ionicons name="ellipse-outline" size={24} color="#CBD5E1" />
                            <Text style={styles.progressText}>List Your First Equipment</Text>
                        </View>
                    </View>
                )}

                {!isPending && (
                    <>
                        <View style={styles.actionRow}>
                            <Text style={styles.sectionTitle}>Manage Inventory</Text>
                            <TouchableOpacity style={styles.addButton}>
                                <Ionicons name="add" size={20} color={COLORS.white} />
                                <Text style={styles.addButtonText}>Add Tool</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Inventory Card 1 */}
                        <TouchableOpacity style={styles.toolCard}>
                            <View style={styles.toolTopSection}>
                                <View style={[styles.iconContainer, { backgroundColor: '#EBF2FF' }]}>
                                    <MaterialCommunityIcons name="toolbox" size={24} color="#3B82F6" />
                                </View>
                                <View style={styles.toolInfo}>
                                    <View style={styles.toolTitleRow}>
                                        <Text style={styles.toolTitleText}>Bosch Hammer Drill</Text>
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusBadgeText}>ACTIVE</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.toolSubText}>Available for rent</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                            </View>
                            <View style={styles.toolBottomSection}>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceLabel}>Daily Rate</Text>
                                    <Text style={styles.priceValue}>LKR 1,200</Text>
                                </View>
                                <View style={styles.statsContainer}>
                                    <Ionicons name="repeat" size={14} color="#94A3B8" />
                                    <Text style={styles.rentalCount}>15 times rented</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Inventory Card 2 */}
                        <TouchableOpacity style={styles.toolCard}>
                            <View style={styles.toolTopSection}>
                                <View style={[styles.iconContainer, { backgroundColor: '#FFF7ED' }]}>
                                    <MaterialCommunityIcons name="hammer" size={24} color="#F97316" />
                                </View>
                                <View style={styles.toolInfo}>
                                    <View style={styles.toolTitleRow}>
                                        <Text style={styles.toolTitleText}>Aluminum Ext. Ladder</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                                            <Text style={[styles.statusBadgeText, { color: '#D97706' }]}>RENTED</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.toolSubText}>Expected back: Tomorrow</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                            </View>
                            <View style={styles.toolBottomSection}>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceLabel}>Daily Rate</Text>
                                    <Text style={styles.priceValue}>LKR 800</Text>
                                </View>
                                <View style={styles.statsContainer}>
                                    <Ionicons name="repeat" size={14} color="#94A3B8" />
                                    <Text style={styles.rentalCount}>28 times rented</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
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
    scrollContent: {
        padding: 24,
    },
    earningsCard: {
        backgroundColor: '#1E293B', // Slightly different dark color
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
    verificationProgress: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
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
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.darkBlue,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    addButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
    },
    toolCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
        overflow: 'hidden',
    },
    toolTopSection: {
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
    toolInfo: {
        flex: 1,
        marginLeft: 16,
    },
    toolTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    toolTitleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    statusBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#166534',
    },
    toolSubText: {
        fontSize: 13,
        color: '#94A3B8',
    },
    toolBottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FCFCFC',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    priceContainer: {
        flexDirection: 'column',
    },
    priceLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rentalCount: {
        fontSize: 12,
        color: '#64748B',
        marginLeft: 4,
    },
});

export default RentalOwnerDashboardScreen;
