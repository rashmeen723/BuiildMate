import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';

type NotificationSettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NotificationSettings'>;

const NotificationSettingsScreen = () => {
    const navigation = useNavigation<NotificationSettingsScreenNavigationProp>();

    // State for toggles
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [promotionsEnabled, setPromotionsEnabled] = useState(true);
    const [serviceUpdates, setServiceUpdates] = useState(true);

    const toggleSwitch = (key: string) => {
        switch (key) {
            case 'push': setPushEnabled(!pushEnabled); break;
            case 'email': setEmailEnabled(!emailEnabled); break;
            case 'promotions': setPromotionsEnabled(!promotionsEnabled); break;
            case 'services': setServiceUpdates(!serviceUpdates); break;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notification Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Preferences</Text>

                <View style={styles.settingItem}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingTitle}>Push Notifications</Text>
                        <Text style={styles.settingDesc}>Receive alerts on your device for updates.</Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#E5E7EB', true: COLORS.darkBlue }}
                        thumbColor={COLORS.white}
                        ios_backgroundColor="#E5E7EB"
                        onValueChange={() => toggleSwitch('push')}
                        value={pushEnabled}
                    />
                </View>

                <View style={styles.settingItem}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingTitle}>Email Notifications</Text>
                        <Text style={styles.settingDesc}>Get summaries and receipts via email.</Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#E5E7EB', true: COLORS.darkBlue }}
                        thumbColor={COLORS.white}
                        ios_backgroundColor="#E5E7EB"
                        onValueChange={() => toggleSwitch('email')}
                        value={emailEnabled}
                    />
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Categories</Text>

                <View style={styles.settingItem}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingTitle}>Service Updates</Text>
                        <Text style={styles.settingDesc}>Status updates for your booked services.</Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#E5E7EB', true: COLORS.darkBlue }}
                        thumbColor={COLORS.white}
                        ios_backgroundColor="#E5E7EB"
                        onValueChange={() => toggleSwitch('services')}
                        value={serviceUpdates}
                    />
                </View>

                <View style={styles.settingItem}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingTitle}>Promotional Offers</Text>
                        <Text style={styles.settingDesc}>Discounts and new feature announcements.</Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#E5E7EB', true: COLORS.darkBlue }}
                        thumbColor={COLORS.white}
                        ios_backgroundColor="#E5E7EB"
                        onValueChange={() => toggleSwitch('promotions')}
                        value={promotionsEnabled}
                    />
                </View>

            </View>
            {/* Bottom Navigation */}
            <BottomNavBar />
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.gray,
        marginTop: 10,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    settingTextContainer: {
        flex: 1,
        paddingRight: 16,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    settingDesc: {
        fontSize: 13,
        color: COLORS.gray,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 10,
    },
});

export default NotificationSettingsScreen;
