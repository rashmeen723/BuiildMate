import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type ToolMapRouteProp = RouteProp<RootStackParamList, 'ToolMap'>;

const ToolMapScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<ToolMapRouteProp>();
    const { tools, initialRegion, userLocation, singleToolMode } = route.params;

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(1));
    };

    let calculatedDistance = 0;
    if (singleToolMode && tools.length > 0 && userLocation) {
        const toolLat = tools[0].owner?.latitude || tools[0].pickupLatitude;
        const toolLng = tools[0].owner?.longitude || tools[0].pickupLongitude;
        if (toolLat && toolLng) {
            calculatedDistance = calculateDistance(userLocation.latitude, userLocation.longitude, toolLat, toolLng);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{singleToolMode ? 'Pickup Location' : 'Nearby Tools'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
            >
                {tools.map((tool) => {
                    const latitude = tool.owner?.latitude || tool.pickupLatitude;
                    const longitude = tool.owner?.longitude || tool.pickupLongitude;

                    if (!latitude || !longitude) return null;

                    return (
                        <Marker
                            key={tool.id}
                            coordinate={{
                                latitude,
                                longitude,
                            }}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.markerCircle}>
                                    <Ionicons name="hammer" size={15} color={COLORS.white} />
                                </View>
                            </View>
                            <Callout tooltip onPress={() => navigation.navigate('ToolDetails', { tool })}>
                                <View style={styles.calloutContainer}>
                                    <View style={styles.calloutInfo}>
                                        <Text style={styles.calloutName}>{tool.name}</Text>
                                        <Text style={styles.calloutRole}>{tool.category}</Text>
                                        <View style={styles.calloutStats}>
                                            <Ionicons name="star" size={12} color={COLORS.orange} />
                                            <Text style={styles.calloutRating}>{tool.rating && tool.rating > 0 ? Number(tool.rating).toFixed(1) : 'New'}</Text>
                                            {tool.distance && <Text style={styles.calloutDistance}> • {tool.distance} km</Text>}
                                            <Text style={styles.calloutDistance}> • LKR {tool.dailyRate}/d</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
                {userLocation && (
                    <Marker
                        coordinate={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                        }}
                    >
                        <View style={styles.markerContainer}>
                            <View style={[styles.markerCircle, { backgroundColor: COLORS.darkBlue }]}>
                                <Ionicons name="home" size={15} color={COLORS.white} />
                            </View>
                        </View>
                        <Callout tooltip>
                            <View style={styles.calloutContainer}>
                                <View style={styles.calloutInfo}>
                                    <Text style={styles.calloutName}>Delivery Address</Text>
                                    <Text style={styles.calloutRole}>{userLocation.address || 'Your saved location'}</Text>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                )}
                {singleToolMode && userLocation && tools.length > 0 && (tools[0].owner?.latitude || tools[0].pickupLatitude) && (
                    <Polyline
                        coordinates={[
                            { latitude: userLocation.latitude, longitude: userLocation.longitude },
                            {
                                latitude: tools[0].owner?.latitude || tools[0].pickupLatitude,
                                longitude: tools[0].owner?.longitude || tools[0].pickupLongitude
                            }
                        ]}
                        strokeColor={COLORS.orange}
                        strokeWidth={3}
                        lineDashPattern={[5, 5]}
                    />
                )}
            </MapView>

            <View style={styles.bottomOverlay}>
                {singleToolMode && calculatedDistance > 0 ? (
                    <Text style={styles.countText}>Distance to pickup: {calculatedDistance} km</Text>
                ) : (
                    <Text style={styles.countText}>{tools.length} available {tools.length === 1 ? 'tool' : 'tools'} found nearby</Text>
                )}
            </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.orange,
        borderWidth: 2,
        borderColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calloutContainer: {
        width: 200,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    calloutInfo: {
        flex: 1,
    },
    calloutName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    calloutRole: {
        fontSize: 12,
        color: COLORS.gray,
        marginVertical: 2,
    },
    calloutStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    calloutRating: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        marginLeft: 4,
    },
    calloutDistance: {
        fontSize: 12,
        color: COLORS.gray,
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: COLORS.white,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    countText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkBlue,
    }
});

export default ToolMapScreen;
