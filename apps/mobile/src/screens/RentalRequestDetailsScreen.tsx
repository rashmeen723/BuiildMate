import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { rentalsApi } from '../services/api';

const { width } = Dimensions.get('window');

type RentalRequestDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalRequestDetails'>;
type RentalRequestDetailsScreenRouteProp = RouteProp<RootStackParamList, 'RentalRequestDetails'>;

const RentalRequestDetailsScreen = () => {
    const navigation = useNavigation<RentalRequestDetailsScreenNavigationProp>();
    const route = useRoute<RentalRequestDetailsScreenRouteProp>();
    const {
        rentalId,
        toolName,
        customerName,
        startDate,
        endDate,
        totalAmount,
        pickupLocation,
        customerPhone,
        customerImage,
        toolImage,
        status,
        paymentMethod,
        isPaid
    } = route.params;

    const [loading, setLoading] = useState(false);

    const platformFee = totalAmount * 0.1;
    const payout = totalAmount - platformFee;

    const handleUpdateStatus = async (newStatus: string, successMsg: string) => {
        setLoading(true);
        try {
            await rentalsApi.updateRentalStatus(rentalId, newStatus);
            Alert.alert("Success", successMsg);
            navigation.navigate('RentalRequests');
        } catch (error) {
            console.error(`Error updating status to ${newStatus}:`, error);
            Alert.alert("Error", `Failed to update status to ${newStatus}.`);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => handleUpdateStatus('CONFIRMED', "Rental request accepted!");
    const handleDecline = () => handleUpdateStatus('REJECTED', "Rental request declined.");
    const handlePickup = () => handleUpdateStatus('IN_PROGRESS', "Tool marked as Picked Up!");
    const handleReturn = () => handleUpdateStatus('COMPLETED', "Tool marked as Returned & Completed!");

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rental Request</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Tool Info */}
                <View style={styles.toolSection}>
                    <Image
                        source={{ uri: toolImage || 'https://via.placeholder.com/150' }}
                        style={styles.toolImageLarge}
                    />
                    <View style={styles.toolOverlay}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{status}</Text>
                        </View>
                    </View>
                    <Text style={styles.toolNameText}>{toolName}</Text>
                    <Text style={styles.rentalIdText}>ID: #{rentalId.slice(0, 8)}</Text>
                </View>

                {/* Customer Section */}
                <View style={styles.customerRow}>
                    <Image
                        source={{ uri: customerImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }}
                        style={styles.customerAvatar}
                    />
                    <View>
                        <Text style={styles.customerName}>{customerName}</Text>
                        <Text style={styles.customerRole}>Household User</Text>
                    </View>
                    <TouchableOpacity style={styles.contactIcon}>
                        <Ionicons name="call" size={20} color={COLORS.darkBlue} />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Rental Details */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailItem}>
                        <View style={styles.iconBox}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.darkBlue} />
                        </View>
                        <View style={styles.detailText}>
                            <Text style={styles.detailLabel}>RENTAL PERIOD</Text>
                            <Text style={styles.detailValue}>
                                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <View style={styles.iconBox}>
                            <Ionicons name="location-outline" size={20} color={COLORS.darkBlue} />
                        </View>
                        <View style={styles.detailText}>
                            <Text style={styles.detailLabel}>PICKUP LOCATION</Text>
                            <Text style={styles.detailValue}>{pickupLocation || "Your Registered Address"}</Text>
                        </View>
                    </View>
                </View>

                {/* Earnings Breakdown */}
                <View style={styles.earningsCard}>
                    <View style={styles.earningsHeaderRow}>
                        <Ionicons name="cash-outline" size={18} color={COLORS.black} />
                        <Text style={styles.earningsTitle}>Estimated Payout</Text>
                    </View>

                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Rental Total</Text>
                        <Text style={styles.breakdownValue}>LKR {totalAmount.toLocaleString()}</Text>
                    </View>

                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabelPlatform}>App Commission (10%)</Text>
                        <Text style={styles.breakdownValuePlatform}>-LKR {platformFee.toLocaleString()}</Text>
                    </View>

                    <View style={styles.breakdownFooter}>
                        <Text style={styles.payoutLabel}>Profit Amount</Text>
                        <Text style={styles.payoutValue}>LKR {payout.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                {status === 'PENDING' && (
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
                                <Text style={styles.acceptButtonText}>Accept Rental</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {status === 'CONFIRMED' && (
                    <TouchableOpacity
                        style={styles.fullWidthButton}
                        onPress={handlePickup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <View style={styles.buttonContent}>
                                <MaterialCommunityIcons name="handshake" size={24} color={COLORS.white} />
                                <Text style={styles.fullWidthButtonText}>Confirm Tool Pickup</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {status === 'IN_PROGRESS' && (
                    <TouchableOpacity
                        style={[styles.fullWidthButton, { backgroundColor: '#10B981' }]}
                        onPress={handleReturn}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <View style={styles.buttonContent}>
                                <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.white} />
                                <Text style={styles.fullWidthButtonText}>Confirm Tool Return</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {paymentMethod === 'CASH' && !isPaid && status !== 'PENDING' && (
                    <TouchableOpacity
                        style={[styles.fullWidthButton, { backgroundColor: COLORS.orange, marginTop: 12 }]}
                        onPress={() => handleUpdateStatus('PAID', 'Payment recorded successfully!')}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <View style={styles.buttonContent}>
                                <Ionicons name="cash-outline" size={24} color={COLORS.white} />
                                <Text style={styles.fullWidthButtonText}>Record Cash Payment</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
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
        paddingVertical: 15,
        backgroundColor: COLORS.white,
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
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    toolSection: {
        marginBottom: 24,
    },
    toolImageLarge: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    toolOverlay: {
        position: 'absolute',
        top: 12,
        left: 12,
    },
    statusBadge: {
        backgroundColor: COLORS.orange,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    toolNameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 16,
    },
    rentalIdText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    customerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    customerRole: {
        fontSize: 12,
        color: '#6B7280',
    },
    contactIcon: {
        marginLeft: 'auto',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 24,
    },
    detailsSection: {
        marginBottom: 24,
        gap: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailText: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9CA3AF',
        letterSpacing: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginTop: 2,
    },
    earningsCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 32,
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
        color: COLORS.black,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    breakdownLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    breakdownValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
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
        borderTopColor: '#E5E7EB',
    },
    payoutLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    payoutValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    declineButton: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    declineButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    acceptButton: {
        flex: 2,
        height: 56,
        borderRadius: 12,
        backgroundColor: COLORS.darkBlue,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    acceptButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    fullWidthButton: {
        height: 60,
        borderRadius: 16,
        backgroundColor: COLORS.darkBlue,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    fullWidthButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
});

export default RentalRequestDetailsScreen;
