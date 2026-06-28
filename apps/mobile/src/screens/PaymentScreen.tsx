import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { authApi, rentalsApi } from '../services/api';

type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;

const PaymentScreen = () => {
    const navigation = useNavigation<PaymentScreenNavigationProp>();
    const route = useRoute<PaymentScreenRouteProp>();
    const {
        id,
        title,
        amount,
        type,
        baseAmount,
        additionalCharges,
        serviceFee
    } = route.params || { id: 1, title: 'Mock Service', amount: 1500, type: 'SERVICE' };

    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');

    const handlePayment = async () => {
        if (paymentMethod === 'CARD') {
            if (!cardNumber || !expiry || !cvv || !nameOnCard) {
                Alert.alert('Missing Information', 'Please fill in all card details.');
                return;
            }
            // Mock card validation
            if (cardNumber.length < 16) {
                Alert.alert('Invalid Card', 'Please enter a valid card number.');
                return;
            }
        }

        try {
            if (type === 'SERVICE') {
                if (paymentMethod === 'CARD') {
                    // Digital payment is immediate
                    await authApi.updateBookingStatus(id.toString(), 'PAID');
                    Alert.alert(
                        'Payment Successful',
                        `You have successfully paid LKR ${amount.toLocaleString()} for ${title} using Card.`,
                        [
                            { text: 'OK', onPress: () => navigation.navigate('Activity', { updatedRentalId: undefined, newStatus: 'PAID' }) }
                        ]
                    );
                } else {
                    // Cash payment needs provider confirmation
                    Alert.alert(
                        'Cash Payment Notified',
                        `Please hand over LKR ${amount.toLocaleString()} to the provider. The job will be marked as paid once the provider confirms receipt.`,
                        [
                            { text: 'OK', onPress: () => navigation.goBack() }
                        ]
                    );
                }
            } else if (type === 'RENTAL') {
                if (paymentMethod === 'CARD') {
                    await rentalsApi.updateRentalStatus(id.toString(), 'PAID');
                    Alert.alert('Payment Successful', `Payment for ${title} processed via Card.`);
                    navigation.navigate('Activity', { updatedRentalId: Number(id), newStatus: 'PAID' });
                } else {
                    Alert.alert(
                        'Cash Payment Selected',
                        `Please pay LKR ${amount.toLocaleString()} in cash directly to the rental owner.`,
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                }
            }
        } catch (error) {
            Alert.alert('Payment Failed', 'Failed to process payment. Try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Make Payment</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Order Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Payment Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service</Text>
                        <Text style={styles.summaryValue}>{title}</Text>
                    </View>

                    {type === 'SERVICE' && (baseAmount !== undefined || additionalCharges !== undefined) && (
                        <>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Base Labor Fee</Text>
                                <Text style={styles.summaryValue}>LKR {Math.round(baseAmount || 0).toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Materials/Extra</Text>
                                <Text style={styles.summaryValue}>LKR {Math.round(additionalCharges || 0).toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>BuildMate Service Fee</Text>
                                <Text style={styles.summaryValue}>LKR {Math.round(serviceFee || (amount - (amount / 1.05))).toLocaleString()}</Text>
                            </View>
                        </>
                    )}

                    {!baseAmount && !additionalCharges && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Type</Text>
                            <Text style={styles.summaryValue}>{type}</Text>
                        </View>
                    )}

                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>LKR {Math.round(amount).toLocaleString()}</Text>
                    </View>
                </View>

                {/* Payment Method Selection */}
                <Text style={styles.sectionTitle}>Select Payment Method</Text>
                <View style={styles.methodContainer}>
                    <TouchableOpacity
                        style={[styles.methodOption, paymentMethod === 'CARD' && styles.methodActive]}
                        onPress={() => setPaymentMethod('CARD')}
                    >
                        <Ionicons name="card-outline" size={24} color={paymentMethod === 'CARD' ? COLORS.white : COLORS.black} />
                        <Text style={[styles.methodText, paymentMethod === 'CARD' && styles.methodTextActive]}>Credit/Debit Card</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.methodOption, paymentMethod === 'CASH' && styles.methodActive]}
                        onPress={() => setPaymentMethod('CASH')}
                    >
                        <Ionicons name="cash-outline" size={24} color={paymentMethod === 'CASH' ? COLORS.white : COLORS.black} />
                        <Text style={[styles.methodText, paymentMethod === 'CASH' && styles.methodTextActive]}>Cash Payment</Text>
                    </TouchableOpacity>
                </View>

                {/* Conditional Rendering based on Method */}
                {paymentMethod === 'CARD' ? (
                    <View style={styles.cardForm}>
                        <Text style={styles.inputLabel}>Card Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0000 0000 0000 0000"
                            keyboardType="numeric"
                            maxLength={16}
                            value={cardNumber}
                            onChangeText={setCardNumber}
                        />

                        <View style={styles.row}>
                            <View style={[styles.column, { marginRight: 10 }]}>
                                <Text style={styles.inputLabel}>Expiry Date</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    value={expiry}
                                    onChangeText={setExpiry}
                                />
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.inputLabel}>CVV</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="123"
                                    keyboardType="numeric"
                                    maxLength={3}
                                    secureTextEntry
                                    value={cvv}
                                    onChangeText={setCvv}
                                />
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>Cardholder Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            value={nameOnCard}
                            onChangeText={setNameOnCard}
                        />
                    </View>
                ) : (
                    <View style={styles.cashMsgBox}>
                        <Ionicons name="alert-circle-outline" size={24} color={COLORS.orange} />
                        <Text style={styles.cashMsgText}>
                            Please pay the exact amount of <Text style={{ fontWeight: 'bold' }}>LKR {amount}</Text> directly to the provider upon completion.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Pay Button - Only for Card */}
            {paymentMethod === 'CARD' && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                        <Text style={styles.payButtonText}>
                            Pay LKR {amount.toLocaleString()}
                        </Text>
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
    },
    methodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    methodOption: {
        flex: 1,
        flexDirection: 'row', // icon and text side-by-side inside button maybe too crowded if vertical, lets try vertical stack or side by side.
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginHorizontal: 4,
    },
    methodActive: {
        backgroundColor: COLORS.darkBlue,
        borderColor: COLORS.darkBlue,
    },
    methodText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        marginLeft: 8,
    },
    methodTextActive: {
        color: COLORS.white,
    },
    cardForm: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.gray,
        marginBottom: 8,
        marginTop: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: COLORS.black,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        flex: 1,
    },
    cashMsgBox: {
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FFEDD5',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cashMsgText: {
        fontSize: 14,
        color: '#9A3412',
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    payButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    payButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PaymentScreen;
