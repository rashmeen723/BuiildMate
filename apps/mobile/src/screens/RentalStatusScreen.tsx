import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';

type RentalStatusScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalStatus'>;
type RentalStatusScreenRouteProp = RouteProp<RootStackParamList, 'RentalStatus'>;

const { width } = Dimensions.get('window');

const RentalStatusScreen = () => {
    const navigation = useNavigation<RentalStatusScreenNavigationProp>();
    const route = useRoute<RentalStatusScreenRouteProp>();
    const {
        rentalId,
        toolName,
        dueDate,
        startDate,
        image,
        status = 'PENDING',
        ownerName,
        ownerId,
        ownerAddress,
        paymentMethod,
        isPaid,
        totalAmount,
        reviews = []
    } = route.params;
    const { user } = useAuth();

    const [extendDays, setExtendDays] = useState(0);
    const [extraCost, setExtraCost] = useState(0);
    const pricePerDay = 800; // Mock price

    const handleExtend = (days: number) => {
        setExtendDays(days);
        setExtraCost(days * pricePerDay);
    };

    const confirmExtension = () => {
        alert(`Extension request sent! The owner will verify your request for ${extendDays} additional days.`);
        navigation.navigate('Activity', { updatedRentalId: Number(rentalId), newStatus: 'EXTENSION PENDING' });
    };

    // Timeline mapping
    const isStepActive = (stepStatus: string) => {
        const statusOrder = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
        const currentIdx = statusOrder.indexOf(status);
        const stepIdx = statusOrder.indexOf(stepStatus);
        return currentIdx >= stepIdx;
    };

    const getStatusHeader = () => {
        switch (status) {
            case 'PENDING': return 'WAITING FOR OWNER';
            case 'CONFIRMED': return 'READY FOR PICKUP';
            case 'IN_PROGRESS': return 'GENUINELY ACTIVE';
            case 'COMPLETED': return 'RENTAL COMPLETED';
            default: return status;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rental Status</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="alert-circle-outline" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Tool Card */}
                <View style={styles.toolCard}>
                    <Image source={{ uri: image || 'https://via.placeholder.com/150' }} style={styles.toolImage} />
                    <View style={styles.toolInfo}>
                        <Text style={styles.toolName}>{toolName}</Text>
                        <Text style={styles.rentalId}>Rental ID: #{rentalId.slice(0, 8)}</Text>
                        <View style={[styles.statusBadge, isStepActive('COMPLETED') ? { backgroundColor: '#ECFDF5' } : { backgroundColor: '#FFFBEB' }]}>
                            <View style={[styles.statusDot, isStepActive('COMPLETED') ? { backgroundColor: '#10B981' } : { backgroundColor: COLORS.orange }]} />
                            <Text style={[styles.statusText, isStepActive('COMPLETED') ? { color: '#10B981' } : { color: COLORS.orange }]}>
                                {getStatusHeader()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Owner/Pickup Info */}
                {(ownerName || ownerAddress) && (
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>COLLECTION DETAILS</Text>
                        <View style={styles.infoCardContent}>
                            <Ionicons name="person-outline" size={20} color={COLORS.darkBlue} />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.infoLabel}>OWNER</Text>
                                <Text style={styles.infoValue}>{ownerName}</Text>
                            </View>
                        </View>
                        <View style={[styles.infoCardContent, { marginTop: 12 }]}>
                            <Ionicons name="map-outline" size={20} color={COLORS.darkBlue} />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.infoLabel}>PICKUP LOCATION</Text>
                                <Text style={styles.infoValue}>{ownerAddress}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Status Timeline */}
                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>RENTAL TIMELINE</Text>
                    <View style={styles.timelineCard}>
                        {/* Step 1: Requested */}
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineIcon, isStepActive('PENDING') && styles.iconActive]}>
                                <Ionicons name="send" size={14} color={COLORS.white} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Requested</Text>
                                <Text style={styles.timelineDate}>{startDate}</Text>
                            </View>
                        </View>
                        <View style={[styles.timelineLine, isStepActive('CONFIRMED') && styles.lineActive]} />

                        {/* Step 2: Confirmed */}
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineIcon, isStepActive('CONFIRMED') && styles.iconActive]}>
                                <Ionicons name="checkmark" size={16} color={COLORS.white} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Confirmed</Text>
                                <Text style={styles.timelineDesc}>{isStepActive('CONFIRMED') ? 'Owner has accepted' : 'Awaiting owner'}</Text>
                            </View>
                        </View>
                        <View style={[styles.timelineLine, isStepActive('IN_PROGRESS') && styles.lineActive]} />

                        {/* Step 3: Picked Up */}
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineIcon, isStepActive('IN_PROGRESS') && styles.iconActive]}>
                                <MaterialCommunityIcons name="handshake" size={16} color={COLORS.white} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Picked Up</Text>
                                <Text style={styles.timelineDesc}>{isStepActive('IN_PROGRESS') ? 'Tool is with you' : 'Ready for collection'}</Text>
                            </View>
                        </View>
                        <View style={[styles.timelineLine, isStepActive('COMPLETED') && styles.lineActive]} />

                        {/* Step 4: Returned */}
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineIcon, isStepActive('COMPLETED') && styles.iconActive]}>
                                <Ionicons name="calendar" size={16} color={isStepActive('COMPLETED') ? COLORS.white : COLORS.gray} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Return Due</Text>
                                <Text style={styles.timelineDate}>{dueDate}</Text>
                            </View>

                            {/* Review Section */}
                            {status === 'COMPLETED' && (
                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitle}>FEEDBACK</Text>
                                    {reviews.some((r: any) => r.reviewerId === user?.id) ? (
                                        <View style={styles.reviewDoneBox}>
                                            <Ionicons name="star" size={20} color={COLORS.orange} />
                                            <Text style={styles.reviewDoneText}>You have already rated this rental.</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.rateButton}
                                            onPress={() => navigation.navigate('WriteReview', {
                                                reviewType: 'RENTAL',
                                                id: rentalId,
                                                targetId: ownerId || '',
                                                title: toolName,
                                                subtitle: ownerName || 'Rental Owner',
                                                image: image || 'https://via.placeholder.com/150'
                                            })}
                                        >
                                            <Ionicons name="star-outline" size={20} color={COLORS.white} />
                                            <Text style={styles.rateButtonText}>Rate this tool</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Payment Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>PAYMENT INFORMATION</Text>
                    <View style={styles.infoCardContent}>
                        <Ionicons
                            name={paymentMethod === 'CARD' ? "card-outline" : "cash-outline"}
                            size={20}
                            color={COLORS.darkBlue}
                        />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={styles.infoLabel}>METHOD</Text>
                            <Text style={styles.infoValue}>{paymentMethod || 'CASH'}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: isPaid ? '#DCFCE7' : '#FEE2E2', marginLeft: 'auto' }]}>
                            <Text style={[styles.statusText, { color: isPaid ? '#15803D' : '#B91C1C' }]}>
                                {isPaid ? 'PAID' : 'UNPAID'}
                            </Text>
                        </View>
                    </View>

                    {!isPaid && paymentMethod === 'CARD' && status !== 'PENDING' && (
                        <TouchableOpacity
                            style={styles.payNowButton}
                            onPress={() => navigation.navigate('Payment', {
                                id: rentalId,
                                title: `Rent: ${toolName}`,
                                amount: totalAmount || 0,
                                type: 'RENTAL'
                            })}
                        >
                            <Text style={styles.payNowButtonText}>Pay Now LKR {totalAmount?.toLocaleString()}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Extend Options */}
                <View style={styles.extendSection}>
                    <Text style={styles.sectionTitle}>EXTEND RENTAL</Text>
                    <Text style={styles.extendDesc}>Need the tool for longer? Select additional days below.</Text>

                    <View style={styles.daysRow}>
                        {[1, 2, 3, 5, 7].map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[styles.dayButton, extendDays === day && styles.dayButtonActive]}
                                onPress={() => handleExtend(day)}
                            >
                                <Text style={[styles.dayButtonText, extendDays === day && styles.dayButtonTextActive]}>
                                    +{day} Day{day > 1 ? 's' : ''}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {extendDays > 0 && (
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Extension Period</Text>
                                <Text style={styles.summaryValue}>{extendDays} Days</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Additional Cost</Text>
                                <Text style={[styles.summaryValue, { color: COLORS.orange }]}>LKR {extraCost}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Proposed Due Date</Text>
                                <Text style={styles.totalValue}>Nov {24 + extendDays}, 2025</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Action */}
            {extendDays > 0 ? (
                <View style={styles.bottomBar}>
                    <View>
                        <Text style={styles.totalPriceLabel}>Est. Extra Cost</Text>
                        <Text style={styles.totalPriceValue}>LKR {extraCost}</Text>
                    </View>
                    <TouchableOpacity style={styles.confirmButton} onPress={confirmExtension}>
                        <Text style={styles.confirmButtonText}>Request Extension</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={[styles.confirmButton, styles.disabledButton]} disabled>
                        <Text style={styles.confirmButtonText}>Select Days to Extend</Text>
                    </TouchableOpacity>
                </View>
            )}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
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
        paddingTop: 20,
    },
    toolCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    toolImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        marginRight: 16,
    },
    toolInfo: {
        flex: 1,
    },
    toolName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    rentalId: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#10B981',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
        letterSpacing: 1,
        marginBottom: 16,
    },
    statusSection: {
        marginBottom: 24,
    },
    infoSection: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.gray,
        letterSpacing: 0.5,
    },
    payNowButton: {
        backgroundColor: COLORS.darkBlue,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    payNowButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginTop: 2,
    },
    timelineCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timelineIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        zIndex: 1,
    },
    iconActive: {
        backgroundColor: COLORS.darkBlue,
    },
    timelineContent: {
        flex: 1,
        marginTop: 2,
    },
    timelineTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    timelineDate: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 2,
    },
    timelineDesc: {
        fontSize: 12,
        color: COLORS.darkBlue,
        fontWeight: 'bold',
        marginTop: 2,
    },
    timelineLine: {
        width: 2,
        height: 30,
        backgroundColor: '#E5E7EB',
        marginLeft: 11, // half of icon width (12) - half of line width (1)
        marginVertical: 4,
    },
    lineActive: {
        backgroundColor: COLORS.darkBlue,
    },
    extendSection: {
        marginBottom: 24,
    },
    extendDesc: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 16,
    },
    daysRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    dayButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dayButtonActive: {
        backgroundColor: COLORS.darkBlue,
        borderColor: COLORS.darkBlue,
    },
    dayButtonText: {
        fontSize: 14,
        color: COLORS.black,
        fontWeight: '600',
    },
    dayButtonTextActive: {
        color: COLORS.white,
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.gray,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalPriceLabel: {
        fontSize: 12,
        color: COLORS.gray,
    },
    totalPriceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    confirmButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    disabledButton: {
        backgroundColor: '#E5E7EB',
        flex: 1,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.orange,
        borderRadius: 12,
        paddingVertical: 12,
        gap: 8,
    },
    rateButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    reviewDoneBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    reviewDoneText: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '500',
    },
});

export default RentalStatusScreen;
