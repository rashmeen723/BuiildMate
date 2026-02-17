import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

type RentalStatusScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalStatus'>;
type RentalStatusScreenRouteProp = RouteProp<RootStackParamList, 'RentalStatus'>;

const { width } = Dimensions.get('window');

const RentalStatusScreen = () => {
    const navigation = useNavigation<RentalStatusScreenNavigationProp>();
    const route = useRoute<RentalStatusScreenRouteProp>();
    const { rentalId, toolName, dueDate, image } = route.params || {
        rentalId: 1,
        toolName: 'Makita LXT Power Drill',
        dueDate: 'November 24, 2025',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    };

    const [extendDays, setExtendDays] = useState(0);
    const [extraCost, setExtraCost] = useState(0);
    const pricePerDay = 800; // Mock price

    const handleExtend = (days: number) => {
        setExtendDays(days);
        setExtraCost(days * pricePerDay);
    };

    const confirmExtension = () => {
        // Logic to request extension (verified by tool owner)
        alert(`Extension request sent! The owner will verify your request for ${extendDays} additional days.`);
        navigation.navigate('Activity', { updatedRentalId: rentalId, newStatus: 'EXTENSION PENDING' });
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
                    <Image source={{ uri: image }} style={styles.toolImage} />
                    <View style={styles.toolInfo}>
                        <Text style={styles.toolName}>{toolName}</Text>
                        <Text style={styles.rentalId}>Rental ID: #{rentalId}</Text>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>ACTIVE</Text>
                        </View>
                    </View>
                </View>

                {/* Status Timeline */}
                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>RENTAL TIMELINE</Text>
                    <View style={styles.timelineCard}>
                        {/* Start */}
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineIcon, styles.iconActive]}>
                                <Ionicons name="checkmark" size={16} color={COLORS.white} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Picked Up</Text>
                                <Text style={styles.timelineDate}>Nov 21, 2025</Text>
                            </View>
                        </View>
                        {/* Line */}
                        <View style={[styles.timelineLine, styles.lineActive]} />

                        {/* Current */}
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineIcon, styles.iconActive]}>
                                <Ionicons name="time" size={16} color={COLORS.white} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>In Use</Text>
                                <Text style={styles.timelineDesc}>Currently active</Text>
                            </View>
                        </View>
                        {/* Line */}
                        <View style={styles.timelineLine} />

                        {/* End */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineIcon}>
                                <Ionicons name="calendar" size={16} color={COLORS.gray} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Due Return</Text>
                                <Text style={styles.timelineDate}>{dueDate}</Text>
                            </View>
                        </View>
                    </View>
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
});

export default RentalStatusScreen;
