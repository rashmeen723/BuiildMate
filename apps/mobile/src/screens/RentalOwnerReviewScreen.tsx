import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
import { authApi } from '../services/api';

type RentalOwnerReviewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RentalOwnerReview'>;
type RentalOwnerReviewRouteProp = RouteProp<RootStackParamList, 'RentalOwnerReview'>;

const RentalOwnerReviewScreen = () => {
    const navigation = useNavigation<RentalOwnerReviewNavigationProp>();
    const route = useRoute<RentalOwnerReviewRouteProp>();

    const { email, fullName, phone, role, rentalDetails, documents, serviceArea, password } = route.params;

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [policyAccepted, setPolicyAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!termsAccepted || !policyAccepted) {
            Alert.alert("Required", "Please accept all agreements to continue.");
            return;
        }

        setLoading(true);
        try {
            // 1. Upload Documents to Cloudinary
            console.log('Uploading rental owner documents to Cloudinary...');

            const idFrontUrl = await authApi.uploadPublicFile(documents.idImageFront);
            const idBackUrl = await authApi.uploadPublicFile(documents.idImageBack);
            const profileImageUrl = await authApi.uploadPublicFile(documents.profileImage);
            
            const isIndividual = rentalDetails?.ownerType === 'INDIVIDUAL';
            let businessDocUrl = null;
            let utilityBillUrl = null;
            if (isIndividual) {
                utilityBillUrl = await authApi.uploadPublicFile(documents.utilityBill);
            } else {
                businessDocUrl = await authApi.uploadPublicFile(documents.businessDoc);
            }

            // 2. Prepare final registration data
            const registrationData = {
                email,
                fullName,
                phone,
                role: 'RENTAL_OWNER',
                password,
                profileImage: profileImageUrl,
                rentalDetails,
                documents: {
                    idImageFront: idFrontUrl,
                    idImageBack: idBackUrl,
                    ...(isIndividual ? { utilityBill: utilityBillUrl } : { businessDoc: businessDocUrl })
                },
                location: {
                    latitude: serviceArea?.location?.latitude,
                    longitude: serviceArea?.location?.longitude,
                    address: serviceArea?.address
                }
            };

            await authApi.register(registrationData);

            Alert.alert(
                "Success",
                isIndividual ? "Your profile has been submitted!" : "Your store profile has been submitted!",
                [{
                    text: "OK",
                    onPress: () => navigation.reset({
                        index: 0,
                        routes: [{ name: 'ServiceProviderPending' }],
                    })
                }]
            );
        } catch (error: any) {
            Alert.alert("Submission Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditDetails = () => navigation.navigate('RentalOwnerDetails', { email, fullName, phone, role, currentDetails: rentalDetails });
    const handleEditDocuments = () => navigation.navigate('RentalOwnerDocuments', { email, fullName, phone, role, rentalDetails, currentDocuments: documents });
    const handleEditLocation = () => navigation.navigate('RentalOwnerServiceArea', { email, fullName, phone, role, rentalDetails, documents, currentServiceArea: serviceArea });

    const Section = ({ title, onEdit, children }: { title: string, onEdit: () => void, children: React.ReactNode }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                    <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.card}>{children}</View>
        </View>
    );

    const Row = ({ label, value }: { label: string, value: string }) => (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    );

    const isIndividual = rentalDetails?.ownerType === 'INDIVIDUAL';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Final Check</Text>
                <Text style={styles.subtitle}>Review your rental profile before submitting.</Text>

                <Section title={isIndividual ? "Profile Information" : "Store Information"} onEdit={handleEditDetails}>
                    <Row label={isIndividual ? "Shed/Display Name" : "Store Name"} value={rentalDetails.businessName} />
                    <Row label="Categories" value={rentalDetails.toolCategories.join(', ')} />
                    {!isIndividual && <Row label="Experience" value={rentalDetails.yearsInBusiness ? `${rentalDetails.yearsInBusiness} years` : 'N/A'} />}
                </Section>

                <Section title="Verification Documents" onEdit={handleEditDocuments}>
                    <Row label="Profile Photo" value="Attached" />
                    <Row label="ID Front" value="Attached" />
                    <Row label="ID Back" value="Attached" />
                    <Row label={isIndividual ? "Address Proof" : "Business Permit"} value="Attached" />
                </Section>

                <Section title="Logistics" onEdit={handleEditLocation}>
                    <Row label="Home Address" value={serviceArea.address} />
                    <Row label="Site Delivery" value={serviceArea.offersDelivery ? 'Yes' : 'No'} />
                </Section>

                <View style={styles.agreementBox}>
                    <TouchableOpacity style={styles.checkRow} onPress={() => setTermsAccepted(!termsAccepted)}>
                        <Ionicons name={termsAccepted ? "checkbox" : "square-outline"} size={22} color={COLORS.darkBlue} />
                        <Text style={styles.checkText}>I agree to the Rental Terms</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkRow} onPress={() => setPolicyAccepted(!policyAccepted)}>
                        <Ionicons name={policyAccepted ? "checkbox" : "square-outline"} size={22} color={COLORS.darkBlue} />
                        <Text style={styles.checkText}>I accept the Payment & Reward policies</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.buttonText}>Submit Profile</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, backgroundColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
    content: { padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.darkBlue },
    subtitle: { fontSize: 15, color: COLORS.gray, marginBottom: 20 },
    section: { marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
    editButton: { padding: 2 },
    editText: { color: COLORS.primary, fontWeight: '600' },
    card: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    rowLabel: { color: COLORS.gray, flex: 1 },
    rowValue: { color: COLORS.darkBlue, fontWeight: '600', flex: 1, textAlign: 'right' },
    agreementBox: { marginTop: 10 },
    checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    checkText: { marginLeft: 10, color: COLORS.black },
    footer: { padding: 24, backgroundColor: 'white' },
    button: { backgroundColor: COLORS.darkBlue, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 17 },
    backButton: { padding: 5 }
});

export default RentalOwnerReviewScreen;
