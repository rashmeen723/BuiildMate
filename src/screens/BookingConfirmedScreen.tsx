import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';

type BookingConfirmedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingConfirmed'>;
type BookingConfirmedScreenRouteProp = RouteProp<RootStackParamList, 'BookingConfirmed'>;

const { width } = Dimensions.get('window');

const BookingConfirmedScreen = () => {
    const navigation = useNavigation<BookingConfirmedScreenNavigationProp>();
    const route = useRoute<BookingConfirmedScreenRouteProp>();

    const {
        providerName = 'John Perera',
        serviceType = 'Electrician',
        date = 'November 4, 2025',
        time = '1:00 PM - 3:00 PM',
        address = '216 Ananda Road, Moratuwa, Colombo',
        estimatedTotal = 'LKR 3000',
    } = route.params || {};

    // Animation values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const checkmarkRotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Sequence of animations
        Animated.sequence([
            // First: Scale and rotate checkmark
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.spring(checkmarkScale, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(checkmarkRotate, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
            // Then: Fade in content
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const checkmarkRotateInterpolate = checkmarkRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Icon with Animation */}
                <Animated.View
                    style={[
                        styles.successCircle,
                        {
                            transform: [
                                { scale: scaleAnim },
                                { rotate: checkmarkRotateInterpolate },
                            ],
                        },
                    ]}
                >
                    <Animated.View
                        style={{
                            transform: [{ scale: checkmarkScale }],
                        }}
                    >
                        <Ionicons name="checkmark" size={80} color={COLORS.white} />
                    </Animated.View>
                </Animated.View>

                {/* Success Message */}
                <Animated.View
                    style={[
                        styles.messageContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={styles.successTitle}>Booking Confirmed!</Text>
                    <Text style={styles.successSubtitle}>
                        Your service has been successfully booked
                    </Text>
                </Animated.View>

                {/* Booking Details Card */}
                <Animated.View
                    style={[
                        styles.detailsCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={styles.cardTitle}>Booking Details</Text>

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="person-outline" size={20} color={COLORS.darkBlue} />
                        </View>
                        <View style={styles.detailInfo}>
                            <Text style={styles.detailLabel}>Service Provider</Text>
                            <Text style={styles.detailValue}>{providerName}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="construct-outline" size={20} color={COLORS.darkBlue} />
                        </View>
                        <View style={styles.detailInfo}>
                            <Text style={styles.detailLabel}>Service Type</Text>
                            <Text style={styles.detailValue}>{serviceType}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.darkBlue} />
                        </View>
                        <View style={styles.detailInfo}>
                            <Text style={styles.detailLabel}>Date & Time</Text>
                            <Text style={styles.detailValue}>{date}</Text>
                            <Text style={styles.detailValue}>{time}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="location-outline" size={20} color={COLORS.darkBlue} />
                        </View>
                        <View style={styles.detailInfo}>
                            <Text style={styles.detailLabel}>Service Address</Text>
                            <Text style={styles.detailValue}>{address}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Estimated Total</Text>
                        <Text style={styles.totalValue}>{estimatedTotal}</Text>
                    </View>
                </Animated.View>

                {/* Info Message */}
                <Animated.View
                    style={[
                        styles.infoBox,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.darkBlue} />
                    <Text style={styles.infoText}>
                        You will receive a confirmation message shortly
                    </Text>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View
                    style={[
                        styles.buttonContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.primaryButtonText}>Back to Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => {
                            // Navigate to activity/bookings screen
                            navigation.navigate('Home');
                        }}
                    >
                        <Text style={styles.secondaryButtonText}>View My Bookings</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
    },
    successCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    messageContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 22,
    },
    detailsCard: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailInfo: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.black,
        fontWeight: '600',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        width: '100%',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.darkBlue,
        marginLeft: 12,
        lineHeight: 20,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: COLORS.white,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.darkBlue,
    },
    secondaryButtonText: {
        color: COLORS.darkBlue,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BookingConfirmedScreen;
