import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import { authApi, rentalsApi } from '../services/api';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const getServiceIcon = (name: string) => {
    switch (name.toLowerCase()) {
        case 'electrician': return 'flash';
        case 'plumber': return 'water';
        case 'painter': return 'color-palette';
        case 'carpenter': return 'hammer';
        case 'home cleaner':
        case 'house cleaner':
        case 'cleaning':
            return 'sparkles';
        case 'ac technician':
        case 'ac repair':
            return 'snow'; // Cooling/AC icon representation
        case 'gardener': return 'leaf';
        case 'mason':
        case 'masonry':
            return 'construct';
        case 'pest control': return 'bug';
        case 'welder': return 'flame';
        case 'interior design': return 'color-filter'; // Color/design icon
        default: return 'build';
    }
};

const getToolIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('power tool')) return 'hammer';
    if (lowercaseName.includes('ladder')) return 'reorder-four';
    if (lowercaseName.includes('paint')) return 'brush';
    if (lowercaseName.includes('plumb')) return 'water';
    if (lowercaseName.includes('clean')) return 'sparkles';
    if (lowercaseName.includes('safety')) return 'shield-checkmark';
    if (lowercaseName.includes('garden')) return 'leaf';
    if (lowercaseName.includes('scaffold')) return 'grid';
    if (lowercaseName.includes('construct')) return 'construct';
    if (lowercaseName.includes('hand tool')) return 'build';
    return 'hammer';
};

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'Services' | 'Tools'>('Services');
    const [hasUnread, setHasUnread] = useState(false);
    const [nearbyProviders, setNearbyProviders] = useState<any[]>([]);
    const [nearbyTools, setNearbyTools] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dbServices, setDbServices] = useState<any[]>([]);
    const [dbRentals, setDbRentals] = useState<any[]>([]);

    // Fetch dynamic categories
    useEffect(() => {
        authApi.getCategories()
            .then(res => {
                if (res) {
                    if (res.services) setDbServices(res.services);
                    if (res.rentals) setDbRentals(res.rentals);
                }
            })
            .catch(err => console.error('Error fetching categories from backend:', err));
    }, []);

    // Fetch nearby providers based on user's default address
    useEffect(() => {
        if (user?.addresses) {
            const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
            if (defaultAddr) {
                setLoading(true);
                Promise.all([
                    authApi.getNearbyProviders(defaultAddr.latitude, defaultAddr.longitude)
                        .then(setNearbyProviders)
                        .catch((err: any) => console.error('Error fetching nearby providers:', err)),
                    rentalsApi.getNearbyTools(defaultAddr.latitude, defaultAddr.longitude)
                        .then(setNearbyTools)
                        .catch((err: any) => console.error('Error fetching nearby tools:', err))
                ]).finally(() => setLoading(false));
            }
        }
    }, [user]);

    // Fetch unread notification count when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            const fetchUnreadCount = async () => {
                if (user?.id) {
                    try {
                        const notifications = await authApi.getNotifications(user.id);
                        setHasUnread(notifications.some((n: any) => !n.isRead));
                    } catch (error) {
                        console.error('Error fetching notifications:', error);
                    }
                }
            };
            fetchUnreadCount();
        }, [user?.id])
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.userInfo}
                onPress={() => navigation.navigate('Profile')}
            >
                {user?.profileImage ? (
                    <Image
                        source={{ uri: user.profileImage }}
                        style={styles.avatar}
                    />
                ) : (
                    <Image source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=random` }} style={styles.avatar} />
                )}
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingText}>Good Morning,</Text>
                    <Text style={styles.userName}>{user?.fullName || 'Guest'}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notification')}
            >
                <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
                {hasUnread && <View style={styles.notificationDot} />}
            </TouchableOpacity>
        </View>
    );

    const renderToggle = () => (
        <View style={styles.toggleContainer}>
            <TouchableOpacity
                style={[styles.toggleButton, activeTab === 'Services' && styles.activeToggle]}
                onPress={() => setActiveTab('Services')}
            >
                <Text style={[styles.toggleText, activeTab === 'Services' && styles.activeToggleText]}>Services</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.toggleButton, activeTab === 'Tools' && styles.activeToggle]}
                onPress={() => setActiveTab('Tools')}
            >
                <Text style={[styles.toggleText, activeTab === 'Tools' && styles.activeToggleText]}>Tools</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
            <TextInput
                placeholder={activeTab === 'Services' ? "Search for electricians, plumbers..." : "Search for drills, saws, ladders..."}
                placeholderTextColor={COLORS.gray}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={COLORS.gray} />
                </TouchableOpacity>
            )}
        </View>
    );

    const renderToolsContent = () => {
        const defaultTools = [
            { name: 'Power Tools', icon: 'hammer' },
            { name: 'Ladders', icon: 'reorder-four' },
            { name: 'Painting', icon: 'brush' },
            { name: 'Plumbing', icon: 'water' },
            { name: 'Cleaning', icon: 'sparkles' },
            { name: 'Safety Gear', icon: 'shield-checkmark' },
            { name: 'Gardening', icon: 'leaf' },
            { name: 'Scaffolding', icon: 'grid' },
        ];

        const toolCategories = dbRentals.length > 0
            ? dbRentals.map((r, idx) => ({ id: idx + 1, name: r.name, icon: getToolIcon(r.name) }))
            : defaultTools.map((t, idx) => ({ id: idx + 1, ...t }));

        const filteredToolCategories = toolCategories.filter(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const filteredTools = nearbyTools.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return (
            <>
                <Text style={styles.sectionTitle}>Featured Equipment</Text>
                <View style={[styles.featuredCard, { height: 150, marginTop: 12 }]}>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} style={styles.featuredImageBackground} resizeMode="cover" />
                    <View style={styles.featuredOverlay} />
                    <View style={styles.featuredContent}>
                        <View style={[styles.dealTag, { backgroundColor: '#10B981' }]}>
                            <Text style={[styles.dealTagText, { color: COLORS.white }]}>PREMIUM QUALITY</Text>
                        </View>
                        <Text style={styles.featuredTitle}>DeWalt Impact Drills</Text>
                        <Text style={styles.featuredDesc}>Professional grade tools available for daily rent.</Text>
                        <TouchableOpacity
                            style={styles.rentNowButton}
                            onPress={() => navigation.navigate('ToolCategory', { categoryName: 'Power Tools' })}
                        >
                            <Text style={styles.rentNowText}>Rent Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Tool Categories</Text>
                </View>

                <View style={styles.serviceGrid}>
                    {filteredToolCategories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.serviceItem}
                            onPress={() => navigation.navigate('ToolCategory', { categoryName: cat.name })}
                        >
                            <View style={styles.serviceIconBox}>
                                <Ionicons name={cat.icon as any} size={28} color={COLORS.primary} />
                            </View>
                            <Text style={styles.serviceText}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                    {filteredToolCategories.length === 0 && (
                        <Text style={styles.emptyText}>No tool categories match your search.</Text>
                    )}
                </View>

                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Top Rated Tools Near You</Text>
                    <TouchableOpacity onPress={() => {
                        if (user?.addresses) {
                            const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
                            if (defaultAddr) {
                                navigation.navigate('ToolMap', {
                                    tools: filteredTools,
                                    initialRegion: {
                                        latitude: defaultAddr.latitude,
                                        longitude: defaultAddr.longitude,
                                        latitudeDelta: 0.05,
                                        longitudeDelta: 0.05,
                                    }
                                });
                            }
                        }
                    }}>
                        <Text style={styles.viewAllText}>View Map</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.suggestionsContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.orange} style={{ marginVertical: 20 }} />
                    ) : (
                        filteredTools.slice(0, 5).map((tool) => (
                            <TouchableOpacity
                                key={tool.id}
                                style={styles.proCard}
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('ToolDetails', { tool })}
                            >
                                <View style={[styles.proImage, { backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }]}>
                                    {tool.images && tool.images.length > 0 ? (
                                        <Image
                                            source={{ uri: tool.images[0] }}
                                            style={{ width: '100%', height: '100%', borderRadius: 30 }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Ionicons name="hammer-outline" size={24} color={COLORS.gray} />
                                    )}
                                </View>
                                <View style={styles.proInfo}>
                                    <View style={styles.proHeader}>
                                        <Text style={styles.proName} numberOfLines={1}>{tool.name}</Text>
                                    </View>
                                    <Text style={styles.proRole}>{tool.category} • LKR {tool.dailyRate}/day</Text>
                                    <View style={styles.proStats}>
                                        <View style={styles.proStatItem}>
                                            <Ionicons name="star" size={14} color={COLORS.orange} />
                                            <Text style={styles.proStatText}>{tool.rating && tool.rating > 0 ? Number(tool.rating).toFixed(1) : 'New'}</Text>
                                        </View>
                                        <View style={styles.proDivider} />
                                        <View style={styles.proStatItem}>
                                            <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                                            <Text style={styles.proStatText}>{tool.distance} km</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('ToolDetails', { tool })}>
                                    <Text style={styles.bookBtnText}>Rent</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}
                    {!loading && filteredTools.length === 0 && (
                        <Text style={styles.emptyText}>No tools match your search.</Text>
                    )}
                </View>
            </>
        );
    };

    const renderServicesContent = () => {
        const defaultServices = [
            { name: 'Electrician', icon: 'flash' },
            { name: 'Plumber', icon: 'water' },
            { name: 'Painter', icon: 'color-palette' },
            { name: 'Carpenter', icon: 'hammer' },
            { name: 'Home Cleaner', icon: 'sparkles' },
            { name: 'AC Technician', icon: 'thermometer' },
            { name: 'Gardener', icon: 'leaf' },
            { name: 'Mason', icon: 'construct' },
        ];

        const serviceCategories = dbServices.length > 0 
            ? dbServices.map((s, idx) => ({ id: idx + 1, name: s.name, icon: getServiceIcon(s.name) }))
            : defaultServices.map((s, idx) => ({ id: idx + 1, ...s }));

        const filteredServiceCategories = serviceCategories.filter(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const filteredProviders = nearbyProviders.filter(p =>
            p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.skills && p.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())))
        );

        return (
            <>
                <Text style={styles.sectionTitle}>Featured Deals</Text>
                <View style={[styles.featuredCard, { height: 150, marginTop: 12 }]}>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} style={styles.featuredImageBackground} resizeMode="cover" />
                    <View style={styles.featuredOverlay} />
                    <View style={styles.featuredContent}>
                        <View style={styles.dealTag}>
                            <Text style={styles.dealTagText}>SPECIAL OFFER</Text>
                        </View>
                        <Text style={styles.featuredTitle}>Home Cleaning Service</Text>
                        <Text style={styles.featuredDesc}>Book now and get 15% off on your first service!</Text>
                        <TouchableOpacity style={styles.rentNowButton}>
                            <Text style={styles.rentNowText}>Book Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                </View>

                <View style={styles.serviceGrid}>
                    {filteredServiceCategories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.serviceItem}
                            onPress={() => navigation.navigate('ServiceCategory', { categoryName: cat.name })}
                        >
                            <View style={styles.serviceIconBox}>
                                <Ionicons name={cat.icon as any} size={28} color={COLORS.darkBlue} />
                            </View>
                            <Text style={styles.serviceText}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                    {filteredServiceCategories.length === 0 && (
                        <Text style={styles.emptyText}>No categories match your search.</Text>
                    )}
                </View>

                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Top Rated Pros Near You</Text>
                    <TouchableOpacity onPress={() => {
                        if (user?.addresses) {
                            const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
                            if (defaultAddr) {
                                navigation.navigate('ServiceProviderMap', {
                                    providers: filteredProviders,
                                    initialRegion: {
                                        latitude: defaultAddr.latitude,
                                        longitude: defaultAddr.longitude,
                                        latitudeDelta: 0.05,
                                        longitudeDelta: 0.05,
                                    }
                                });
                            }
                        }
                    }}>
                        <Text style={styles.viewAllText}>View Map</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.suggestionsContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.orange} style={{ marginVertical: 20 }} />
                    ) : (
                        filteredProviders.slice(0, 5).map((person) => (
                            <TouchableOpacity
                                key={person.id}
                                style={styles.proCard}
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('ProviderProfile', {
                                    providerId: person.id,
                                    providerName: person.fullName,
                                    providerImage: person.profileImage,
                                    providerRating: person.rating,
                                })}
                            >
                                <Image
                                    source={{ uri: person.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.fullName || 'Provider')}&background=random` }}
                                    style={styles.proImage}
                                />
                                <View style={styles.proInfo}>
                                    <View style={styles.proHeader}>
                                        <Text style={styles.proName}>{person.fullName}</Text>
                                        <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />
                                    </View>
                                    <Text style={styles.proRole}>{person.category} • {person.yearsOfExperience}y Exp</Text>
                                    <View style={styles.proStats}>
                                        <View style={styles.proStatItem}>
                                            <Ionicons name="star" size={14} color={COLORS.orange} />
                                            <Text style={styles.proStatText}>{person.rating && person.rating > 0 ? Number(person.rating).toFixed(1) : 'New'}</Text>
                                        </View>
                                        <View style={styles.proDivider} />
                                        <View style={styles.proStatItem}>
                                            <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                                            <Text style={styles.proStatText}>{person.distance} km</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.bookBtn}>
                                    <Text style={styles.bookBtnText}>Book</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}
                    {!loading && filteredProviders.length === 0 && (
                        <Text style={styles.emptyText}>No professionals match your search.</Text>
                    )}
                </View>
            </>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {renderHeader()}
                {renderToggle()}
                {renderSearchBar()}
                {activeTab === 'Services' ? renderServicesContent() : renderToolsContent()}
                <View style={{ height: 100 }} />
            </ScrollView>
            <BottomNavBar />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
    greetingContainer: { justifyContent: 'center' },
    greetingText: { fontSize: 13, color: COLORS.gray },
    userName: { fontSize: 17, fontWeight: 'bold', color: COLORS.black },
    notificationButton: { padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6' },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 20 },
    toggleButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeToggle: { backgroundColor: COLORS.darkBlue },
    toggleText: { fontSize: 15, color: COLORS.gray, fontWeight: '600' },
    activeToggleText: { color: COLORS.white },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 50, marginBottom: 24, elevation: 2 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 14, color: COLORS.black },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
    featuredCard: { height: 160, borderRadius: 16, overflow: 'hidden', marginBottom: 24, position: 'relative' },
    featuredImageBackground: { ...StyleSheet.absoluteFillObject },
    featuredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20, 33, 61, 0.6)' },
    featuredContent: { padding: 20, justifyContent: 'center', height: '100%' },
    dealTag: { backgroundColor: COLORS.orange, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
    dealTagText: { color: COLORS.darkBlue, fontSize: 10, fontWeight: 'bold' },
    featuredTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
    featuredDesc: { fontSize: 12, color: '#E0E0E0', marginBottom: 12, maxWidth: '80%' },
    rentNowButton: { backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
    rentNowText: { color: COLORS.darkBlue, fontWeight: 'bold', fontSize: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    viewAllText: { fontSize: 14, color: COLORS.orange, fontWeight: '600' },
    serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    serviceItem: { width: '23%', alignItems: 'center', marginBottom: 16 },
    serviceIconBox: { width: 55, height: 55, borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    serviceText: { fontSize: 10, color: COLORS.black, textAlign: 'center' },
    suggestionsContainer: { gap: 12 },
    proCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: '#F3F4F6', elevation: 1 },
    proImage: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
    proInfo: { flex: 1 },
    proHeader: { flexDirection: 'row', alignItems: 'center' },
    proName: { fontSize: 15, fontWeight: 'bold', color: COLORS.black },
    proRole: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    proStats: { flexDirection: 'row', alignItems: 'center' },
    proStatItem: { flexDirection: 'row', alignItems: 'center' },
    proStatText: { fontSize: 11, color: '#4B5563', marginLeft: 4, fontWeight: '500' },
    proDivider: { width: 1, height: 10, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
    bookBtn: { backgroundColor: COLORS.darkBlue, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    bookBtnText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: COLORS.gray, marginTop: 20 },
    placeholderText: { color: COLORS.gray, fontStyle: 'italic' },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.orange,
        borderWidth: 1,
        borderColor: COLORS.white,
    },
});

export default HomeScreen;
