import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type ServiceProviderMapRouteProp = RouteProp<RootStackParamList, 'ServiceProviderMap'>;

const ServiceProviderMapScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<ServiceProviderMapRouteProp>();
    const { providers, initialRegion } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nearby Professionals</Text>
                <View style={{ width: 40 }} />
            </View>

            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
            >
                {providers.map((provider) => (
                    <Marker
                        key={provider.id}
                        coordinate={{
                            latitude: provider.latitude,
                            longitude: provider.longitude,
                        }}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.markerCircle}>
                                <Ionicons name="person" size={15} color={COLORS.white} />
                            </View>
                        </View>
                        <Callout tooltip onPress={() => navigation.navigate('ProviderProfile', { providerId: provider.id })}>
                            <View style={styles.calloutContainer}>
                                <View style={styles.calloutInfo}>
                                    <Text style={styles.calloutName}>{provider.fullName}</Text>
                                    <Text style={styles.calloutRole}>{provider.category}</Text>
                                    <View style={styles.calloutStats}>
                                        <Ionicons name="star" size={12} color={COLORS.orange} />
                                        <Text style={styles.calloutRating}>{provider.rating}</Text>
                                        <Text style={styles.calloutDistance}> • {provider.distance} km</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.bottomOverlay}>
                <Text style={styles.countText}>{providers.length} verified pros found nearby</Text>
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
        backgroundColor: COLORS.darkBlue,
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

export default ServiceProviderMapScreen;
