import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
import { authApi } from '../services/api';

type ServiceProviderReviewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ServiceProviderReview'>;
type ServiceProviderReviewRouteProp = RouteProp<RootStackParamList, 'ServiceProviderReview'>;

const ServiceProviderReviewScreen = () => {
    const navigation = useNavigation<ServiceProviderReviewNavigationProp>();
    const route = useRoute<ServiceProviderReviewRouteProp>();

    const {
        email,
        fullName,
        phone,
        role,
        professionalDetails,
        documents,
        serviceArea,
        password
    } = route.params;

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [agreementAccepted, setAgreementAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEditProfessional = () => {
        navigation.navigate('ServiceProviderDetails', {
            email, fullName, phone, role,
            currentDetails: professionalDetails
        });
    };

    const handleEditDocuments = () => {
        navigation.navigate('ServiceProviderDocuments', {
            email, fullName, phone, role,
            professionalDetails,
            currentDocuments: documents
        });
    };

    const handleEditServiceArea = () => {
        navigation.navigate('ServiceProviderServiceArea', {
            email, fullName, phone, role,
            professionalDetails,
            documents,
            currentServiceArea: serviceArea
        });
    };

    const handleSubmit = async () => {
        if (!termsAccepted || !agreementAccepted) {
            Alert.alert("Required", "Please accept the Terms & Conditions and Service Provider Agreement.");
            return;
        }

        setLoading(true);
        try {
            // 1. Upload Documents to Cloudinary first
            console.log('Uploading documents to Cloudinary...');

            // Upload Utility Bill
            const utilityBillUrl = await authApi.uploadPublicFile(documents.utilityBill);

            // Upload Profile Photo
            const profileImageUrl = await authApi.uploadPublicFile(documents.profileImage);

            // Upload Certificate Images
            const certImageUrls = await Promise.all(
                documents.certificateImages.map((uri: string) => authApi.uploadPublicFile(uri))
            );

            // 2. Prepare final registration data
            const registrationData = {
                email,
                fullName,
                phone,
                role: 'SERVICE_PROVIDER',
                password,
                profileImage: profileImageUrl,
                professionalDetails,
                documents: {
                    utilityBill: utilityBillUrl,
                    certificateImages: certImageUrls
                },
                serviceArea: {
                    address: serviceArea.address,
                    radius: serviceArea.radius,
                    workingDays: serviceArea.workingDays,
                    workingHours: serviceArea.workingHours
                },
                location: {
                    latitude: serviceArea?.location?.latitude,
                    longitude: serviceArea?.location?.longitude,
                    address: serviceArea?.address
                }
            };

            console.log('Final registration data:', JSON.stringify(registrationData, null, 2));
            await authApi.register(registrationData);

            Alert.alert(
                "Success",
                "Your application has been submitted successfully!",
                [{
                    text: "OK",
                    onPress: () => navigation.reset({
                        index: 0,
                        routes: [{ name: 'ServiceProviderPending' }],
                    })
                }]
            );
        } catch (error: any) {
            console.error('Registration Flow Error:', error);
            Alert.alert("Registration Failed", error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const Section = ({ title, onEdit, children }: { title: string, onEdit?: () => void, children: React.ReactNode }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {onEdit && (
                    <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                        <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                )}
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Application</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Review & Submit</Text>
                <Text style={styles.subtitle}>Please confirm your details before submitting.</Text>

                {/* Professional Info */}
                <Section title="Professional Details" onEdit={handleEditProfessional}>
                    <Row label="Full Name" value={fullName} />
                    <Row label="Email" value={email} />
                    <Row label="Phone" value={phone} />
                    <Row label="Specialty" value={professionalDetails.categories.join(', ')} />
                    <Row label="Experience" value={`${professionalDetails.yearsOfExperience} years`} />
                </Section>

                {/* Verification Documents */}
                <Section title="Verification Documents" onEdit={handleEditDocuments}>
                    <Row label="Profile Photo" value={documents.profileImage ? "Attached" : "Missing"} />
                    <Row label="Address Proof" value={documents.utilityBill ? "Attached" : "Missing"} />

                    <Row label="Certificates" value={`${documents.certificateImages.length} uploaded`} />

                </Section>

                {/* Service Area */}
                <Section title="Service Availability" onEdit={handleEditServiceArea}>
                    <Row label="Base Location" value={serviceArea.address} />
                    <Row label="Service Radius" value={`${serviceArea.radius} km`} />
                    <Row label="Working Days" value={serviceArea.workingDays.join(', ')} />
                    <Row label="Hours" value={`${serviceArea.workingHours.start} - ${serviceArea.workingHours.end}`} />
                </Section>

                {/* Agreements */}
                <View style={styles.agreementSection}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setTermsAccepted(!termsAccepted)}
                    >
                        <Ionicons
                            name={termsAccepted ? "checkbox" : "square-outline"}
                            size={24}
                            color={termsAccepted ? COLORS.darkBlue : COLORS.gray}
                        />
                        <Text style={styles.checkboxText}>
                            I agree to the <Text style={styles.link}>Terms & Conditions</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setAgreementAccepted(!agreementAccepted)}
                    >
                        <Ionicons
                            name={agreementAccepted ? "checkbox" : "square-outline"}
                            size={24}
                            color={agreementAccepted ? COLORS.darkBlue : COLORS.gray}
                        />
                        <Text style={styles.checkboxText}>
                            I agree to the <Text style={styles.link}>Service Provider Agreement</Text>
                        </Text>
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
                        <>
                            <Text style={styles.buttonText}>Submit Application</Text>
                            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.white} style={{ marginLeft: 8 }} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.gray,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    editText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: 4,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    rowLabel: {
        fontSize: 14,
        color: COLORS.gray,
        flex: 1,
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkBlue,
        flex: 1,
        textAlign: 'right',
    },
    agreementSection: {
        marginTop: 10,
        marginBottom: 20,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkboxText: {
        marginLeft: 12,
        fontSize: 14,
        color: COLORS.black,
    },
    link: {
        color: COLORS.primary || '#007AFF',
        fontWeight: '600',
    },
    footer: {
        padding: 24,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    button: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ServiceProviderReviewScreen;
