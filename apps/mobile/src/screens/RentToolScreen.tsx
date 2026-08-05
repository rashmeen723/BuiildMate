import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { rentalsApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

type RentToolScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentTool'>;
type RentToolScreenRouteProp = RouteProp<RootStackParamList, 'RentTool'>;

const { width } = Dimensions.get('window');

const RentToolScreen = () => {
    const navigation = useNavigation<RentToolScreenNavigationProp>();
    const route = useRoute<RentToolScreenRouteProp>();
    const { user } = useAuth();
    const { tool, startDate, endDate, totalDays, totalPrice } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

    // Get price and other details correctly from passed tool
    const price = tool?.dailyRate || tool?.price || 0;
    const rating = tool?.rating && tool.rating > 0 ? Number(tool.rating).toFixed(1) : 'New';
    const reviewsCount = tool?.reviewCount || tool?.reviews || 0;
    const ownerName = tool?.owner?.user?.fullName || tool?.owner?.businessName || tool?.ownerName || 'Tool Owner';
    const ownerShop = tool?.owner?.businessName || tool?.ownerShop || `${ownerName}'s Location`;
    const ownerAddress = tool?.owner?.formattedAddress || tool?.ownerAddress || 'Location pending';
    const ownerPhone = tool?.owner?.user?.phone || tool?.ownerPhone || 'N/A';

    const displayTotal = totalPrice || (Number(price) * (totalDays || 3));

    const handleConfirmRent = async () => {
        if (!user?.id) {
            Alert.alert('Error', 'Please login to rent tools');
            return;
        }

        setLoading(true);
        try {
            await rentalsApi.createRental({
                toolId: tool.id,
                customerId: user.id,
                startDate: startDate || new Date().toISOString(),
                endDate: endDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                totalAmount: displayTotal,
                pickupLocation: ownerAddress,
                paymentMethod: paymentMethod.toUpperCase(),
                isPaid: false
            });

            navigation.navigate('BookingConfirmed', {
                providerName: ownerName,
                serviceType: `Rent: ${tool?.name}`,
                date: startDate && endDate ? `${startDate} - ${endDate}` : 'Nov 21 - Nov 23, 2025',
                time: 'Pickup: 10:00 AM',
                address: ownerAddress,
                estimatedTotal: `LKR ${displayTotal.toLocaleString()}`
            });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to process rental request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rent Tool</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Tool Summary */}
                <View style={styles.toolSummary}>
                    {tool?.images && tool.images.length > 0 ? (
                        <Image source={{ uri: tool.images[0] }} style={styles.toolImage} />
                    ) : (
                        <Image source={{ uri: tool?.image }} style={styles.toolImage} />
                    )}
                    <View style={styles.toolInfo}>
                        <Text style={styles.toolName}>{tool?.name}</Text>
                        <View style={styles.ratingRow}>
                            <Text style={styles.ratingText}>{rating}</Text>
                            <View style={{ flexDirection: 'row', marginHorizontal: 4 }}>
                                {[1, 2, 3, 4, 5].map(i => <Ionicons key={i} name="star" size={12} color={COLORS.orange} />)}
                            </View>
                            <Text style={styles.reviewCount}>({reviewsCount} reviews)</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <View style={styles.priceTag}>
                                <Text style={styles.priceText}>LKR {Number(price).toLocaleString()}</Text>
                            </View>
                            <Text style={styles.perDayText}>/per day</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Rental Period */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>RENTAL PERIOD</Text>
                    <TouchableOpacity><Text style={styles.editText}>Edit</Text></TouchableOpacity>
                </View>
                <View style={styles.rentalPeriodCard}>
                    <Ionicons name="calendar-outline" size={24} color={COLORS.orange} style={{ marginRight: 16 }} />
                    <View>
                        <Text style={styles.periodDates}>{startDate && endDate ? `${startDate} - ${endDate}` : 'Nov 21 - Nov 23 , 2025'}</Text>
                        <Text style={styles.periodDuration}>{totalDays ? `${totalDays} Days total duration` : '3 Days total duration'}</Text>
                    </View>
                </View>

                {/* Pickup Location */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>PICKUP LOCATION</Text>
                    <TouchableOpacity onPress={() => {
                        const toolLat = tool?.owner?.latitude || tool?.pickupLatitude;
                        const toolLng = tool?.owner?.longitude || tool?.pickupLongitude;
                        if (!toolLat || !toolLng) {
                            Alert.alert('Location not available', 'The pickup location coordinates are not available for this tool.');
                            return;
                        }
                        const defaultAddr = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0];

                        navigation.navigate('ToolMap', {
                            tools: [tool],
                            singleToolMode: true,
                            userLocation: defaultAddr ? {
                                latitude: defaultAddr.latitude,
                                longitude: defaultAddr.longitude,
                                address: defaultAddr.addressLine1
                            } : undefined,
                            initialRegion: {
                                latitude: toolLat,
                                longitude: toolLng,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }
                        });
                    }}><Text style={styles.mapText}>Map</Text></TouchableOpacity>
                </View>
                <View style={styles.locationCard}>
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name="location-outline" size={24} color={COLORS.orange} />
                    </View>
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationName}>{ownerShop}</Text>
                        <Text style={styles.locationAddress}>{ownerAddress}</Text>
                        <Text style={styles.locationPhone}>Contact: {ownerPhone}</Text>
                    </View>
                </View>

                {/* Price Estimate */}
                <Text style={styles.sectionTitleMargin}>PRICE ESTIMATE</Text>
                <View style={styles.priceEstimateCard}>
                    <View style={styles.estimateRow}>
                        <Text style={styles.estimateLabel}>Daily Rate</Text>
                        <Text style={styles.estimateValue}>LKR {Number(price).toLocaleString()}</Text>
                    </View>
                    <View style={styles.estimateRow}>
                        <Text style={styles.estimateLabel}>Estimated Time</Text>
                        <Text style={styles.estimateValue}>{totalDays || 3} days</Text>
                    </View>
                    <View style={styles.dashedDivider} />
                    <View style={styles.estimateRow}>
                        <Text style={styles.totalLabel}>Estimated Total</Text>
                        <Text style={styles.totalValue}>LKR {displayTotal.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Payment Method */}
                <Text style={styles.sectionTitleMargin}>PAYMENT METHOD</Text>
                <View style={styles.paymentMethods}>
                    <TouchableOpacity
                        style={styles.paymentOption}
                        onPress={() => setPaymentMethod('cash')}
                    >
                        <View style={[styles.radioOuter, paymentMethod === 'cash' && styles.radioActive]}>
                            {paymentMethod === 'cash' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.paymentText}>Pay on Cash</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.paymentOption}
                        onPress={() => setPaymentMethod('card')}
                    >
                        <View style={[styles.radioOuter, paymentMethod === 'card' && styles.radioActive]}>
                            {paymentMethod === 'card' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.paymentText}>Card payment</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.confirmButton, loading && { opacity: 0.7 }]}
                    onPress={handleConfirmRent}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.confirmButtonText}>Confirm Rent</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
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
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.black,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    notificationButton: {
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    toolSummary: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    toolImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#F3F4F6',
        resizeMode: 'contain'
    },
    toolInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    toolName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    reviewCount: {
        fontSize: 12,
        color: COLORS.gray,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceTag: {
        backgroundColor: COLORS.orange,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    priceText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    perDayText: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
        letterSpacing: 1,
    },
    sectionTitleMargin: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
        letterSpacing: 1,
        marginBottom: 12,
        marginTop: 20,
    },
    editText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    mapText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    rentalPeriodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    periodDates: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    periodDuration: {
        fontSize: 12,
        color: COLORS.gray,
    },
    locationCard: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    mapPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    locationAddress: {
        fontSize: 12,
        color: COLORS.gray,
        marginVertical: 4,
    },
    locationPhone: {
        fontSize: 12,
        color: COLORS.black,
    },
    priceEstimateCard: {
        backgroundColor: COLORS.darkBlue,
        borderRadius: 12,
        padding: 20,
    },
    estimateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    estimateLabel: {
        fontSize: 14,
        color: '#E5E7EB',
    },
    estimateValue: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    dashedDivider: {
        height: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        marginVertical: 12,
        opacity: 0.3,
    },
    totalLabel: {
        fontSize: 16,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 16,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    paymentMethods: {
        marginBottom: 30,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.gray,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: {
        borderColor: COLORS.black,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.black,
    },
    paymentText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    confirmButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RentToolScreen;
