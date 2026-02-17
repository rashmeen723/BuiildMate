import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import MapView, { Marker, Polyline } from 'react-native-maps';

type TrackServiceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TrackService'>;
type TrackServiceScreenRouteProp = RouteProp<RootStackParamList, 'TrackService'>;

const { width, height } = Dimensions.get('window');

const TrackServiceScreen = () => {
    const navigation = useNavigation<TrackServiceScreenNavigationProp>();
    const route = useRoute<TrackServiceScreenRouteProp>();
    const { serviceId, providerName, serviceType } = route.params || { serviceId: 1, providerName: 'Alex R.', serviceType: 'Electrical Repair' };

    // Initial region (Mock: somewhere in Colombo)
    const [region] = useState({
        latitude: 6.9271,
        longitude: 79.8612,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    // Mock Route Coordinates
    const routeCoordinates = [
        { latitude: 6.9271, longitude: 79.8612 }, // Start (Provider)
        { latitude: 6.9100, longitude: 79.8550 }, // Waypoint
        { latitude: 6.8900, longitude: 79.8700 }, // End (User)
    ];

    return (
        <View style={styles.container}>
            {/* Map View */}
            <MapView
                style={styles.map}
                initialRegion={region}
                provider={Platform.OS === 'android' ? 'google' : undefined}
            >
                {/* User Marker */}
                <Marker coordinate={routeCoordinates[2]} title="Your Location">
                    <View style={styles.markerContainer}>
                        <View style={styles.userMarkerPin}>
                            <Ionicons name="location" size={20} color={COLORS.white} />
                        </View>
                        <View style={styles.markerArrow} />
                    </View>
                </Marker>

                {/* Provider Marker */}
                <Marker coordinate={routeCoordinates[0]} title={providerName}>
                    <View style={styles.markerContainer}>
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                            style={styles.providerMarkerImage}
                        />
                        <View style={styles.markerArrow} />
                    </View>
                </Marker>

                {/* Route Line */}
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={COLORS.darkBlue}
                    strokeWidth={4}
                />
            </MapView>

            {/* Header Overlay */}
            <SafeAreaView style={styles.headerOverlay} pointerEvents="box-none">
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Track Service</Text>
                <TouchableOpacity style={styles.refreshButton}>
                    <Ionicons name="refresh" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Bottom Card */}
            <View style={styles.bottomSheet}>
                <View style={styles.handleIndicator} />

                {/* Status Time */}
                <View style={styles.statusHeader}>
                    <Text style={styles.arrivingText}>Arriving in 15 mins</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>ON THE WAY</Text>
                    </View>
                </View>

                {/* Timeline Visual (Simplified) */}
                <View style={styles.timelineContainer}>
                    <View style={[styles.timelineDot, styles.dotActive]} />
                    <View style={[styles.timelineLine, styles.lineActive]} />
                    <View style={[styles.timelineDot, styles.dotActive]} />
                    <View style={[styles.timelineLine, styles.lineActive]} />
                    <View style={[styles.timelineDot, styles.dotActive]} />
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineDot} />
                </View>
                <View style={styles.timelineLabels}>
                    <Text style={[styles.timelineLabel, styles.labelActive]}>Confirmed</Text>
                    <Text style={[styles.timelineLabel, styles.labelActive]}>On Route</Text>
                    <Text style={styles.timelineLabel}>Arrived</Text>
                    <Text style={styles.timelineLabel}>Done</Text>
                </View>


                <View style={styles.divider} />

                {/* Provider Info */}
                <View style={styles.providerRow}>
                    <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.providerImage} />
                    <View style={styles.providerInfo}>
                        <Text style={styles.providerName}>{providerName}</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color={COLORS.orange} />
                            <Text style={styles.ratingText}>4.8</Text>
                            <Text style={styles.serviceTypeText}> • {serviceType}</Text>
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
        padding: 24,
        paddingBottom: 40,
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
        marginBottom: 20,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
        alignSelf: 'center',
    },
    cancelButtonText: {
        color: '#EF4444', // Red
        fontSize: 14,
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
});

export default TrackServiceScreen;
