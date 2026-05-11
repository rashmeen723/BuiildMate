import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import { useAuth } from '../context/AuthContext';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        console.log('User logged out successfully:', user?.email);
                        await logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'LoginSignup' }],
                        });
                    }
                }
            ]
        );
    };

    const menuItems = [
        { id: 1, title: 'Personal Information', icon: 'person', route: 'EditProfile' },
        { id: 4, title: 'Order History', icon: 'time', route: 'OrderHistory' },
        { id: 5, title: 'Notification Settings', icon: 'notifications', route: 'NotificationSettings' },
    ];

    const renderMenuItem = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => item.route ? navigation.navigate(item.route as any) : null}
        >
            <View style={styles.menuIconBox}>
                <Ionicons name={item.icon as any} size={22} color={COLORS.black} />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Upper Dark Section */}
            <View style={styles.upperSection}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={styles.notificationButton}
                                onPress={() => navigation.navigate('Notification')}
                            >
                                <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.logoutHeaderButton}
                                onPress={handleLogout}
                            >
                                <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Profile Info */}
                    <View style={styles.profileContainer}>
                        <View style={styles.avatarWrapper}>
                            {user?.profileImage ? (
                                <Image
                                    source={{ uri: user.profileImage }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: COLORS.orange, justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={{ color: COLORS.white, fontSize: 32, fontWeight: 'bold' }}>
                                        {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.editIconBtn}
                                onPress={() => navigation.navigate('EditProfile')}
                            >
                                <Ionicons name="pencil" size={14} color={COLORS.darkBlue} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.userName}>{user?.fullName || 'User Name'}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-sharp" size={14} color="#9CA3AF" />
                            <Text style={styles.userLocation}>
                                {user?.addresses?.[0]?.addressLine1 || 'No address set'}
                            </Text>
                        </View>

                        {/* Badges Section */}
                        {(user?.badges && user.badges.length > 0) && (
                            <View style={styles.badgeRow}>
                                {user.badges.includes('IDENTITY_VERIFIED') && (
                                    <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                                        <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
                                        <Text style={styles.badgeText}>Identity Verified</Text>
                                    </View>
                                )}
                                {user.badges.includes('CERTIFIED_PRO') && (
                                    <View style={[styles.badge, { backgroundColor: COLORS.orange }]}>
                                        <Ionicons name="ribbon" size={12} color={COLORS.white} />
                                        <Text style={styles.badgeText}>Certified Pro</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </View>

            {/* Lower White Section (Curve overlap) */}
            <View style={styles.lowerSection}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.menuContainer}>
                        {menuItems.map(renderMenuItem)}
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color={COLORS.error} style={{ marginRight: 8 }} />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>

            {/* Bottom Navigation */}
            <BottomNavBar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    upperSection: {
        flex: 0.45,
        backgroundColor: '#0F172A', // Deep dark blue
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    notificationButton: {
        padding: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutHeaderButton: {
        padding: 8,
        marginLeft: 4,
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    editIconBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.white,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0F172A',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: COLORS.error,
        marginBottom: 20,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.error,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userLocation: {
        fontSize: 14,
        color: '#9CA3AF', // lighter gray
        marginLeft: 4,
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    lowerSection: {
        flex: 0.55,
        backgroundColor: '#F9FAFB', // Light gray bg for content
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30, // Overlap effect
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    menuContainer: {
        backgroundColor: COLORS.white, // White card for menu
        borderRadius: 16,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6', // Very light divider
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.black,
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
});

export default ProfileScreen;
