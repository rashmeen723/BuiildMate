import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user } = useAuth();

    // Get user data from route params if available
    // In a real app, this would be stored in Context/Redux upon login
    // const route = useRoute<HomeScreenRouteProp>();
    // const { user } = route.params || {}; 

    const [activeTab, setActiveTab] = useState<'Services' | 'Tools'>('Tools');

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.userInfo}>
                {user?.profileImage ? (
                    <Image
                        source={{ uri: user.profileImage }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: COLORS.orange, justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold' }}>
                            {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'K'}
                        </Text>
                    </View>
                )}
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingText}>Good Morning,</Text>
                    <Text style={styles.userName}>Hello, {user?.fullName || 'Kavindya'}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notification')}
            >
                <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
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
                placeholder="Search for drills, saws, ladders..."
                placeholderTextColor={COLORS.gray}
                style={styles.searchInput}
            />
        </View>
    );

    const renderToolsContent = () => {
        const categories = [
            { id: 1, name: 'Power', icon: 'flash' },
            { id: 2, name: 'Hand', icon: 'hammer' },
            { id: 3, name: 'Heavy', icon: 'home' },
            { id: 4, name: 'More', icon: 'grid' },
        ];

        const featuredDeal = {
            title: 'Industrial Drill',
            description: 'Professional grade tools at 20% lower rental rates.',
            image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        };

        const nearbyItems = [
            { id: 1, name: 'DeWalt Impact Drill', rating: 4.9, price: 'LKR 500/d', image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
            { id: 2, name: 'Circular Power Saw', rating: 4.8, price: 'LKR 800/d', image: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        ];

        return (
            <>
                <Text style={styles.sectionTitle}>Featured Deals</Text>
                <View style={styles.featuredCard}>
                    <Image source={{ uri: featuredDeal.image }} style={styles.featuredImageBackground} resizeMode="cover" />
                    <View style={styles.featuredOverlay} />
                    <View style={styles.featuredContent}>
                        <View style={styles.dealTag}>
                            <Text style={styles.dealTagText}>LIMITED OFFER</Text>
                        </View>
                        <Text style={styles.featuredTitle}>{featuredDeal.title}</Text>
                        <Text style={styles.featuredDesc}>{featuredDeal.description}</Text>
                        <TouchableOpacity style={styles.rentNowButton}>
                            <Text style={styles.rentNowText}>Rent Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                </View>

                <View style={styles.categoriesContainer}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.categoryItem}
                            onPress={() => navigation.navigate('ToolCategory', { categoryName: cat.name })}
                        >
                            <View style={styles.categoryIconBox}>
                                <Ionicons name={cat.icon as any} size={28} color={COLORS.darkBlue} />
                            </View>
                            <Text style={styles.categoryText}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Available Nearby</Text>
                    <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
                </View>

                <View style={styles.nearbyContainer}>
                    {nearbyItems.map((item) => (
                        <View key={item.id} style={styles.itemCard}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
                            <Text style={styles.itemTitle}>{item.name}</Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color={COLORS.orange} />
                                <Text style={styles.ratingText}>{item.rating}</Text>
                            </View>
                            <View style={styles.itemFooter}>
                                <View style={styles.priceTag}>
                                    <Text style={styles.priceText}>{item.price}</Text>
                                </View>
                                <TouchableOpacity style={styles.addButton}>
                                    <Ionicons name="add" size={20} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </>
        );
    };

    const renderServicesContent = () => {
        const serviceCategories = [
            { id: 1, name: 'Electrician', icon: 'flash' },
            { id: 2, name: 'Plumber', icon: 'water' },
            { id: 3, name: 'Painter', icon: 'color-palette' },
            { id: 4, name: 'Carpentry', icon: 'hammer' },
            { id: 5, name: 'Cleaning', icon: 'sparkles' },
            { id: 6, name: 'AC Repair', icon: 'thermometer' },
            { id: 7, name: 'Pest Control', icon: 'bug' },
            { id: 8, name: 'Other', icon: 'settings' },
        ];

        const suggestions = [
            { id: 1, name: 'Nimal Priyankara', role: 'Master Electrician', verified: true, jobs: 145, distance: '4.5 Km', rating: 4.9, image: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { id: 2, name: 'Sumesh Kalhara', role: 'Interior Painter', verified: false, jobs: 42, distance: '2.1 Km', rating: 4.8, image: 'https://randomuser.me/api/portraits/men/45.jpg' },
            { id: 3, name: 'Kamal Perera', role: 'Plumber', verified: true, jobs: 89, distance: '3.0 Km', rating: 4.7, image: 'https://randomuser.me/api/portraits/men/12.jpg' },
        ];

        return (
            <>
                <Text style={styles.sectionTitle}>Featured Deals</Text>
                <View style={styles.featuredCard}>
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
                    {serviceCategories.map((cat) => (
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
                </View>

                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Top Rated Pros</Text>
                    <TouchableOpacity><Text style={styles.viewAllText}>View Map</Text></TouchableOpacity>
                </View>

                <View style={styles.suggestionsContainer}>
                    {suggestions.map((person) => (
                        <TouchableOpacity key={person.id} style={styles.proCard} activeOpacity={0.9}>
                            <Image source={{ uri: person.image }} style={styles.proImage} />
                            <View style={styles.proInfo}>
                                <View style={styles.proHeader}>
                                    <Text style={styles.proName}>{person.name}</Text>
                                    {person.verified && <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />}
                                </View>
                                <Text style={styles.proRole}>{person.role}</Text>
                                <View style={styles.proStats}>
                                    <View style={styles.proStatItem}>
                                        <Ionicons name="star" size={14} color={COLORS.orange} />
                                        <Text style={styles.proStatText}>{person.rating}</Text>
                                    </View>
                                    <View style={styles.proDivider} />
                                    <View style={styles.proStatItem}>
                                        <Ionicons name="briefcase-outline" size={14} color={COLORS.gray} />
                                        <Text style={styles.proStatText}>{person.jobs} Jobs</Text>
                                    </View>
                                    <View style={styles.proDivider} />
                                    <View style={styles.proStatItem}>
                                        <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                                        <Text style={styles.proStatText}>{person.distance}</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.bookBtn}>
                                <Text style={styles.bookBtnText}>Book</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
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
                {activeTab === 'Tools' ? renderToolsContent() : renderServicesContent()}
                <View style={{ height: 100 }} />
            </ScrollView>

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
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    greetingContainer: {
        justifyContent: 'center',
    },
    greetingText: {
        fontSize: 14,
        color: COLORS.gray,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    notificationButton: {
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeToggle: {
        backgroundColor: COLORS.darkBlue,
    },
    toggleText: {
        fontSize: 16,
        color: COLORS.gray,
        fontWeight: '600',
    },
    activeToggleText: {
        color: COLORS.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.black,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
    },
    categoriesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    categoryItem: {
        alignItems: 'center',
        width: '22%',
    },
    categoryIconBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 12,
        color: COLORS.black,
        fontWeight: '500',
    },
    featuredCard: {
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        position: 'relative',
        backgroundColor: COLORS.darkBlue, // Fallback
    },
    featuredImageBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    featuredOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(20, 33, 61, 0.7)', // Overlay to make text pop
    },
    featuredContent: {
        padding: 20,
        justifyContent: 'center',
        height: '100%',
    },
    dealTag: {
        backgroundColor: COLORS.orange,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    dealTagText: {
        color: COLORS.darkBlue,
        fontSize: 10,
        fontWeight: 'bold',
    },
    featuredTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
    },
    featuredDesc: {
        fontSize: 12,
        color: '#E0E0E0',
        marginBottom: 16,
        maxWidth: '70%',
    },
    rentNowButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    rentNowText: {
        color: COLORS.darkBlue,
        fontWeight: 'bold',
        fontSize: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        color: COLORS.gray,
    },
    nearbyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    itemImage: {
        width: '100%',
        height: 100,
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.black,
        marginLeft: 4,
        fontWeight: 'bold',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceTag: {
        backgroundColor: COLORS.orange,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    priceText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    addButton: {
        backgroundColor: COLORS.darkBlue,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Services Styles
    serviceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    serviceItem: {
        width: '23%',
        alignItems: 'center',
        marginBottom: 16,
    },
    serviceIconBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceText: {
        fontSize: 11,
        color: COLORS.black,
        textAlign: 'center',
    },
    suggestionsContainer: {
        gap: 16,
    },
    personCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        backgroundColor: COLORS.white,
    },
    personImage: {
        width: 60,
        height: 80, // slightly rectangular portrait
        borderRadius: 8,
        marginRight: 12,
    },
    personInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    personHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    personName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    personRole: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 2,
    },
    distanceText: {
        color: COLORS.gray,
    },
    personActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    viewProfileBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLORS.orange,
        borderRadius: 6,
    },
    viewProfileText: {
        fontSize: 12,
        color: COLORS.orange,
        fontWeight: '600',
    },
    bookNowSmallBtn: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    bookNowSmallText: {
        fontSize: 12,
        color: COLORS.white,
        fontWeight: '600',
    },
    // Service Chips
    chipScroll: {
        marginBottom: 8,
    },
    chipContainer: {
        paddingRight: 20,
    },
    chipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipText: {
        fontSize: 14,
        color: COLORS.darkBlue,
        fontWeight: '600',
    },
    // New Pro Card Styles
    proCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    proImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 16,
    },
    proInfo: {
        flex: 1,
    },
    proHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    proName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    proRole: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 8,
    },
    proStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    proStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    proStatText: {
        fontSize: 12,
        color: '#4B5563',
        marginLeft: 4,
        fontWeight: '500',
    },
    proDivider: {
        width: 1,
        height: 12,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    bookBtn: {
        backgroundColor: COLORS.darkBlue,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    bookBtnText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
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
        borderTopColor: COLORS.lightGray,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        marginTop: 4,
        color: COLORS.gray,
    },
});

export default HomeScreen;
