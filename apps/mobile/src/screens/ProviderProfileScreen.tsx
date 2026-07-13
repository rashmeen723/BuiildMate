import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import { authApi } from '../services/api';
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

    const {
        providerId,
        providerName: initialName,
        providerImage: initialImage,
        providerRating: initialRating,
        role: initialRole
    } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [provider, setProvider] = useState<any>({
        name: initialName || 'Professional',
        role: initialRole || 'Service Provider',
        rating: initialRating || 5.0,
        reviews: 0,
        phone: '',
        email: '',
        image: initialImage || 'https://via.placeholder.com/150',
        experience: '0 years',
        skills: [],
        certificates: [],
        trustScore: 5.0,
    });

    useEffect(() => {
        const fetchDetails = async () => {
            if (!providerId) {
                setLoading(false);
                return;
            }
            try {
                const data = await authApi.getProviderDetails(providerId);
                setProvider({
                    name: data.fullName,
                    role: initialRole || data.category,
                    rating: data.rating || 5.0,
                    reviews: data.reviews || 120,
                    phone: data.phone,
                    email: data.email,
                    image: data.profileImage || 'https://via.placeholder.com/150',
                    experience: `${data.yearsOfExperience}+ years`,
                    skills: data.skills || [],
                    badges: data.badges || [],
                    certificates: data.certificates || [],
                    trustScore: data.trustScore || 5.0,
                });
            } catch (error) {
                console.error('Error fetching provider details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [providerId]);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [displayedMonth, setDisplayedMonth] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!providerId || !selectedDate) return;
            setLoadingSlots(true);
            try {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const data = await authApi.getProviderAvailability(providerId, dateStr);
                setAvailableSlots(data.slots);
            } catch (error) {
                console.error('Error fetching availability:', error);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchAvailability();
    }, [providerId, selectedDate]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const generateCalendarDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Add empty slots for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const isDateDisabled = (date: Date) => {
        return date < currentDate;
    };

    const isWorkingDay = (date: Date) => {
        if (!provider.workingDays) return true;
        const dayName = weekDays[date.getDay()]; // 'Sun', 'Mon', etc.
        const shortDayName = dayName.slice(0, 3);

        if (provider.workingDays.includes('Everyday')) return true;
        if (provider.workingDays.includes(shortDayName)) return true;
        if ((shortDayName === 'Sun' || shortDayName === 'Sat') && provider.workingDays.includes('Weekend only')) return true;

        return false;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(displayedMonth);
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1);
            const minMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            if (newMonth < minMonth) return;
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setDisplayedMonth(newMonth);
    };

    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!providerId) return;
            try {
                const data = await authApi.getProviderReviews(providerId);
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviews();
    }, [providerId]);

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
        if (!providerId) return;
        navigation.navigate('BookService', {
            providerId: providerId,
            providerName: provider.name,
            providerImage: provider.image,
            providerRating: provider.rating,
            providerReviews: provider.reviews,
            providerPhone: provider.phone,
            providerEmail: provider.email,
            role: provider.role,
            selectedDate: selectedDate.toISOString(),
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

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.orange} />
                    <Text style={{ marginTop: 12, color: COLORS.gray }}>Loading profile details...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Provider Info Card */}
                    <View style={styles.profileCard}>
                        <Image source={{ uri: provider.image }} style={styles.profileImage} />
                        <Text style={styles.providerName}>{provider.name}</Text>

                        <View style={styles.ratingRow}>
                            <Text style={styles.ratingValue}>{provider.rating && provider.rating > 0 ? Number(provider.rating).toFixed(1) : 'New'}</Text>
                            <View style={styles.starsContainer}>{renderStars(provider.rating)}</View>
                            <Text style={styles.reviewCount}>({provider.reviews} reviews)</Text>
                        </View>

                        {/* Trust Score Display */}
                        <View style={styles.trustScoreRow}>
                            <Ionicons name="shield-checkmark" size={16} color="#3B82F6" style={{ marginRight: 6 }} />
                            <Text style={styles.trustScoreLabel}>Trust Score: </Text>
                            <Text style={styles.trustScoreValue}>{Number(provider.trustScore || 5.0).toFixed(1)} / 5.0</Text>
                        </View>

                        {/* Badges Section */}
                        {provider.badges?.length > 0 && (
                            <View style={styles.badgeRow}>
                                {(provider.badges.includes('ADDRESS_VERIFIED') || provider.badges.includes('IDENTITY_VERIFIED')) && (
                                    <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                                        <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
                                        <Text style={styles.badgeText}>
                                            {provider.badges.includes('ADDRESS_VERIFIED') ? 'Address Verified' : 'Identity Verified'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

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
                            {provider.skills.map((skill: string, index: number) => (
                                <View key={index} style={styles.skillBadge}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Professional Certificates */}
                    {provider.certificates && provider.certificates.length > 0 && (
                        <View style={styles.certificatesSection}>
                            <Text style={styles.sectionTitle}>Certificates :</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.certScrollContainer}>
                                {provider.certificates.map((url: string, index: number) => (
                                    <View key={index} style={styles.certCard}>
                                        <Image source={{ uri: url }} style={styles.certImage} resizeMode="cover" />
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Availability Calendar */}
                    <Text style={styles.sectionTitle}>Availability :</Text>
                    <View style={styles.calendarCard}>
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity onPress={() => navigateMonth('prev')}>
                                <Ionicons name="chevron-back" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                            <Text style={styles.monthText}>{months[displayedMonth.getMonth()]} {displayedMonth.getFullYear()}</Text>
                            <TouchableOpacity onPress={() => navigateMonth('next')}>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weekDaysRow}>
                            {weekDays.map((day, index) => (
                                <Text key={index} style={styles.weekDayText}>{day}</Text>
                            ))}
                        </View>

                        <View style={styles.datesGrid}>
                            {generateCalendarDays(displayedMonth).map((date, index) => {
                                if (!date) return <View key={`empty-${index}`} style={styles.dateItem} />;

                                const isDisabled = isDateDisabled(date);
                                const isSelected = selectedDate.toDateString() === date.toDateString();
                                const hasWork = isWorkingDay(date);

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        disabled={isDisabled}
                                        style={[
                                            styles.dateItem,
                                            isSelected && styles.selectedDateItem,
                                            isDisabled && styles.disabledDateItem,
                                            !hasWork && !isDisabled && !isSelected && { backgroundColor: '#374151' } // Darker blue if no work
                                        ]}
                                        onPress={() => setSelectedDate(date)}
                                    >
                                        <Text style={[
                                            styles.dateText,
                                            isSelected && styles.selectedDateText,
                                            isDisabled && styles.disabledDateText
                                        ]}>{date.getDate()}</Text>
                                        {!isDisabled && hasWork && !isSelected && <View style={styles.workDot} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Available Times */}
                    <Text style={styles.sectionTitle}>Available Times for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} :</Text>
                    <View style={styles.timesCard}>
                        {loadingSlots ? (
                            <ActivityIndicator size="small" color={COLORS.orange} style={{ padding: 20 }} />
                        ) : availableSlots.length > 0 ? (
                            availableSlots.map((slot, index) => (
                                <View key={index} style={styles.timeSlot}>
                                    <Text style={styles.timeText}>{slot.time}</Text>
                                    <View style={styles.statusContainer}>
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(slot.status) }]} />
                                        <Text style={[styles.statusText, { color: getStatusColor(slot.status) }]}>
                                            {slot.status}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={{ textAlign: 'center', color: COLORS.gray, padding: 20 }}>No availability for this day</Text>
                        )}
                    </View>

                    {/* Reviews */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Reviews :</Text>
                        {reviews.length > 3 && (
                            <TouchableOpacity onPress={() => navigation.navigate('ProviderRatings', { providerId, providerName: provider.name })}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loadingReviews ? (
                        <ActivityIndicator size="small" color={COLORS.orange} style={{ padding: 20 }} />
                    ) : reviews.length > 0 ? (
                        reviews.slice(0, 3).map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewerInfo}>
                                        <View style={styles.reviewerAvatar}>
                                            {review.reviewer?.profileImage ? (
                                                <Image source={{ uri: review.reviewer.profileImage }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                                            ) : (
                                                <Ionicons name="person" size={20} color={COLORS.gray} />
                                            )}
                                        </View>
                                        <Text style={styles.reviewerName}>{review.reviewer?.fullName || 'Anonymous'}</Text>
                                    </View>
                                    <View style={styles.reviewStars}>
                                        <Text style={{ fontSize: 12, color: COLORS.orange, fontWeight: 'bold', marginRight: 4 }}>{review.rating.toFixed(1)}</Text>
                                        {renderStars(review.rating)}
                                    </View>
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                                {review.images && review.images.length > 0 && (
                                    <View style={{ marginTop: 10, marginBottom: 5 }}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {review.images.map((img: string, idx: number) => (
                                                <Image key={idx} source={{ uri: img }} style={{ width: 100, height: 100, borderRadius: 10, marginRight: 8 }} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                                <Text style={styles.reviewDate}>
                                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Text>

                                {review.reply && (
                                    <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: COLORS.orange }}>
                                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.orange, marginBottom: 4 }}>Provider response:</Text>
                                        <Text style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>"{review.reply}"</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Ionicons name="star-outline" size={40} color={COLORS.lightGray} />
                            <Text style={styles.emptyText}>No reviews yet</Text>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}

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
    trustScoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    trustScoreLabel: {
        fontSize: 14,
        color: '#1E40AF',
        fontWeight: '600',
    },
    trustScoreValue: {
        fontSize: 14,
        color: '#1E40AF',
        fontWeight: 'bold',
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
    emptyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyText: {
        marginTop: 12,
        color: COLORS.gray,
        fontSize: 14,
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
    badgeRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
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
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.orange,
        fontWeight: 'bold',
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
    datesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dateItem: {
        width: `${100 / 7}%`,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 2,
    },
    selectedDateItem: {
        backgroundColor: COLORS.orange,
    },
    disabledDateItem: {
        opacity: 0.3,
    },
    dateText: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: '600',
    },
    selectedDateText: {
        color: COLORS.darkBlue,
    },
    disabledDateText: {
        color: COLORS.lightGray,
    },
    workDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.orange,
        position: 'absolute',
        bottom: 4,
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
    certificatesSection: {
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    certScrollContainer: {
        paddingVertical: 8,
    },
    certCard: {
        width: 140,
        height: 95,
        borderRadius: 12,
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    certImage: {
        width: '100%',
        height: '100%',
    },
});

export default ProviderProfileScreen;
