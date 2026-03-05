import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Alert, Linking, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { authApi } from '../services/api';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useAuth } from '../context/AuthContext';

type TrackServiceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TrackService'>;
type TrackServiceScreenRouteProp = RouteProp<RootStackParamList, 'TrackService'>;

const { width, height } = Dimensions.get('window');

const TrackServiceScreen = () => {
    const navigation = useNavigation<TrackServiceScreenNavigationProp>();
    const route = useRoute<TrackServiceScreenRouteProp>();
    const { user } = useAuth();

    const {
        serviceId,
        providerId,
        providerName = 'Professional',
        serviceType = 'Service',
        serviceImage = 'https://via.placeholder.com/150',
        status = 'PENDING',
        latitude,
        longitude,
        arrivedAt
    } = route.params as any || {};

    const [currentStatus, setCurrentStatus] = useState(status);
    const [totalAmount, setTotalAmount] = useState(0);
    const [bookingReviews, setBookingReviews] = useState<any[]>([]);
    const [currentServiceData, setCurrentServiceData] = useState<any>(null);

    const isProvider = user?.role === 'SERVICE_PROVIDER';
    const isTracking = currentStatus === 'ON_THE_WAY' || currentStatus === 'ARRIVED';
    const isPending = currentStatus === 'PENDING';
    const isConfirmed = currentStatus === 'CONFIRMED';

    // Progress steps
    const getStepStatus = (step: string) => {
        if (currentStatus === 'COMPLETED') return true;
        if (step === 'Confirmed' && (isConfirmed || isTracking || currentStatus === 'ARRIVED')) return true;
        if (step === 'On Route' && (isTracking || currentStatus === 'ARRIVED')) return true;
        if (step === 'Arrived' && currentStatus === 'ARRIVED') return true;
        return false;
    };

    const targetLat = latitude || 6.9271;
    const targetLng = longitude || 79.8612;

    const [providerLocation, setProviderLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [mapRegion, setMapRegion] = useState({
        latitude: targetLat,
        longitude: targetLng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    });

    // Timer for active job
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (currentStatus === 'ARRIVED') {
            const startTime = arrivedAt ? new Date(arrivedAt).getTime() : Date.now();
            setElapsedTime(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));

            interval = setInterval(() => {
                setElapsedTime(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [currentStatus, arrivedAt]);

    useEffect(() => {
        // Poll even when PAID to check for reviews
        if (currentStatus !== 'CANCELLED') {
            const pollBooking = async () => {
                if (!user?.id) return;
                try {
                    let bookings = [];
                    if (isProvider) {
                        bookings = await authApi.getProviderBookings(user.id);
                    } else {
                        bookings = await authApi.getUserBookings(user.id);
                    }

                    const currentService = bookings.find((b: any) => b.id === serviceId);
                    if (currentService) {
                        setCurrentServiceData(currentService);
                        if (currentService.status !== currentStatus) {
                            setCurrentStatus(currentService.status);
                        }
                        if (currentService.totalAmount) {
                            setTotalAmount(currentService.totalAmount);
                        }
                        if (currentService.additionalCharges) {
                            setAdditionalChargesAmount(currentService.additionalCharges);
                        }
                        if (currentService.reviews) {
                            setBookingReviews(currentService.reviews);
                        }
                    }
                } catch (e) {
                    console.error('Polling error:', e);
                }
            };
            const intervalId = setInterval(pollBooking, 5000);
            pollBooking();
            return () => clearInterval(intervalId);
        }
    }, [isProvider, currentStatus, user?.id, serviceId]);

    const [additionalChargesAmount, setAdditionalChargesAmount] = useState(0);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            let location = await Location.getCurrentPositionAsync({});
            const pLoc = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };
            setProviderLocation(pLoc);

            const latDelta = Math.max(Math.abs(pLoc.latitude - targetLat) * 2.5, 0.02);
            const lngDelta = Math.max(Math.abs(pLoc.longitude - targetLng) * 2.5, 0.02);

            setMapRegion({
                latitude: (pLoc.latitude + targetLat) / 2,
                longitude: (pLoc.longitude + targetLng) / 2,
                latitudeDelta: latDelta,
                longitudeDelta: lngDelta,
            });
        })();
    }, [targetLat, targetLng]);

    const openDirections = () => {
        const url = Platform.select({
            ios: `maps:0,0?q=${targetLat},${targetLng}`,
            android: `google.navigation:q=${targetLat},${targetLng}`,
            default: `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`
        });

        if (url) {
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`);
                }
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Map View - Only Full Screen if Tracking */}
            <MapView
                style={[styles.map, isTracking ? { height: height } : { height: height * 0.4 }]}
                region={mapRegion}
                provider={Platform.OS === 'android' ? 'google' : undefined}
            >
                {/* Target (Customer) Location */}
                <Marker coordinate={{ latitude: targetLat, longitude: targetLng }}>
                    <View style={styles.markerContainer}>
                        <View style={[styles.userMarkerPin, { backgroundColor: COLORS.orange }]}>
                            <Ionicons name="home" size={20} color={COLORS.white} />
                        </View>
                        <View style={[styles.markerArrow, { borderTopColor: COLORS.orange }]} />
                    </View>
                </Marker>

                {/* Provider Location */}
                {isTracking && providerLocation && (
                    <Marker coordinate={providerLocation}>
                        <View style={styles.markerContainer}>
                            <View style={styles.providerMarkerWrapper}>
                                <Ionicons name="car" size={24} color={COLORS.white} />
                            </View>
                            <View style={styles.markerArrow} />
                        </View>
                    </Marker>
                )}

                {/* Direct Line instead of exact routing path */}
                {isTracking && providerLocation && (
                    <Polyline
                        coordinates={[providerLocation, { latitude: targetLat, longitude: targetLng }]}
                        strokeColor={COLORS.darkBlue}
                        strokeWidth={4}
                        lineDashPattern={[5, 10]}
                    />
                )}
            </MapView>

            {/* Header Overlay */}
            <SafeAreaView style={[styles.headerOverlay, isTracking && { backgroundColor: 'transparent' }]} pointerEvents="box-none">
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isTracking ? 'Provider is Coming' : 'Service Status'}
                </Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <View style={[
                styles.bottomSheet,
                isTracking ? { minHeight: isProvider ? height * 0.48 : height * 0.35, height: 'auto' } : { height: height * 0.75 }
            ]}>
                <View style={styles.handleIndicator} />
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                    <View style={styles.statusHeader}>
                        <Text style={styles.arrivingText}>
                            {currentStatus === 'ARRIVED' ? 'Job In Progress'
                                : currentStatus === 'COMPLETED' ? 'Waiting for Payment'
                                    : currentStatus === 'PAID' ? 'Job Completed'
                                        : isTracking ? 'Arriving in 12 mins'
                                            : isPending ? 'Waiting for confirmation' : 'Job Confirmed'}
                        </Text>
                        <View style={[styles.statusBadge, isPending && { backgroundColor: '#FFF7ED' }]}>
                            <Text style={[styles.statusBadgeText, isPending && { color: COLORS.orange }]}>
                                {currentStatus === 'PAID' ? 'COMPLETED' : currentStatus}
                            </Text>
                        </View>
                    </View>

                    {/* Restored Timeline */}
                    <View style={styles.timelineContainer}>
                        <View style={[styles.timelineDot, getStepStatus('Confirmed') && styles.dotActive]} />
                        <View style={[styles.timelineLine, getStepStatus('On Route') && styles.lineActive]} />
                        <View style={[styles.timelineDot, getStepStatus('On Route') && styles.dotActive]} />
                        <View style={[styles.timelineLine, getStepStatus('Arrived') && styles.lineActive]} />
                        <View style={[styles.timelineDot, getStepStatus('Arrived') && styles.dotActive]} />
                        <View style={[styles.timelineLine, (currentStatus === 'COMPLETED' || currentStatus === 'PAID') && styles.lineActive]} />
                        <View style={[styles.timelineDot, (currentStatus === 'COMPLETED' || currentStatus === 'PAID') && styles.dotActive]} />
                    </View>
                    <View style={styles.timelineLabels}>
                        <Text style={[styles.timelineLabel, getStepStatus('Confirmed') && styles.labelActive]}>Confirmed</Text>
                        <Text style={[styles.timelineLabel, getStepStatus('On Route') && styles.labelActive]}>On Route</Text>
                        <Text style={[styles.timelineLabel, getStepStatus('Arrived') && styles.labelActive]}>Working</Text>
                        <Text style={[styles.timelineLabel, (currentStatus === 'COMPLETED' || currentStatus === 'PAID') && styles.labelActive]}>Done</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Active Job Timer */}
                    {currentStatus === 'ARRIVED' && (
                        <View style={styles.timerContainer}>
                            <Text style={styles.timerLabel}>Time Elapsed</Text>
                            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                            <View style={styles.pulseIndicator} />
                        </View>
                    )}

                    {/* Provider Information */}
                    <View style={styles.providerRow}>
                        <View style={styles.providerSmallCard}>
                            <Ionicons name="person-circle" size={50} color={COLORS.gray} />
                            <View style={styles.providerInfo}>
                                <Text style={styles.providerName}>{providerName}</Text>
                                <Text style={styles.serviceTypeText}>{isProvider ? 'Household User' : serviceType}</Text>
                            </View>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.darkBlue} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.callButton]}>
                                <Ionicons name="call-outline" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isProvider && currentStatus === 'ARRIVED' && (
                        <TouchableOpacity
                            style={styles.arrivedButton}
                            onPress={() => navigation.navigate('FinalizeJob', {
                                serviceId: serviceId,
                                serviceType: serviceType,
                                serviceFee: 0,
                                customerName: providerName,
                                arrivedAt: arrivedAt,
                                hourlyRate: user?.serviceProvider?.hourlyRate || 500
                            })}
                        >
                            <Text style={styles.arrivedButtonText}>Finalize & Complete Job</Text>
                        </TouchableOpacity>
                    )}

                    {isProvider && currentStatus === 'ON_THE_WAY' && (
                        <>
                            <TouchableOpacity
                                style={[styles.arrivedButton, { backgroundColor: '#10B981', marginTop: 15, marginBottom: 0 }]}
                                onPress={openDirections}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <Ionicons name="navigate" size={20} color={COLORS.white} />
                                    <Text style={styles.arrivedButtonText}>Get Directions</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.arrivedButton}
                                onPress={async () => {
                                    try {
                                        await authApi.updateBookingStatus(serviceId.toString(), 'ARRIVED');
                                        Alert.alert("Arrived!", "You have reached the customer's location.");
                                        navigation.goBack();
                                    } catch (error) {
                                        Alert.alert("Error", "Failed to update status.");
                                    }
                                }}
                            >
                                <Text style={styles.arrivedButtonText}>I Have Arrived</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {!isProvider && currentStatus === 'ARRIVED' && (
                        <View style={[styles.infoBox, { backgroundColor: '#D1FAE5', borderColor: '#34D399', borderWidth: 1 }]}>
                            <Ionicons name="checkmark-circle" size={24} color="#059669" />
                            <Text style={[styles.infoText, { color: '#065F46', fontWeight: 'bold', fontSize: 16 }]}>
                                Your provider has arrived!
                            </Text>
                        </View>
                    )}

                    {isProvider && currentStatus === 'COMPLETED' && (
                        <TouchableOpacity
                            style={[styles.arrivedButton, { backgroundColor: COLORS.darkBlue, marginTop: 15 }]}
                            onPress={async () => {
                                try {
                                    await authApi.updateBookingStatus(serviceId.toString(), 'PAID');
                                    Alert.alert("Payment Confirmed", "Job has been fully closed!");
                                    navigation.goBack();
                                } catch (error) {
                                    Alert.alert("Error", "Failed to confirm payment.");
                                }
                            }}
                        >
                            <Text style={styles.arrivedButtonText}>Confirm Payment Received</Text>
                        </TouchableOpacity>
                    )}

                    {currentStatus === 'PAID' && (
                        <>
                            <View style={[styles.infoBox, { backgroundColor: '#D1FAE5', borderColor: '#34D399', borderWidth: 1 }]}>
                                <Ionicons name="checkmark-done-circle" size={24} color="#059669" />
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={[styles.infoText, { color: '#065F46', fontWeight: 'bold', fontSize: 16 }]}>
                                        {isProvider ? 'Payment successfully received! Job Closed.' : 'Invoice paid successfully! Thank you.'}
                                    </Text>
                                    <Text style={[styles.infoText, { color: '#065F46', fontSize: 14, marginTop: 4 }]}>
                                        This job is professionally completed and closed.
                                    </Text>
                                </View>
                            </View>

                            {!isProvider && (
                                bookingReviews.some((r: any) => r.reviewerId === user?.id) ? (
                                    <View style={[styles.infoBox, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB', borderWidth: 1, marginTop: 15 }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="star" size={24} color={COLORS.orange} />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={[styles.infoText, { color: COLORS.black, fontWeight: 'bold' }]}>
                                                    You rated this service provider
                                                </Text>
                                                <Text style={[styles.infoText, { color: COLORS.gray, fontSize: 13 }]}>
                                                    Thank you for your valuable feedback!
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.arrivedButton, { backgroundColor: COLORS.orange, marginTop: 15 }]}
                                        onPress={() => navigation.navigate('WriteReview', {
                                            serviceId: serviceId.toString(),
                                            providerId: providerId || currentServiceData?.providerId || '',
                                            serviceName: serviceType,
                                            providerName: providerName,
                                            serviceImage: serviceImage
                                        })}
                                    >
                                        <Text style={styles.arrivedButtonText}>
                                            Rate & Review Provider
                                        </Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </>
                    )}

                    {!isProvider && currentStatus === 'COMPLETED' && (
                        <View style={styles.invoiceSection}>
                            <Text style={styles.invoiceTitle}>Final Job Invoice</Text>
                            <View style={styles.invoiceCard}>
                                <View style={styles.invoiceRow}>
                                    <Text style={styles.invoiceLabel}>Base Service Rate</Text>
                                    <Text style={styles.invoiceValue}>LKR {(totalAmount - additionalChargesAmount - (totalAmount * 0.05 / 1.05)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                                </View>
                                <View style={styles.invoiceRow}>
                                    <Text style={styles.invoiceLabel}>Additional Materials/Work</Text>
                                    <Text style={styles.invoiceValue}>LKR {additionalChargesAmount.toLocaleString()}</Text>
                                </View>
                                <View style={styles.invoiceRow}>
                                    <Text style={styles.invoiceLabel}>BuildMate Service Fee</Text>
                                    <Text style={styles.invoiceValue}>LKR {(totalAmount - (totalAmount / 1.05)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                                </View>
                                <View style={styles.invoiceDivider} />
                                <View style={styles.invoiceRow}>
                                    <Text style={styles.totalLabel}>Total Payable</Text>
                                    <Text style={styles.totalValue}>LKR {totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.arrivedButton, { backgroundColor: COLORS.darkBlue, marginTop: 20 }]}
                                onPress={() => navigation.navigate('Payment', {
                                    id: serviceId,
                                    title: serviceType,
                                    amount: totalAmount,
                                    type: 'SERVICE',
                                    baseAmount: totalAmount - additionalChargesAmount,
                                    additionalCharges: additionalChargesAmount
                                })}
                            >
                                <Text style={styles.arrivedButtonText}>Secure Payment</Text>
                            </TouchableOpacity>

                            <View style={styles.cashNotice}>
                                <Ionicons name="information-circle-outline" size={16} color={COLORS.gray} />
                                <Text style={styles.cashNoticeText}>Select "Cash Payment" in the next screen if paying the provider directly.</Text>
                            </View>
                        </View>
                    )}

                    {!isTracking && currentStatus !== 'COMPLETED' && (
                        <>
                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle-outline" size={20} color={COLORS.darkBlue} />
                                <Text style={styles.infoText}>
                                    You can track the live location once the provider starts the journey.
                                </Text>
                            </View>

                            {!isProvider && (isPending || isConfirmed) && (
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        Alert.alert(
                                            "Cancel Booking",
                                            "Are you sure you want to cancel this booking? This action cannot be undone.",
                                            [
                                                { text: "No", style: "cancel" },
                                                {
                                                    text: "Yes, Cancel",
                                                    style: "destructive",
                                                    onPress: async () => {
                                                        try {
                                                            await authApi.updateBookingStatus(serviceId.toString(), 'CANCELLED');
                                                            Alert.alert("Success", "Booking cancelled successfully.");
                                                            navigation.goBack();
                                                        } catch (error) {
                                                            Alert.alert("Error", "Failed to cancel booking. Please try again.");
                                                        }
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    map: {
        width: width,
        height: height * 0.65, // Takes up roughly 65% of screen
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10, // Adjust based on status bar
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        overflow: 'hidden',
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        height: height * 0.40, // Overlaps map slightly
    },
    handleIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    arrivingText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    statusBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563EB',
    },
    timelineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 10,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E5E7EB',
    },
    dotActive: {
        backgroundColor: COLORS.darkBlue,
    },
    timelineLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 4,
    },
    lineActive: {
        backgroundColor: COLORS.darkBlue,
    },
    timelineLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    timelineLabel: {
        fontSize: 10,
        color: COLORS.gray,
        width: 60,
        textAlign: 'center',
    },
    labelActive: {
        color: COLORS.darkBlue,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
    },
    providerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    providerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    providerInfo: {
        flex: 1,
    },
    providerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        marginLeft: 4,
    },
    serviceTypeText: {
        fontSize: 12,
        color: COLORS.gray,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    callButton: {
        backgroundColor: COLORS.darkBlue,
    },
    cancelButton: {
        marginTop: 15,
        backgroundColor: '#FEF2F2', // Very light red
        borderWidth: 1,
        borderColor: '#FEE2E2',
        borderRadius: 12,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#EF4444', // Red
        fontSize: 15,
        fontWeight: 'bold',
    },
    arrivedButton: {
        backgroundColor: COLORS.darkBlue,
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrivedButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    markerContainer: {
        alignItems: 'center',
    },
    userMarkerPin: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.darkBlue,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    providerMarkerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    providerMarkerWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.darkBlue,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    providerSmallCard: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: COLORS.darkBlue, // Same as marker color
        marginTop: -2,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
        width: '100%',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.darkBlue,
        marginLeft: 12,
        lineHeight: 20,
    },
    timerContainer: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    timerLabel: {
        fontSize: 14,
        color: '#D97706',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    timerText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.black,
        fontVariant: ['tabular-nums'],
    },
    pulseIndicator: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444',
    },
    invoiceSection: {
        marginTop: 10,
        width: '100%',
    },
    invoiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 12,
    },
    invoiceCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    invoiceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    invoiceLabel: {
        fontSize: 14,
        color: COLORS.gray,
    },
    invoiceValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
    },
    invoiceDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 10,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    cashNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 10,
    },
    cashNoticeText: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 6,
    }
});

export default TrackServiceScreen;
