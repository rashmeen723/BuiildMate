import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minutes ago";
    return "just now";
};

type NotificationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notification'>;

const NotificationScreen = () => {
    const navigation = useNavigation<NotificationScreenNavigationProp>();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = ['All', 'Bookings', 'Reviews', 'Other'];

    const fetchNotifications = async () => {
        if (!user?.id) return;
        try {
            const data = await authApi.getNotifications(user.id);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [user?.id])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const getIconInfo = (type: string) => {
        switch (type) {
            case 'BOOKING_REQUEST':
            case 'RENTAL_REQUEST':
                return { icon: 'calendar', color: '#F59E0B', bg: '#FFF7ED', category: 'Bookings' };
            case 'STATUS_UPDATE':
            case 'RENTAL_UPDATE':
                return { icon: 'notifications', color: '#3B82F6', bg: '#EFF6FF', category: 'Bookings' };
            case 'REVIEW_RECEIVED':
            case 'REVIEW_REPLY':
                return { icon: 'star', color: '#10B981', bg: '#ECFDF5', category: 'Reviews' };
            default:
                return { icon: 'information-circle', color: '#6B7280', bg: '#F3F4F6', category: 'Other' };
        }
    };

    const handleNotificationPress = async (item: any) => {
        if (!item.isRead) {
            try {
                await authApi.markNotificationAsRead(item.id);
                // Optimistic update
                setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error('Error marking read:', error);
            }
        }

        // Navigation logic based on type
        if (item.type === 'BOOKING_REQUEST' || item.type === 'STATUS_UPDATE') {
            navigation.navigate('Activity'); // Should ideally go to specific booking, but Activity is safe
        } else if (item.type === 'RENTAL_REQUEST') {
            navigation.navigate('RentalRequests');
        } else if (item.type === 'RENTAL_UPDATE') {
            navigation.navigate('Activity');
        } else if (item.type === 'REVIEW_RECEIVED' || item.type === 'REVIEW_REPLY') {
            if (user?.role === 'SERVICE_PROVIDER') {
                navigation.navigate('ProviderRatings');
            } else {
                navigation.navigate('Profile');
            }
        }
    };

    const filteredData = notifications.filter(item => {
        if (selectedFilter === 'All') return true;
        const info = getIconInfo(item.type);
        return info.category === selectedFilter;
    });

    const renderItem = ({ item }: { item: any }) => {
        const info = getIconInfo(item.type);
        const timeAgoStr = formatTimeAgo(new Date(item.createdAt));

        return (
            <TouchableOpacity
                style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={[styles.iconContainer, { backgroundColor: info.bg }]}>
                    <Ionicons name={info.icon as any} size={24} color={info.color} />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.itemHeader}>
                        <Text style={[styles.itemTitle, !item.isRead && { fontWeight: '800' }]}>{item.title}</Text>
                        <Text style={styles.timestamp}>{timeAgoStr}</Text>
                    </View>
                    <Text style={styles.itemDesc}>{item.message}</Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    data={filters}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.filterButton, selectedFilter === item && styles.activeFilterButton]}
                            onPress={() => setSelectedFilter(item)}
                        >
                            <Text style={[styles.filterText, selectedFilter === item && styles.activeFilterText]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                />
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.orange} />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.orange]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={64} color="#CBD5E1" />
                            <Text style={styles.emptyTitle}>No Notifications yet</Text>
                            <Text style={styles.emptySubtitle}>We'll notify you when something important happens.</Text>
                        </View>
                    }
                />
            )}

            <BottomNavBar />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    filterContainer: {
        paddingVertical: 16,
        backgroundColor: COLORS.white,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#F3F4F6',
    },
    activeFilterButton: {
        backgroundColor: COLORS.darkBlue,
    },
    filterText: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '600',
    },
    activeFilterText: {
        color: COLORS.white,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'flex-start',
        borderRadius: 12,
        marginVertical: 4,
    },
    unreadItem: {
        backgroundColor: '#F8FAFC',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        position: 'relative',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.black,
        flex: 1,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 11,
        color: COLORS.gray,
    },
    itemDesc: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    unreadDot: {
        position: 'absolute',
        top: 2,
        right: -8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.orange,
    },
    separator: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
        marginTop: 8,
    },
});

export default NotificationScreen;
