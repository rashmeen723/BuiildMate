import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BottomNavBar = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();
    const currentRoute = route.name;

    const navItems = [
        { name: 'Home', label: 'Home', icon: 'home', route: 'Home' },
        { name: 'Activity', label: 'Activity', icon: 'document-text', route: 'Activity' },
        { name: 'Notification', label: 'Notification', icon: 'notifications', route: 'Notification' },
        { name: 'Profile', label: 'Profile', icon: 'person', route: 'Profile' },
    ];

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
                            color={isActive ? COLORS.darkBlue : COLORS.gray}
                        />
                        <Text style={[
                            styles.navText,
                            { color: isActive ? COLORS.darkBlue : COLORS.gray, fontWeight: isActive ? 'bold' : 'normal' }
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
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        elevation: 8, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navText: {
        fontSize: 10,
        marginTop: 4,
    },
});

export default BottomNavBar;
