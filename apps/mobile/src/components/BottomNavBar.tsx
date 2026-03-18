import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';

import { useAuth } from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BottomNavBar = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();
    const { user } = useAuth();
    const currentRoute = route.name;

    const getNavItems = () => {
        if (user?.role === 'SERVICE_PROVIDER') {
            return [
                { name: 'Home', label: 'Home', icon: 'home', route: 'ServiceProviderDashboard' },
                { name: 'Activity', label: 'Bookings', icon: 'reader', route: 'Activity' },
                { name: 'Schedule', label: 'Schedule', icon: 'calendar', route: 'ProviderSchedule' },
                { name: 'Ratings', label: 'Ratings', icon: 'star', route: 'ProviderRatings' },
                { name: 'Profile', label: 'Profile', icon: 'person', route: 'Profile' },
            ];
        }

        if (user?.role === 'RENTAL_OWNER') {
            return [
                { name: 'Home', label: 'Home', icon: 'home', route: 'RentalOwnerDashboard' },
                { name: 'Rentals', label: 'Rentals', icon: 'swap-horizontal', route: 'RentalRequests' },
                { name: 'Schedule', label: 'Schedule', icon: 'calendar', route: 'RentalOwnerSchedule' },
                { name: 'Ratings', label: 'Ratings', icon: 'star', route: 'RentalOwnerRatings' },
                { name: 'Profile', label: 'Profile', icon: 'person', route: 'Profile' },
            ];
        }

        // Default items for Household/Others
        return [
            { name: 'Home', label: 'Home', icon: 'home', route: 'Home' },
            { name: 'Activity', label: 'Activity', icon: 'document-text', route: 'Activity' },
            { name: 'Notification', label: 'Notification', icon: 'notifications', route: 'Notification' },
            { name: 'Profile', label: 'Profile', icon: 'person', route: 'Profile' },
        ];
    };

    const navItems = getNavItems();

    return (
        <View style={styles.bottomNav}>
            {navItems.map((item) => {
                const isActive = currentRoute === item.route;
                return (
                    <TouchableOpacity
                        key={item.name}
                        style={styles.navItem}
                        onPress={() => navigation.navigate(item.route as any)}
                    >
                        <Ionicons
                            name={isActive ? item.icon as any : `${item.icon}-outline` as any}
                            size={24}
                            color={isActive ? COLORS.primary : COLORS.gray}
                        />
                        <Text style={[
                            styles.navText,
                            {
                                color: isActive ? COLORS.primary : COLORS.gray,
                                fontWeight: isActive ? 'bold' : '500'
                            }
                        ]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.white,
        paddingTop: 12,
        paddingBottom: 28, // Increased for system nav compatibility
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navText: {
        fontSize: 11,
        marginTop: 4,
    },
});

export default BottomNavBar;
