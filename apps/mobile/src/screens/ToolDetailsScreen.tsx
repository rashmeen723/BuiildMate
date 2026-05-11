import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { rentalsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
type ToolDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToolDetails'>;
type ToolDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ToolDetails'>;

const { width } = Dimensions.get('window');

const ToolDetailsScreen = () => {
    const navigation = useNavigation<ToolDetailsScreenNavigationProp>();
    const route = useRoute<ToolDetailsScreenRouteProp>();
    const { tool } = route.params || {};

    // Map backend data to local structure if needed
    const currentTool = tool || {};
    const price = currentTool.dailyRate || currentTool.price || 0;
    const ownerName = currentTool.owner?.user?.fullName || currentTool.ownerName || 'Nuwan Fenando';
    const ownerImage = currentTool.owner?.user?.profileImage || currentTool.ownerImage || 'https://randomuser.me/api/portraits/men/32.jpg';
    const ownerPhone = currentTool.owner?.user?.phone || '+9477-7863458';

    const { user } = useAuth();
    const defaultAddr = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0];

    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const [selectedDate, setSelectedDate] = useState(route.params?.fromDate ? new Date(route.params.fromDate) : new Date());
    const [displayedMonth, setDisplayedMonth] = useState(new Date());
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [isAvailableInSelectedDates, setIsAvailableInSelectedDates] = useState(currentTool.status === 'AVAILABLE');
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const checkAvailability = (date: Date) => {
        if (currentTool.status !== 'AVAILABLE') {
            setIsAvailableInSelectedDates(false);
            return;
        }
        setIsCheckingAvailability(true);
        // Simulate an API check delay
        setTimeout(() => {
            setIsAvailableInSelectedDates(true);
            setIsCheckingAvailability(false);
        }, 500);
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const generateCalendarDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const isDateDisabled = (date: Date) => {
        return date < currentDate;
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

    useEffect(() => {
        const fetchReviews = async () => {
            if (!currentTool.id) return;
            try {
                const data = await rentalsApi.getToolReviews(currentTool.id);
                setReviews(data);
            } catch (error) {
                console.error('Error fetching tool reviews:', error);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviews();
    }, [currentTool.id]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= Math.floor(rating) ? 'star' : i - rating < 1 ? 'star-half' : 'star-outline'}
                    size={14}
                    color={COLORS.orange}
                    style={{ marginRight: 2 }}
                />
            );
        }
        return stars;
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
            <Text style={styles.sectionTitle}>Check Availability</Text>

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

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dateItem,
                                    isSelected && styles.selectedDateItem,
                                    isDisabled && styles.disabledDateItem
                                ]}
                                onPress={() => {
                                    if (!isDisabled) {
                                        setSelectedDate(date);
                                        checkAvailability(date);
                                    }
                                }}
                                disabled={isDisabled}
                            >
                                <Text style={[
                                    styles.dateText,
                                    isSelected && styles.selectedDateText,
                                    isDisabled && styles.disabledDateText
                                ]}>
                                    {date.getDate()}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.statusTag}>
                {isCheckingAvailability ? (
                    <ActivityIndicator size="small" color={COLORS.orange} style={{ marginRight: 8 }} />
                ) : (
                    <View style={[styles.statusDot, { backgroundColor: isAvailableInSelectedDates ? '#10B981' : '#EF4444' }]} />
                )}
                <Text style={[styles.statusText, { color: isAvailableInSelectedDates && !isCheckingAvailability ? '#10B981' : isCheckingAvailability ? COLORS.orange : '#EF4444' }]}>
                    {isCheckingAvailability ? 'Checking...' : isAvailableInSelectedDates ? 'Available for selected date' : 'Not available for selected date'}
                </Text>
            </View>
        </View>
    );

    const renderLocation = () => (
        <View style={styles.locationContainer}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <View style={styles.locationCard}>
                <View style={styles.locationIconBox}>
                    <Ionicons name="location" size={24} color={COLORS.orange} />
                </View>
                <View style={styles.locationInfo}>
                    <Text style={styles.locationTitle}>{currentTool.owner?.businessName || ownerName}'s Location</Text>
                    <Text style={styles.locationText}>
                        {currentTool.owner?.formattedAddress || 'No specific location provided for this tool.'}
                    </Text>
                    {currentTool.owner?.formattedAddress && (
                        <TouchableOpacity
                            style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => {
                                const toolLat = currentTool.owner?.latitude || currentTool.pickupLatitude;
                                const toolLng = currentTool.owner?.longitude || currentTool.pickupLongitude;
                                if (!toolLat || !toolLng) return;

                                navigation.navigate('ToolMap', {
                                    tools: [currentTool],
                                    singleToolMode: true,
                                    userLocation: defaultAddr ? {
                                        latitude: defaultAddr.latitude,
                                        longitude: defaultAddr.longitude,
                                        address: defaultAddr.addressLine1
                                    } : undefined,
                                    initialRegion: {
                                        latitude: toolLat,
                                        longitude: toolLng,
                                        latitudeDelta: 0.05,
                                        longitudeDelta: 0.05,
                                    }
                                });
                            }}
                        >
                            <Text style={{ color: COLORS.darkBlue, fontWeight: 'bold', fontSize: 12 }}>View on Map</Text>
                            <Ionicons name="chevron-forward" size={12} color={COLORS.darkBlue} style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    const renderOwner = () => (
        <View style={styles.ownerContainer}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <View style={styles.ownerCard}>
                <Image source={{ uri: ownerImage }} style={styles.ownerImage} />
                <View style={styles.ownerInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.ownerName}>{ownerName}</Text>
                        {currentTool.owner?.user?.badges?.includes('IDENTITY_VERIFIED') && (
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginLeft: 4 }} />
                        )}
                    </View>
                    <Text style={styles.ownerPhone}>{ownerPhone}</Text>
                </View>
                <View style={styles.ownerRating}>
                    <Ionicons name="star" size={14} color={COLORS.orange} />
                    <Text style={styles.ratingText}>
                        {averageRating} ({reviews.length} rentals)
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderReviews = () => (
        <View style={styles.reviewsContainer}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                {reviews.length > 5 && (
                    <TouchableOpacity onPress={() => navigation.navigate('ToolRatings', { toolId: currentTool.id, toolName: currentTool.name })}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loadingReviews ? (
                <ActivityIndicator size="small" color={COLORS.orange} style={{ marginVertical: 20 }} />
            ) : reviews.length > 0 ? (
                reviews.slice(0, 5).map((item) => (
                    <View key={item.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.reviewerInfo}>
                                <Image
                                    source={{ uri: item.reviewer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.reviewer?.fullName || 'User')}&background=random` }}
                                    style={styles.reviewerAvatar}
                                />
                                <View>
                                    <Text style={styles.reviewerName}>{item.reviewer?.fullName || 'Anonymous'}</Text>
                                    <Text style={styles.reviewDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            <View style={styles.starsRow}>{renderStars(item.rating)}</View>
                        </View>
                        <Text style={styles.reviewComment}>{item.comment}</Text>
                        {item.reply && (
                            <View style={styles.replyBox}>
                                <Text style={styles.replyTitle}>Owner Response:</Text>
                                <Text style={styles.replyText}>{item.reply}</Text>
                            </View>
                        )}
                    </View>
                ))
            ) : (
                <View style={styles.emptyReviews}>
                    <Ionicons name="chatbubbles-outline" size={40} color={COLORS.gray} opacity={0.5} />
                    <Text style={styles.emptyReviewsText}>No reviews yet for this tool.</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    {currentTool.images && currentTool.images.length > 0 ? (
                        <Image source={{ uri: currentTool.images[0] }} style={styles.heroImage} resizeMode="contain" />
                    ) : (
                        <Image source={{ uri: currentTool.image || currentTool.images?.[0] }} style={styles.heroImage} resizeMode="contain" />
                    )}
                    <View style={styles.paginationDots}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>

                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Text style={[styles.toolTitle, { textAlign: 'center' }]}>{currentTool.name}</Text>

                    <View style={[styles.ratingRow, { marginBottom: 16, justifyContent: 'center' }]}>
                        <View style={styles.starsRow}>{renderStars(Number(averageRating))}</View>
                        <Text style={styles.ratingValueText}>{averageRating}</Text>
                        <Text style={styles.reviewCountText}>({reviews.length} reviews)</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.rentButton, currentTool.status !== 'AVAILABLE' && { opacity: 0.5 }]}
                        disabled={currentTool.status !== 'AVAILABLE'}
                        onPress={() => {
                            const start = selectedDate;
                            const end = new Date(selectedDate.getTime() + 1 * 24 * 60 * 60 * 1000); // Defaults to 1 day length base rental
                            const diffTime = Math.abs(end.getTime() - start.getTime());
                            const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                            const pricePerDay = Number(price);

                            navigation.navigate('RentTool', {
                                tool: {
                                    ...currentTool,
                                    price: price, // Ensure price is passed for compatibility
                                    ownerName: ownerName,
                                    ownerImage: ownerImage,
                                    ownerPhone: ownerPhone
                                },
                                startDate: start.toDateString(),
                                endDate: end.toDateString(),
                                totalDays: totalDays,
                                totalPrice: totalDays * pricePerDay
                            });
                        }}
                    >
                        <Text style={styles.rentButtonText}>{currentTool.status === 'AVAILABLE' ? 'Rent this tool' : 'Currently Rented'}</Text>
                    </TouchableOpacity>

                    <View style={[styles.priceRow, { justifyContent: 'center', marginBottom: 0 }]}>
                        <View style={styles.priceTag}>
                            <Text style={styles.priceText}>LKR {price.toLocaleString()}</Text>
                        </View>
                        <Text style={styles.perDayText}>/per day</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {renderSpecs()}

                {renderLocation()}
                {renderAvailability()}

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                    {currentTool.description || "A professional-grade equipment suitable for various construction and DIY tasks. Reliable performance with ergonomic design for extended use."}
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
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
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
        marginRight: 6,
    },
    statusText: {
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
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        marginLeft: 4,
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
    reviewsContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.orange,
        fontWeight: 'bold',
    },
    reviewCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
        marginRight: 10,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    reviewDate: {
        fontSize: 10,
        color: COLORS.gray,
    },
    starsRow: {
        flexDirection: 'row',
    },
    reviewComment: {
        fontSize: 13,
        color: COLORS.black,
        lineHeight: 18,
    },
    replyBox: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.orange,
    },
    replyTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.orange,
        marginBottom: 2,
    },
    replyText: {
        fontSize: 12,
        color: '#4B5563',
        fontStyle: 'italic',
    },
    emptyReviews: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    emptyReviewsText: {
        marginTop: 10,
        fontSize: 13,
        color: COLORS.gray,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingValueText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        marginHorizontal: 8,
    },
    reviewCountText: {
        fontSize: 12,
        color: COLORS.gray,
    },
    centeredInfoContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        marginBottom: 24,
    },
    locationContainer: {
        marginBottom: 24,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        backgroundColor: COLORS.white,
    },
    locationIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    locationInfo: {
        flex: 1,
    },
    locationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    locationText: {
        fontSize: 13,
        color: COLORS.gray,
        lineHeight: 18,
    },
});

export default ToolDetailsScreen;
