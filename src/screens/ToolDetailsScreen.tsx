import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';

type ToolDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToolDetails'>;
type ToolDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ToolDetails'>;

const { width } = Dimensions.get('window');

const ToolDetailsScreen = () => {
    const navigation = useNavigation<ToolDetailsScreenNavigationProp>();
    const route = useRoute<ToolDetailsScreenRouteProp>();
    const { tool } = route.params || {};

    // Mock data if tool is not passed
    const currentTool = tool || {
        name: '10mm Cordless Drill Machine',
        price: '800',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        reviews: 42,
        owner: 'Nuwan Fenando',
        ownerImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        specs: {
            voltage: '18V',
            weight: '3.4 lbs',
            chuckSize: '1/2"'
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tool details</Text>
            <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
            </TouchableOpacity>
        </View>
    );

    const renderSpecs = () => (
        <View style={styles.specsContainer}>
            <Text style={styles.sectionTitle}>Tool Specifications</Text>
            <View style={styles.specsRow}>
                <View style={styles.specCard}>
                    <Ionicons name="flash" size={24} color={COLORS.darkBlue} />
                    <Text style={styles.specLabel}>VOLTAGE</Text>
                    <Text style={styles.specValue}>{currentTool.specs?.voltage || '18V'}</Text>
                </View>
                <View style={styles.specCard}>
                    <Ionicons name="barbell" size={24} color={COLORS.darkBlue} />
                    <Text style={styles.specLabel}>WEIGHT</Text>
                    <Text style={styles.specValue}>{currentTool.specs?.weight || '3.4 lbs'}</Text>
                </View>
                <View style={styles.specCard}>
                    <Ionicons name="resize" size={24} color={COLORS.darkBlue} />
                    <Text style={styles.specLabel}>CHUCK SIZE</Text>
                    <Text style={styles.specValue}>{currentTool.specs?.chuckSize || '1/2"'}</Text>
                </View>
            </View>
        </View>
    );

    const renderAvailability = () => (
        <View style={styles.availabilityContainer}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.calendarCard}>
                <View style={styles.calendarHeader}>
                    <Ionicons name="chevron-back" size={20} color={COLORS.white} />
                    <Text style={styles.calendarMonth}>Nov</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                </View>
                <View style={styles.calendarDays}>
                    <View style={styles.dayItem}>
                        <Text style={styles.dayName}>sun</Text>
                        <Text style={styles.dayNumber}>20</Text>
                    </View>
                    <View style={[styles.dayItem, styles.selectedDay]}>
                        <Text style={[styles.dayName, styles.selectedDayText]}>Mon</Text>
                        <Text style={[styles.dayNumber, styles.selectedDayText]}>21</Text>
                    </View>
                    <View style={styles.dayItem}>
                        <Text style={styles.dayName}>Tue</Text>
                        <Text style={styles.dayNumber}>22</Text>
                    </View>
                    <View style={styles.dayItem}>
                        <Text style={styles.dayName}>Wed</Text>
                        <Text style={styles.dayNumber}>23</Text>
                    </View>
                    <View style={styles.dayItem}>
                        <Text style={styles.dayName}>Thu</Text>
                        <Text style={styles.dayNumber}>24</Text>
                    </View>
                    <View style={styles.dayItem}>
                        <Text style={styles.dayName}>Fri</Text>
                        <Text style={styles.dayNumber}>25</Text>
                    </View>
                    <View style={styles.dayItem}>
                        <Text style={styles.dayName}>Sat</Text>
                        <Text style={styles.dayNumber}>26</Text>
                    </View>
                </View>
            </View>
            <View style={styles.statusTag}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>AVAILABLE</Text>
            </View>
        </View>
    );

    const renderOwner = () => (
        <View style={styles.ownerContainer}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <View style={styles.ownerCard}>
                <Image source={{ uri: currentTool.ownerImage }} style={styles.ownerImage} />
                <View style={styles.ownerInfo}>
                    <Text style={styles.ownerName}>{currentTool.owner}</Text>
                    <Text style={styles.ownerPhone}>+9477-7863458</Text>
                </View>
                <View style={styles.ownerRating}>
                    <Ionicons name="star" size={14} color={COLORS.orange} />
                    <Text style={styles.ratingText}>5.0 ({currentTool.reviews} rentals)</Text>
                </View>
            </View>
        </View>
    );

    const renderReviews = () => (
        <View style={styles.reviewsContainer}>
            <View style={styles.reviewHeader}>
                <Text style={styles.sectionTitle}>Reviews :</Text>
                <Text style={styles.overallRating}>4.8</Text>
            </View>

            {/* Simple Bar Chart Mock */}
            <View style={styles.ratingBars}>
                <View style={styles.barRow}>
                    <Text style={styles.starLabel}>5</Text>
                    <View style={[styles.barTrack, { width: '80%', backgroundColor: COLORS.orange }]} />
                </View>
                <View style={styles.barRow}>
                    <Text style={styles.starLabel}>4</Text>
                    <View style={[styles.barTrack, { width: '20%', backgroundColor: COLORS.orange }]} />
                </View>
                <View style={styles.barRow}>
                    <Text style={styles.starLabel}>3</Text>
                    <View style={[styles.barTrack, { width: '5%', backgroundColor: COLORS.orange }]} />
                </View>
            </View>

            {/* Review Items */}
            <View style={styles.reviewItem}>
                <View style={styles.reviewUserRow}>
                    <Ionicons name="person-circle-outline" size={24} color={COLORS.gray} />
                    <Text style={styles.reviewUser}>John S.</Text>
                    <Text style={styles.reviewDate}>Nov 10, 2025</Text>
                    <View style={{ flex: 1 }} />
                    <View style={{ flexDirection: 'row' }}>
                        {[1, 2, 3, 4, 5].map(i => <Ionicons key={i} name="star" size={12} color="#D1D5DB" />)}
                    </View>
                </View>
                <View style={styles.commentBox}>
                    <Text style={styles.commentText}>The drill worked perfectly for my deck project. Nuwan was very accommondating and the tools was clean and well - maintained.</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: currentTool.image }} style={styles.heroImage} resizeMode="contain" />
                    <View style={styles.paginationDots}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>

                {/* Title & Rent Button */}
                <Text style={styles.toolTitle}>{currentTool.name}</Text>
                <TouchableOpacity
                    style={styles.rentButton}
                    onPress={() => {
                        const start = route.params?.fromDate ? new Date(route.params.fromDate) : new Date();
                        const end = route.params?.toDate ? new Date(route.params.toDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                        const pricePerDay = parseInt(currentTool.price) || 0;

                        navigation.navigate('RentTool', {
                            tool: currentTool,
                            startDate: start.toDateString(),
                            endDate: end.toDateString(),
                            totalDays: totalDays,
                            totalPrice: totalDays * pricePerDay
                        });
                    }}
                >
                    <Text style={styles.rentButtonText}>Rent this tool</Text>
                </TouchableOpacity>

                {/* Price */}
                <View style={styles.priceRow}>
                    <View style={styles.priceTag}>
                        <Text style={styles.priceText}>LKR {currentTool.price}</Text>
                    </View>
                    <Text style={styles.perDayText}>/per day</Text>
                </View>

                <View style={styles.divider} />

                {renderSpecs()}
                {renderAvailability()}

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                    A compact and easy-to-use cordless drill suitable for everyday drilling and screw-driving tasks. Powered by a rechargeable battery, it offers convenience, portability, and reliable performance for home, DIY, and light professional work. Ideal for drilling into wood, plastic, and metal with precision and control.
                </Text>

                {renderOwner()}
                {renderReviews()}

                <Text style={styles.sectionTitle}>Safety Requirements</Text>
                <View style={styles.safetyContainer}>
                    <View style={styles.safetyItem}>
                        <Ionicons name="eye" size={24} color={COLORS.darkBlue} />
                        <Text style={styles.safetyText}>Eye Protection</Text>
                    </View>
                    <View style={styles.safetyItem}>
                        <Ionicons name="hand-left" size={24} color={COLORS.darkBlue} />
                        <Text style={styles.safetyText}>Work Gloves</Text>
                    </View>
                    <View style={styles.safetyItem}>
                        <Ionicons name="ear" size={24} color={COLORS.darkBlue} />
                        <Text style={styles.safetyText}>Ear Protection</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Navigation Mock */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color={COLORS.secondary} />
                    <Text style={[styles.navText, { color: COLORS.secondary }]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="document-text-outline" size={24} color={COLORS.gray} />
                    <Text style={styles.navText}>Activity</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.gray} />
                    <Text style={styles.navText}>Notification</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person-outline" size={24} color={COLORS.gray} />
                    <Text style={styles.navText}>Account</Text>
                </TouchableOpacity>
            </View>
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
    },
    imageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    heroImage: {
        width: '80%',
        height: '80%',
    },
    paginationDots: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: COLORS.darkBlue,
    },
    toolTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
    },
    rentButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        width: 150,
        marginBottom: 16,
    },
    rentButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    priceTag: {
        backgroundColor: COLORS.orange,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        marginLeft: 4,
    },
    perDayText: {
        marginLeft: 8,
        color: COLORS.gray,
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
        width: '100%',
    },
    specsContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
    },
    specsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    specCard: {
        width: '30%',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    specLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.gray,
        marginTop: 8,
        marginBottom: 4,
    },
    specValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    availabilityContainer: {
        marginBottom: 24,
    },
    calendarCard: {
        backgroundColor: COLORS.darkBlue,
        borderRadius: 16,
        padding: 16,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    calendarMonth: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    calendarDays: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayItem: {
        alignItems: 'center',
        padding: 4,
    },
    dayName: {
        color: COLORS.white,
        fontSize: 10,
        marginBottom: 4,
    },
    dayNumber: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    selectedDay: {
        backgroundColor: COLORS.orange,
        borderRadius: 8,
    },
    selectedDayText: {
        color: COLORS.black,
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    statusText: {
        color: '#10B981',
        fontWeight: 'bold',
        fontSize: 12,
    },
    descriptionText: {
        fontSize: 14,
        color: COLORS.gray,
        lineHeight: 22,
        marginBottom: 24,
    },
    ownerContainer: {
        marginBottom: 24,
    },
    ownerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.black,
        borderRadius: 12,
        padding: 12,
    },
    ownerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    ownerInfo: {
        flex: 1,
    },
    ownerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    ownerPhone: {
        fontSize: 12,
        color: COLORS.gray,
    },
    ownerRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewsContainer: {
        marginBottom: 24,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    overallRating: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    ratingBars: {
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 8,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    starLabel: {
        width: 20,
        fontSize: 12,
        color: COLORS.gray,
    },
    barTrack: {
        height: 8,
        borderRadius: 4,
    },
    reviewItem: {
        marginBottom: 16,
    },
    reviewUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewUser: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        marginLeft: 8,
    },
    reviewDate: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 8,
    },
    commentBox: {
        borderWidth: 1,
        borderColor: COLORS.black,
        borderRadius: 12,
        padding: 12,
    },
    commentText: {
        fontSize: 12,
        color: COLORS.black,
        lineHeight: 18,
    },
    safetyContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    safetyItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    safetyText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        marginLeft: 8,
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

export default ToolDetailsScreen;
