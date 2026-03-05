import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';

type OrderHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderHistory'>;

// Mock Data
const orders = [
    {
        id: 1,
        type: 'SERVICE',
        title: 'Plumbing Service',
        provider: 'Nimal Fernando',
        providerId: 'provider-1',
        amount: 2500,
        date: 'Oct 24, 2024',
        status: 'Completed',
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        id: 2,
        type: 'RENTAL',
        title: 'Bosch Power Drill',
        provider: 'Rental Store',
        providerId: 'provider-2',
        amount: 1500,
        date: 'Oct 15, 2024',
        status: 'Returns',
        image: 'https://images.unsplash.com/photo-1540539234-c14a205bf96e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    },
    {
        id: 3,
        type: 'SERVICE',
        title: 'Home Cleaning',
        provider: 'Sarah Jones',
        providerId: 'provider-3',
        amount: 4000,
        date: 'Sep 28, 2024',
        status: 'Cancelled',
        image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
];

const OrderHistoryScreen = () => {
    const navigation = useNavigation<OrderHistoryScreenNavigationProp>();

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderInfo}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.details}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.provider}>{item.provider}</Text>
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
                {item.status === 'Completed' && (
                    <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => navigation.navigate('WriteReview', {
                            serviceId: item.id.toString(),
                            providerId: item.providerId,
                            serviceName: item.title,
                            providerName: item.provider,
                            serviceImage: item.image,
                        })}
                    >
                        <Text style={styles.reviewButtonText}>Write Review</Text>
                    </TouchableOpacity>
                )}
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
    }
});

export default OrderHistoryScreen;
