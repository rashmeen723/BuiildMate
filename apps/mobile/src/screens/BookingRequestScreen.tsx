import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Dimensions,
    Alert,
    ActivityIndicator,
    Platform,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { authApi } from '../services/api';

const { width } = Dimensions.get('window');

type BookingRequestScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingRequest'>;
type BookingRequestScreenRouteProp = RouteProp<RootStackParamList, 'BookingRequest'>;

const BookingRequestScreen = () => {
    const navigation = useNavigation<BookingRequestScreenNavigationProp>();
    const route = useRoute<BookingRequestScreenRouteProp>();
    const {
        bookingId,
        customerName,
        address,
        date,
        time,
        description,
        estimatedTotal,
        phone,
        latitude,
        longitude,
        customerImage,
        issueImage
    } = route.params;

    const [loading, setLoading] = useState(false);
    const [providerLocation, setProviderLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [distance, setDistance] = useState<string>('0.0 km');
    const mapRef = useRef<MapView>(null);

    // Default to Colombo center if no coordinates provided
    const userLat = latitude || 6.9271;
    const userLng = longitude || 79.8612;

    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const pLoc = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };
            setProviderLocation(pLoc);

            // Calculate distance
            const d = calculateDistance(
                pLoc.latitude,
                pLoc.longitude,
                userLat,
                userLng
            );
            setDistance(`${d.toFixed(1)} km`);

            const latDelta = Math.max(Math.abs(pLoc.latitude - userLat) * 2.5, 0.02);
            const lngDelta = Math.max(Math.abs(pLoc.longitude - userLng) * 2.5, 0.02);

            const newRegion = {
                latitude: (pLoc.latitude + userLat) / 2,
                longitude: (pLoc.longitude + userLng) / 2,
                latitudeDelta: latDelta,
                longitudeDelta: lngDelta,
            };

            setMapRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 1000);
        })();
    }, [userLat, userLng]);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const platformFee = estimatedTotal * 0.1;
    const payout = estimatedTotal - platformFee;

    const handleCall = () => {
        if (!phone) {
            Alert.alert("Error", "No phone number available for this customer.");
            return;
        }
        Linking.openURL(`tel:${phone}`).catch((err) => {
            console.error("Failed to open dialer:", err);
            Alert.alert("Error", "Could not open the phone dialer.");
        });
    };

    const handleAccept = async () => {
        setLoading(true);
        try {
            await authApi.updateBookingStatus(bookingId.toString(), 'CONFIRMED');
            Alert.alert("Success", "Booking request accepted!");
            navigation.navigate('ServiceProviderDashboard');
        } catch (error) {
            console.error('Error accepting booking:', error);
            Alert.alert("Error", "Failed to accept booking.");
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        setLoading(true);
        try {
            await authApi.updateBookingStatus(bookingId.toString(), 'REJECTED');
            Alert.alert("Declined", "Booking request declined.");
            navigation.navigate('ServiceProviderDashboard');
        } catch (error) {
            console.error('Error declining booking:', error);
            Alert.alert("Error", "Failed to decline booking.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking Request</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Service Address */}
                <View style={styles.addressSection}>
                    <View style={styles.sectionLabelRow}>
                        <Ionicons name="location" size={18} color="#1E293B" />
                        <Text style={styles.sectionLabelSmall}>SERVICE ADDRESS</Text>
                    </View>
                    <Text style={styles.addressText}>{address}</Text>
                </View>

                {/* Map Preview */}
                <View style={styles.mapCard}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        region={mapRegion}
                        onRegionChangeComplete={(region) => setMapRegion(region)}
                    >
                        {/* Customer Marker */}
                        <Marker coordinate={{ latitude: userLat, longitude: userLng }}>
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerPin, { backgroundColor: COLORS.orange }]}>
                                    <Ionicons name="location" size={18} color={COLORS.white} />
                                </View>
                                <View style={[styles.markerArrow, { borderTopColor: COLORS.orange }]} />
                            </View>
                        </Marker>

                        {/* Provider Marker */}
                        {providerLocation && (
                            <Marker coordinate={providerLocation}>
                                <View style={styles.markerContainer}>
                                    <View style={[styles.markerPin, { backgroundColor: '#1E293B' }]}>
                                        <Ionicons name="car" size={18} color={COLORS.white} />
                                    </View>
                                    <View style={[styles.markerArrow, { borderTopColor: '#1E293B' }]} />
                                </View>
                            </Marker>
                        )}

                        {/* Route Line */}
                        {providerLocation && (
                            <Polyline
                                coordinates={[
                                    providerLocation,
                                    { latitude: userLat, longitude: userLng }
                                ]}
                                strokeColor="#1E293B"
                                strokeWidth={3}
                                lineDashPattern={[5, 10]}
                            />
                        )}
                    </MapView>
                    <View style={styles.mapOverlayTop}>
                        <View style={styles.distanceBadge}>
                            <Ionicons name="navigate-circle" size={16} color="#1E293B" style={{ marginRight: 4 }} />
                            <Text style={styles.distanceText}>{distance} away</Text>
                        </View>
                    </View>
                </View>

                {/* Customer Section */}
                <View style={styles.customerRow}>
                    <Image
                        source={{ uri: customerImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }}
                        style={styles.customerAvatar}
                    />
                    <Text style={styles.customerName}>{customerName}</Text>
                </View>

                {/* Contact Info Card */}
                <TouchableOpacity 
                    style={styles.infoCard} 
                    onPress={handleCall}
                    activeOpacity={0.7}
                >
                    <View style={styles.infoIconBox}>
                        <Ionicons name="call" size={20} color="#1E293B" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>CONTACT INFO</Text>
                        <Text style={styles.infoValue}>{phone}</Text>
                    </View>
                    <View style={styles.callActionButton}>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </View>
                </TouchableOpacity>

                {/* Schedule Row */}
                <View style={styles.scheduleRow}>
                    <View style={styles.scheduleInfoCard}>
                        <View style={styles.scheduleIconBox}>
                            <Ionicons name="calendar" size={20} color="#1E293B" />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>SCHEDULED DATE</Text>
                            <Text style={styles.infoValueSmall}>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                        </View>
                    </View>

                    <View style={styles.verticalDivider} />

                    <View style={styles.scheduleInfoCard}>
                        <View style={styles.scheduleIconBox}>
                            <Ionicons name="time" size={20} color="#1E293B" />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>ARRIVAL TIME</Text>
                            <Text style={styles.infoValueSmall}>{time}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.horizontalDivider} />

                {/* Job Description */}
                <View style={styles.descriptionSection}>
                    <View style={styles.sectionLabelRow}>
                        <Ionicons name="flash" size={18} color="#1E293B" />
                        <Text style={styles.sectionLabel}>Job Description</Text>
                    </View>
                    <Text style={styles.descriptionText}>
                        {description || "Main circuit breaker keeps tripping and two bedroom outlets have a burnt smell. Need a full inspection of the distribution board."}
                    </Text>

                    {/* Job Images */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                        {issueImage ? (
                            <Image
                                source={{ uri: issueImage }}
                                style={styles.jobImage}
                            />
                        ) : (
                            <View style={[styles.jobImage, styles.noImage]}>
                                <Ionicons name="image-outline" size={24} color="#CBD5E1" />
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Earnings Breakdown */}
                <View style={styles.earningsCard}>
                    <View style={styles.earningsHeaderRow}>
                        <Ionicons name="journal" size={18} color="#1E293B" />
                        <Text style={styles.earningsTitle}>Earnings Breakdown</Text>
                    </View>

                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Estimated Job Total</Text>
                        <Text style={styles.breakdownValue}>LKR {estimatedTotal.toLocaleString()}</Text>
                    </View>

                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabelPlatform}>Platform Fee (10%)</Text>
                        <Text style={styles.breakdownValuePlatform}>-LKR {platformFee.toLocaleString()}</Text>
                    </View>

                    <View style={styles.breakdownFooter}>
                        <Text style={styles.payoutLabel}>Your Payout</Text>
                        <Text style={styles.payoutValue}>LKR {payout.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.declineButton}
                        onPress={handleDecline}
                        disabled={loading}
                    >
                        <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={handleAccept}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.acceptButtonText}>Accept Request</Text>
                        )}
                    </TouchableOpacity>
                </View>

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
        paddingTop: Platform.OS === 'android' ? 24 : 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    addressSection: {
        marginBottom: 20,
    },
    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    sectionLabelSmall: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748B',
        letterSpacing: 1,
    },
    addressText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
        lineHeight: 20,
    },
    mapCard: {
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 25,
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    markerPin: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#1E293B',
        marginTop: -1,
    },
    mapOverlayTop: {
        position: 'absolute',
        top: 12,
        left: 0,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    distanceText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    mapOverlayIcon: {
        position: 'absolute',
        top: '40%',
        left: '46%',
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    customerAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#F1F5F9',
    },
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#94A3B8',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginTop: 2,
    },
    scheduleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: 16,
        padding: 18,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    scheduleInfoCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    scheduleIconBox: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoValueSmall: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 1,
    },
    verticalDivider: {
        width: 1,
        height: '80%',
        backgroundColor: '#F1F5F9',
        marginHorizontal: 15,
    },
    horizontalDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 25,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    descriptionSection: {
        marginBottom: 25,
    },
    descriptionText: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
        marginTop: 8,
        marginBottom: 15,
    },
    imageScroll: {
        flexDirection: 'row',
    },
    jobImage: {
        width: 120,
        height: 100,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: '#F1F5F9',
    },
    noImage: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    earningsCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 30,
    },
    earningsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    earningsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    breakdownLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    breakdownValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    breakdownLabelPlatform: {
        fontSize: 12,
        color: '#EF4444',
    },
    breakdownValuePlatform: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    breakdownFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    payoutLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    payoutValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 10,
    },
    declineButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
    },
    declineButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    acceptButton: {
        flex: 2,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    acceptButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    callActionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default BookingRequestScreen;
