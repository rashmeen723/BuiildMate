import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';

type NotificationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notification'>;

const notificationsData = [
    {
        id: 1,
        title: 'Electrician arriving soon',
        category: 'Services',
        timestamp: '2min ago',
        description: 'John is 5 min away from your location',
        action: 'Track',
        icon: 'flash',
        iconColor: '#F59E0B',
        iconBg: '#FFF7ED',
        type: 'SERVICE',
        serviceId: 1,
        providerName: 'John',
        serviceType: 'Electrician'
    },
    {
        id: 2,
        title: 'Rental Reminder',
        category: 'Tools',
        timestamp: '1h ago',
        description: 'Return the DeWalt Drill by 5 PM today to avoid late fees',
        action: 'Extend',
        icon: 'hammer',
        iconColor: '#3B82F6',
        iconBg: '#EFF6FF',
        type: 'RENTAL',
        rentalId: 1,
        toolName: 'DeWalt Drill',
        dueDate: 'today',
    },
    {
        id: 3,
        title: 'Weekend Special: 20% off',
        category: 'Promotions',
        timestamp: '5h ago',
        description: 'Get 20% off all Plumbing services booked this weekend. Limited slots!',
        action: null,
        icon: 'pricetag',
        iconColor: '#10B981',
        iconBg: '#ECFDF5',
        type: 'PROMOTION',
    }
];

const NotificationScreen = () => {
    const navigation = useNavigation<NotificationScreenNavigationProp>();
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = ['All', 'Services', 'Tools', 'Promotions'];

    const filteredData = selectedFilter === 'All'
        ? notificationsData
        : notificationsData.filter(item => item.category === selectedFilter);

    const handleAction = (item: any) => {
        if (item.action && item.action.includes('Track')) {
            navigation.navigate('TrackService', {
                serviceId: item.serviceId,
                providerName: item.providerName,
                serviceType: item.serviceType
            });
        } else if (item.action && item.action.includes('Extend')) {
            navigation.navigate('RentalStatus', {
                rentalId: item.rentalId,
                toolName: item.toolName,
                dueDate: item.dueDate,
                image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            });
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.notificationItem} onPress={() => handleAction(item)}>
            <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
                <Text style={styles.itemDesc}>{item.description}</Text>

                {item.action && (
                    <Text style={[styles.actionLink, { color: item.iconColor }]}>{item.action} Now →</Text>
                )}
            </View>
            {/* Optional dot for unread state (mock) */}
            {item.id === 1 && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Filters */}
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

            {/* Notifications List */}
            <FlatList
                data={filteredData}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* Bottom Navigation */}
            <BottomNavBar />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Clean white background
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
        padding: 8,
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
        alignItems: 'flex-start',
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
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        flex: 1,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 12,
        color: COLORS.gray,
    },
    itemDesc: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 8,
        lineHeight: 20,
    },
    actionLink: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444', // Red dot
        marginTop: 6,
        marginLeft: 8,
    },
    separator: {
        height: 1,
        backgroundColor: '#F3F4F6',
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

export default NotificationScreen;
