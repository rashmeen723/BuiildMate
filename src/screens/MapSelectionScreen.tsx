// Map Selection Screen
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import CustomMap, { Marker, PROVIDER_GOOGLE } from '../components/CustomMap';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';

type MapSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MapSelection'>;

const { width, height } = Dimensions.get('window');

const MapSelectionScreen = () => {
    const navigation = useNavigation<MapSelectionScreenNavigationProp>();

    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null>(null);

    const [address, setAddress] = useState<string>('Searching for address...');
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    const mapRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Permission to access location was denied. You can still select a location manually on the map.',
                    [{ text: 'OK' }]
                );
                const defaultLoc = {
                    latitude: 6.9271,
                    longitude: 79.8612,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                };
                setLocation(defaultLoc);
                reverseGeocode(defaultLoc.latitude, defaultLoc.longitude);
                setLoading(false);
                return;
            }

            try {
                let currentLocation = await Location.getCurrentPositionAsync({});
                const initialRegion = {
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                };
                setLocation(initialRegion);
                reverseGeocode(initialRegion.latitude, initialRegion.longitude);
            } catch (error) {
                console.error("Error getting location:", error);
                const defaultLoc = {
                    latitude: 6.9271,
                    longitude: 79.8612,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                };
                setLocation(defaultLoc);
                reverseGeocode(defaultLoc.latitude, defaultLoc.longitude);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const reverseGeocode = async (latitude: number, longitude: number) => {
        setSearching(true);
        try {
            const result = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (result.length > 0) {
                const item = result[0];
                const addr = `${item.name ? item.name + ', ' : ''}${item.street ? item.street + ', ' : ''}${item.city ? item.city : item.district}`;
                setAddress(addr);
            }
        } catch (error) {
            console.error(error);
            setAddress('Unknown location');
        } finally {
            setSearching(false);
        }
    };

    const handleRegionChangeComplete = (region: any) => {
        setLocation(region);
        reverseGeocode(region.latitude, region.longitude);
    };

    const goToMyLocation = async () => {
        setLoading(true);
        try {
            let currentLocation = await Location.getCurrentPositionAsync({});
            const region = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            };
            mapRef.current?.animateToRegion(region, 1000);
            setLocation(region);
            reverseGeocode(region.latitude, region.longitude);
        } catch (error) {
            Alert.alert('Error', 'Could not get your current location.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        // Navigate back to LocationPicker with result
        navigation.navigate('LocationPicker', {
            selectedLocation: location,
            selectedAddress: address
        });
    };

    if (loading && !location) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.darkBlue} />
                <Text style={styles.loadingText}>Initializing Map...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomMap
                ref={mapRef}
                style={styles.map}
                initialRegion={location || undefined}
                onRegionChangeComplete={handleRegionChangeComplete}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                showsUserLocation={true}
                showsMyLocationButton={false}
            >
            </CustomMap>

            <View style={styles.markerFixed} pointerEvents="none">
                <Ionicons name="location" size={40} color={COLORS.orange} style={{ marginBottom: 40 }} />
            </View>

            <SafeAreaView style={styles.headerOverlay} pointerEvents="box-none">
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color={COLORS.darkBlue} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Select Location</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <View style={styles.bottomCard}>
                <View style={styles.dragHandle} />

                <View style={styles.locationInfo}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="navigate" size={20} color={COLORS.darkBlue} />
                    </View>
                    <View style={styles.addressContainer}>
                        <Text style={styles.locationLabel}>Your Location</Text>
                        <Text style={styles.addressText} numberOfLines={2}>
                            {searching ? 'Updating...' : address}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.myLocationButton}
                    onPress={goToMyLocation}
                >
                    <Ionicons name="locate" size={24} color={COLORS.darkBlue} />
                    <Text style={styles.myLocationText}>Use my current location</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                >
                    <Text style={styles.confirmButtonText}>Confirm Location</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.gray,
        fontSize: 14,
    },
    map: {
        width: width,
        height: height,
    },
    markerFixed: {
        left: '50%',
        marginLeft: -20,
        marginTop: -20,
        position: 'absolute',
        top: '50%',
        zIndex: 2,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        justifyContent: 'space-between',
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
        elevation: 3,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        width: width,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingTop: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 15,
        zIndex: 4,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    addressContainer: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        color: COLORS.gray,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    addressText: {
        fontSize: 16,
        color: COLORS.darkBlue,
        fontWeight: '700',
    },
    myLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        marginBottom: 24,
    },
    myLocationText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkBlue,
    },
    confirmButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    confirmButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default MapSelectionScreen;
