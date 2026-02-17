import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';

type ProviderProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProviderProfile'>;
type ProviderProfileScreenRouteProp = RouteProp<RootStackParamList, 'ProviderProfile'>;

const ProviderProfileScreen = () => {
    const navigation = useNavigation<ProviderProfileScreenNavigationProp>();
    const route = useRoute<ProviderProfileScreenRouteProp>();

    // Mock data - would come from route params or API
    const provider = {
        name: 'John Perera',
        role: 'Electrician',
        rating: 4.8,
        reviews: 120,
        phone: '+9477-7863456',
        email: 'johnperera@gmail.com',
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        experience: '8+ years',
        skills: ['Wiring', 'Lighting', 'Repairs'],
    };

    const [selectedMonth, setSelectedMonth] = useState('Nov');
    const [selectedDay, setSelectedDay] = useState(21);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const calendarDays = [
        { day: 20, date: 'Sun' },
        { day: 21, date: 'Mon' },
        { day: 22, date: 'Tue' },
        { day: 23, date: 'Wed' },
        { day: 24, date: 'Thu' },
        { day: 25, date: 'Fri' },
        { day: 26, date: 'Sat' },
    ];

    const availableTimes = [
        { time: '9 - 10 am', status: 'available' },
        { time: '10 - 11 am', status: 'available' },
        { time: '11 - 12 am', status: 'available' },
        { time: '12 - 1 pm', status: 'limited' },
        { time: '1 - 2 pm', status: 'not available' },
        { time: '2 - 3 pm', status: 'not available' },
        { time: '3 - 4 pm', status: 'available' },
        { time: '4 - 5 pm', status: 'available' },
    ];

    const reviews = [
        { id: 1, name: 'John S.', rating: 5, comment: 'Great service — arrived on time...', date: 'Nov 10, 2025' },
        { id: 2, name: 'Ayesha P.', rating: 4, comment: 'Good work, fair pricing..', date: 'Nov 8, 2025' },
    ];

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= Math.floor(rating) ? 'star' : i - rating < 1 ? 'star-half' : 'star-outline'}
                    size={16}
                    color={COLORS.orange}
                />
            );
        }
        return stars;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return '#10B981';
            case 'limited':
                return COLORS.orange;
            case 'not available':
                return '#EF4444';
            default:
                return COLORS.gray;
        }
    };

    const handleBooking = () => {
        navigation.navigate('BookService', {
            providerId: 1,
            providerName: provider.name,
            providerImage: provider.image,
            providerRating: provider.rating,
            providerReviews: provider.reviews,
            providerPhone: provider.phone,
            providerEmail: provider.email,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{provider.role} Profile</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Provider Info Card */}
                <View style={styles.profileCard}>
                    <Image source={{ uri: provider.image }} style={styles.profileImage} />
                    <Text style={styles.providerName}>{provider.name}</Text>

                    <View style={styles.ratingRow}>
                        <Text style={styles.ratingValue}>{provider.rating}</Text>
                        <View style={styles.starsContainer}>{renderStars(provider.rating)}</View>
                        <Text style={styles.reviewCount}>({provider.reviews} reviews)</Text>
                    </View>

                    <View style={styles.contactRow}>
                        <Ionicons name="call-outline" size={16} color={COLORS.gray} />
                        <Text style={styles.contactText}>{provider.phone}</Text>
                    </View>

                    <View style={styles.contactRow}>
                        <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
                        <Text style={styles.contactText}>{provider.email}</Text>
                    </View>

                    <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
                        <Text style={styles.bookButtonText}>Book This {provider.role}</Text>
                    </TouchableOpacity>
                </View>

                {/* Experience */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Experience :</Text>
                    <View style={styles.experienceBadge}>
                        <Text style={styles.experienceText}>{provider.experience}</Text>
                    </View>
                </View>

                {/* Skills */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Skills :</Text>
                    <View style={styles.skillsContainer}>
                        {provider.skills.map((skill, index) => (
                            <View key={index} style={styles.skillBadge}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Availability Calendar */}
                <Text style={styles.sectionTitle}>Availability :</Text>
                <View style={styles.calendarCard}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity>
                            <Ionicons name="chevron-back" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.monthText}>{'< Nov >'}</Text>
                        <TouchableOpacity>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekDaysRow}>
                        {weekDays.map((day, index) => (
                            <Text key={index} style={styles.weekDayText}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.datesRow}>
                        {calendarDays.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dateItem,
                                    selectedDay === item.day && styles.selectedDateItem
                                ]}
                                onPress={() => setSelectedDay(item.day)}
                            >
                                <Text style={[
                                    styles.dateText,
                                    selectedDay === item.day && styles.selectedDateText
                                ]}>{item.day}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Available Times */}
                <Text style={styles.sectionTitle}>Available Times :</Text>
                <View style={styles.timesCard}>
                    {availableTimes.map((slot, index) => (
                        <View key={index} style={styles.timeSlot}>
                            <Text style={styles.timeText}>{slot.time}</Text>
                            <View style={styles.statusContainer}>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(slot.status) }]} />
                                <Text style={[styles.statusText, { color: getStatusColor(slot.status) }]}>
                                    {slot.status}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Reviews */}
                <Text style={styles.sectionTitle}>Reviews :</Text>
                {reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.reviewerInfo}>
                                <View style={styles.reviewerAvatar}>
                                    <Ionicons name="person" size={20} color={COLORS.gray} />
                                </View>
                                <Text style={styles.reviewerName}>{review.name}</Text>
                            </View>
                            <View style={styles.reviewStars}>{renderStars(review.rating)}</View>
                        </View>
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                        <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Navigation */}
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
    notificationButton: {
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    profileCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 16,
        marginBottom: 16,
    },
    providerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginRight: 6,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 6,
    },
    reviewCount: {
        fontSize: 14,
        color: COLORS.gray,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    contactText: {
        fontSize: 14,
        color: COLORS.gray,
        marginLeft: 8,
    },
    bookButton: {
        backgroundColor: COLORS.darkBlue,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
        marginTop: 16,
    },
    bookButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginRight: 12,
    },
    experienceBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    experienceText: {
        fontSize: 14,
        color: '#D97706',
        fontWeight: '600',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    skillText: {
        fontSize: 14,
        color: '#D97706',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 12,
    },
    calendarCard: {
        backgroundColor: COLORS.darkBlue,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    weekDaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    weekDayText: {
        fontSize: 12,
        color: COLORS.white,
        opacity: 0.7,
        width: 40,
        textAlign: 'center',
    },
    datesRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    dateItem: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedDateItem: {
        backgroundColor: COLORS.orange,
    },
    dateText: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: '600',
    },
    selectedDateText: {
        color: COLORS.darkBlue,
    },
    timesCard: {
        backgroundColor: '#FFFBEB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    timeSlot: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FEF3C7',
    },
    timeText: {
        fontSize: 14,
        color: COLORS.black,
        fontWeight: '500',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    reviewCard: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
    },
    reviewStars: {
        flexDirection: 'row',
    },
    reviewComment: {
        fontSize: 14,
        color: COLORS.black,
        marginBottom: 8,
        lineHeight: 20,
    },
    reviewDate: {
        fontSize: 12,
        color: COLORS.gray,
        textAlign: 'right',
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

export default ProviderProfileScreen;
