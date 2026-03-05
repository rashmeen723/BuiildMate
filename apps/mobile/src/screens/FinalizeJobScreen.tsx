import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    StatusBar,
    TextInput,
    Alert,
    Dimensions,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { authApi } from '../services/api';

const { width } = Dimensions.get('window');

type FinalizeJobScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FinalizeJob'>;
type FinalizeJobScreenRouteProp = RouteProp<RootStackParamList, 'FinalizeJob'>;

interface ChecklistItem {
    id: number;
    label: string;
    checked: boolean;
}

interface AdditionalCharge {
    id: number;
    label: string;
    description: string;
    amount: number;
}

const FinalizeJobScreen = () => {
    const navigation = useNavigation<FinalizeJobScreenNavigationProp>();
    const route = useRoute<FinalizeJobScreenRouteProp>();
    const { serviceId, serviceType, serviceFee, customerName, arrivedAt, hourlyRate } = route.params;

    const [baseRate, setBaseRate] = useState(0);

    useEffect(() => {
        const calculateBaseRate = () => {
            if (arrivedAt && hourlyRate) {
                const durationMs = new Date().getTime() - new Date(arrivedAt).getTime();
                const durationHours = durationMs / (1000 * 60 * 60);
                const calcBase = Math.max(1, durationHours) * hourlyRate;
                setBaseRate(calcBase);
            } else {
                setBaseRate(serviceFee || 0);
            }
        };

        calculateBaseRate();

        const interval = setInterval(calculateBaseRate, 10000);
        return () => clearInterval(interval);
    }, [arrivedAt, hourlyRate, serviceFee]);

    const [checklist, setChecklist] = useState<ChecklistItem[]>([
        { id: 1, label: 'Initial diagnosis carried out', checked: true },
        { id: 2, label: 'Replacement parts installed', checked: false },
        { id: 3, label: 'Workspace cleaned and cleared', checked: false },
    ]);

    const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal Visibility States
    const [taskModalVisible, setTaskModalVisible] = useState(false);
    const [chargeModalVisible, setChargeModalVisible] = useState(false);

    // New Entry Temp States
    const [newTaskLabel, setNewTaskLabel] = useState('');
    const [newChargeLabel, setNewChargeLabel] = useState('');
    const [newChargeAmount, setNewChargeAmount] = useState('');

    const toggleChecklist = (id: number) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const removeChecklistItem = (id: number) => {
        setChecklist(prev => prev.filter(item => item.id !== id));
    };

    const handleAddTask = () => {
        if (!newTaskLabel.trim()) return;
        setChecklist(prev => [
            ...prev,
            { id: Date.now(), label: newTaskLabel.trim(), checked: true }
        ]);
        setNewTaskLabel('');
        setTaskModalVisible(false);
    };

    const handleAddCharge = () => {
        const amount = parseFloat(newChargeAmount);
        if (!newChargeLabel.trim() || isNaN(amount)) {
            Alert.alert("Invalid Input", "Please provide a description and a valid amount.");
            return;
        }
        setAdditionalCharges(prev => [
            ...prev,
            {
                id: Date.now(),
                label: newChargeLabel.trim(),
                description: 'Materials/Parts',
                amount
            }
        ]);
        setNewChargeLabel('');
        setNewChargeAmount('');
        setChargeModalVisible(false);
    };

    const removeCharge = (id: number) => {
        setAdditionalCharges(prev => prev.filter(item => item.id !== id));
    };

    const calculateTotalAdditional = () => {
        return additionalCharges.reduce((sum, item) => sum + item.amount, 0);
    };

    const combinedTotal = baseRate + calculateTotalAdditional();
    const appServiceFee = combinedTotal * 0.05;
    const estimatedFinal = combinedTotal + appServiceFee;

    const handleCompleteJob = async () => {
        setLoading(true);
        try {
            await authApi.updateBookingStatus(serviceId.toString(), 'COMPLETED', calculateTotalAdditional());
            Alert.alert(
                "Job Completed",
                "Invoice generated and job marked as completed successfully.",
                [{ text: "OK", onPress: () => navigation.navigate('ServiceProviderDashboard') }]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to complete job. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Finalize Job</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* Reference Banner */}
            <View style={styles.referenceBanner}>
                <Text style={styles.referenceLabel}>JOB REFERENCE</Text>
                <Text style={styles.referenceValue}>#BM - {serviceId}  {serviceType}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Checklist Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>TASK CHECKLIST</Text>
                    <TouchableOpacity onPress={() => setTaskModalVisible(true)} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+Add Task</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.checklistContainer}>
                    {checklist.map(item => (
                        <View key={item.id} style={styles.checklistItem}>
                            <TouchableOpacity
                                style={styles.itemContent}
                                onPress={() => toggleChecklist(item.id)}
                            >
                                <View style={[styles.checkbox, item.checked && styles.checkboxActive]}>
                                    {item.checked && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                                </View>
                                <Text style={[styles.itemLabel, item.checked && styles.itemLabelActive]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeChecklistItem(item.id)}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Additional Charges Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>ADDITIONAL MATERIALS & CHARGES</Text>
                    <TouchableOpacity onPress={() => setChargeModalVisible(true)} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+Add Charge</Text>
                    </TouchableOpacity>
                </View>

                {additionalCharges.length > 0 ? (
                    additionalCharges.map(charge => (
                        <View key={charge.id} style={styles.chargeItem}>
                            <View style={styles.chargeIconBox}>
                                <MaterialCommunityIcons name="tools" size={20} color={COLORS.darkBlue} />
                            </View>
                            <View style={styles.chargeInfo}>
                                <Text style={styles.chargeLabel}>{charge.label}</Text>
                                <Text style={styles.chargeDesc}>{charge.description}</Text>
                            </View>
                            <View style={styles.chargeRight}>
                                <Text style={styles.chargeAmount}>LKR {charge.amount.toLocaleString()}</Text>
                                <TouchableOpacity onPress={() => removeCharge(charge.id)} style={styles.removeChargeBtn}>
                                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No extra materials or charges added.</Text>
                    </View>
                )}

                {/* Invoice Breakdown */}
                <Text style={styles.sectionTitleMain}>FINAL INVOICE SUMMARY</Text>
                <View style={styles.invoiceCard}>
                    <View style={styles.invoiceRow}>
                        <Text style={styles.invoiceLabel}>Labor / Base Service Fee</Text>
                        <Text style={styles.invoiceValue}>LKR {baseRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                    </View>
                    <View style={styles.invoiceRow}>
                        <Text style={styles.invoiceLabel}>Materials & Extra Charges</Text>
                        <Text style={styles.invoiceValue}>LKR {calculateTotalAdditional().toLocaleString()}</Text>
                    </View>
                    <View style={styles.invoiceRow}>
                        <Text style={styles.invoiceLabel}>BuildMate Service Fee (5%)</Text>
                        <Text style={styles.invoiceValue}>LKR {appServiceFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                    </View>
                    <View style={styles.invoiceDivider} />
                    <View style={styles.invoiceRow}>
                        <Text style={styles.totalLabel}>Total to be Paid</Text>
                        <Text style={styles.totalValue}>LKR {estimatedFinal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && { opacity: 0.7 }]}
                    onPress={handleCompleteJob}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Completing Job...' : 'Finalize & Request Payment'}
                    </Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Task Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={taskModalVisible}
                onRequestClose={() => setTaskModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Checklist Item</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Cleared all electrical debris"
                            value={newTaskLabel}
                            onChangeText={setNewTaskLabel}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setTaskModalVisible(false)}
                            >
                                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnAdd]}
                                onPress={handleAddTask}
                            >
                                <Text style={styles.modalBtnTextAdd}>Add Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Charge Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={chargeModalVisible}
                onRequestClose={() => setChargeModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Material/Charge</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Item Description (e.g. 5m Wire)"
                            value={newChargeLabel}
                            onChangeText={setNewChargeLabel}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Amount (LKR)"
                            value={newChargeAmount}
                            onChangeText={setNewChargeAmount}
                            keyboardType="numeric"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setChargeModalVisible(false)}
                            >
                                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnAdd]}
                                onPress={handleAddCharge}
                            >
                                <Text style={styles.modalBtnTextAdd}>Add Charge</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 15,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
    },
    headerPlaceholder: {
        width: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    referenceBanner: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    referenceLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
        letterSpacing: 1,
    },
    referenceValue: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.black,
        marginTop: 4,
        lineHeight: 18,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        letterSpacing: 0.5,
        marginRight: 10,
    },
    sectionTitleMain: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.black,
        marginTop: 35,
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.orange,
    },
    addButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.orange,
    },
    checklistContainer: {
        backgroundColor: '#FBFBFC',
        borderRadius: 12,
        padding: 5,
        borderWidth: 1,
        borderColor: '#F1F1F1',
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#1A237E',
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#1A237E',
    },
    itemLabel: {
        fontSize: 15,
        color: '#444',
    },
    itemLabelActive: {
        color: '#1A237E',
        fontWeight: '500',
    },
    chargeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    chargeIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#EDF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    chargeInfo: {
        flex: 1,
    },
    chargeLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    chargeDesc: {
        fontSize: 12,
        color: '#777',
        marginTop: 2,
    },
    chargeAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginVertical: 10,
    },
    invoiceCard: {
        backgroundColor: '#1A237E',
        borderRadius: 16,
        padding: 24,
        marginTop: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    invoiceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    invoiceLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    invoiceValue: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '500',
    },
    invoiceDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderStyle: 'dashed',
        marginVertical: 10,
    },
    totalLabel: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalValue: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#0F172A',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    chargeRight: {
        alignItems: 'flex-end',
    },
    removeChargeBtn: {
        marginTop: 4,
    },
    emptyCard: {
        padding: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 20,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.black,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 8,
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    modalBtnCancel: {
        backgroundColor: '#F3F4F6',
    },
    modalBtnAdd: {
        backgroundColor: COLORS.darkBlue,
    },
    modalBtnTextCancel: {
        color: COLORS.gray,
        fontWeight: '600',
    },
    modalBtnTextAdd: {
        color: COLORS.white,
        fontWeight: '600',
    },
});

export default FinalizeJobScreen;
