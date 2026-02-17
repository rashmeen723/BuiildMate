import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
import CustomMap, { Marker, PROVIDER_GOOGLE } from '../components/CustomMap';

type LocationPickerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LocationPicker'>;
type LocationPickerScreenRouteProp = RouteProp<RootStackParamList, 'LocationPicker'>;

const { width } = Dimensions.get('window');

const LocationPickerScreen = () => {
    const navigation = useNavigation<LocationPickerScreenNavigationProp>();
    const route = useRoute<LocationPickerScreenRouteProp>();

    // State to hold user info if params change
    const [userInfo, setUserInfo] = useState({
        email: route.params?.email,
        fullName: route.params?.fullName,
        phone: route.params?.phone,
        role: route.params?.role
    });

    const [address, setAddress] = useState('');
    const [previewLocation, setPreviewLocation] = useState<{
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null>(null);

    // Update address from map selection
    useEffect(() => {
        if (route.params?.selectedAddress) {
            setAddress(route.params.selectedAddress);
        }
        if (route.params?.selectedLocation) {
            setPreviewLocation(route.params.selectedLocation);
        }

        // If we received user info in this navigation, sync it to our local state
        if (route.params?.email) {
            setUserInfo({
                email: route.params.email,
                fullName: route.params.fullName,
                phone: route.params.phone,
                role: route.params.role
            });
        }
    }, [route.params]);

    const handleNext = () => {
        if (!address) {
            Alert.alert("Location Required", "Please select your home location to continue.");
            return;
        }

        navigation.navigate('CreatePassword', {
            ...userInfo,
            address,
            location: previewLocation
        });
    };

    const openMapSelection = () => {
        navigation.navigate('MapSelection', {
            returnScreen: 'LocationPicker',
            ...userInfo,
            currentAddress: address
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Sign Up</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        <View style={styles.contentContainer}>
                            <Text style={styles.mainTitle}>Where is your home?</Text>
                            <Text style={styles.subtitle}>
                                This helps us find service providers near you.
                            </Text>

                            {/* Address Input */}
                            <View style={styles.inputLabelContainer}>
                                <Text style={styles.label}>Home Address</Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Start typing your address..."
                                    placeholderTextColor={COLORS.gray}
                                    value={address}
                                    onChangeText={setAddress}
                                />
                                <TouchableOpacity onPress={openMapSelection} style={styles.mapIcon}>
                                    <Ionicons name="locate" size={24} color={COLORS.darkBlue} />
                                </TouchableOpacity>
                            </View>

                            {/* Map Preview Area */}
                            <TouchableOpacity onPress={openMapSelection} style={styles.mapPreviewContainer}>
                                {previewLocation ? (
                                    <View style={styles.mapContainer}>
                                        <CustomMap
                                            style={styles.map}
                                            region={previewLocation}
                                            scrollEnabled={false}
                                            zoomEnabled={false}
                                            pitchEnabled={false}
                                            rotateEnabled={false}
                                            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                                        >
                                            <Marker coordinate={previewLocation} />
                                        </CustomMap>
                                    </View>
                                ) : (
                                    <View style={styles.placeholderMap}>
                                        <Ionicons name="map" size={48} color={COLORS.gray} />
                                        <Text style={styles.tapToSelectText}>Tap to select from map</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <Text style={styles.helperText}>Map preview is based on your input</Text>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>

                {/* Bottom Button */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 30,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    contentContainer: {
        flex: 1,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray,
        marginBottom: 30,
        lineHeight: 22,
    },
    inputLabelContainer: {
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        backgroundColor: '#F8FAFC',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
    },
    mapIcon: {
        padding: 5,
    },
    mapPreviewContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        width: '100%',
        height: '100%',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    placeholderMap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tapToSelectText: {
        marginTop: 10,
        color: COLORS.gray,
        fontSize: 14,
    },
    helperText: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 12,
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    },
    nextButton: {
        backgroundColor: COLORS.darkBlue,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    nextButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LocationPickerScreen;
