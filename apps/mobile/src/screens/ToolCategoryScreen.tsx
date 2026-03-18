import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { rentalsApi } from '../services/api';
import BottomNavBar from '../components/BottomNavBar';
import { useAuth } from '../context/AuthContext';

type ToolCategoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToolCategory'>;
type ToolCategoryScreenRouteProp = RouteProp<RootStackParamList, 'ToolCategory'>;

const { width } = Dimensions.get('window');

// Haversine formula to calculate distance between two lat/lng coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
};

const ToolCategoryScreen = () => {
    const navigation = useNavigation<ToolCategoryScreenNavigationProp>();
    const route = useRoute<ToolCategoryScreenRouteProp>();
    const { categoryName = 'Power Tools', selectedLocation, selectedAddress } = route.params || {};

    const { user } = useAuth();

    // Attempt to parse out default user address
    const defaultAddr = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0];
    const displayAddress = selectedAddress || (defaultAddr && defaultAddr.addressLine1
        ? `${defaultAddr.addressLine1}, ${defaultAddr.city}`
        : 'Select Delivery Address');

    const activeLatitude = selectedLocation?.latitude || defaultAddr?.latitude;
    const activeLongitude = selectedLocation?.longitude || defaultAddr?.longitude;

    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [tools, setTools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTools = async () => {
        try {
            const data = await rentalsApi.getToolsByCategory(categoryName);
            setTools(data);
        } catch (error) {
            console.error('Error fetching tools:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTools();
    }, [categoryName]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTools();
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleFromDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') setShowFromPicker(false);
        if (date) setFromDate(date);
    };

    const handleToDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') setShowToPicker(false);
        if (date) setToDate(date);
    };

    const derivedTools = tools.map((tool) => {
        let distance = null;
        if (activeLatitude && activeLongitude && tool.owner?.latitude && tool.owner?.longitude) {
            distance = calculateDistance(
                activeLatitude,
                activeLongitude,
                tool.owner.latitude,
                tool.owner.longitude
            );
        }
        return { ...tool, distance };
    }).filter((tool) => {
        // Active filter based on date overlap
        if (!tool.rentals || tool.rentals.length === 0) return true;

        const reqStart = fromDate.getTime();
        const reqEnd = toDate.getTime();

        for (const rental of tool.rentals) {
            // Include anything that is NOT rejected or cancelled. 
            if (rental.status === 'CANCELLED' || rental.status === 'REJECTED' || rental.status === 'COMPLETED') continue;

            const rentStart = new Date(rental.startDate).getTime();
            const rentEnd = new Date(rental.endDate).getTime();

            // Overlap check
            if (reqStart < rentEnd && reqEnd > rentStart) {
                return false;
            }
        }
        return true;
    }).sort((a, b) => {
        if (a.distance != null && b.distance != null) return a.distance - b.distance;
        if (a.distance != null) return -1;
        if (b.distance != null) return 1;
        return 0;
    });

    const renderToolCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ToolDetails', {
                tool: item,
                fromDate: fromDate.toISOString(),
                toDate: toDate.toISOString()
            })}
        >
            <View style={styles.imageContainer}>
                {item.images && item.images.length > 0 ? (
                    <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="contain" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#CBD5E1" />
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.toolName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={COLORS.orange} />
                    <Text style={styles.ratingText}>{Number(item.rating || 5.0).toFixed(1)}</Text>
                    {item.reviewCount > 0 && <Text style={{ fontSize: 10, color: COLORS.gray, marginLeft: 2 }}>({item.reviewCount})</Text>}

                    {item.distance && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                            <Ionicons name="location-outline" size={12} color={COLORS.gray} />
                            <Text style={{ fontSize: 10, color: COLORS.gray, marginLeft: 2 }}>{item.distance} km</Text>
                        </View>
                    )}
                </View>
                <View style={styles.footer}>
                    <View style={styles.priceTag}>
                        <Text style={styles.priceText}>LKR {item.dailyRate}/d</Text>
                    </View>
                    <TouchableOpacity style={styles.addButton}>
                        <Ionicons name="add" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName}</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.darkBlue]} />
                }
            >
                <View style={styles.addressCard}>
                    <View style={styles.addressHeader}>
                        <Ionicons name="location-outline" size={20} color={COLORS.orange} />
                        <Text style={styles.addressLabel}>DELIVERY ADDRESS</Text>
                    </View>
                    <Text style={styles.addressText}>{displayAddress}</Text>
                    <TouchableOpacity
                        style={styles.editIcon}
                        onPress={() => navigation.navigate('MapSelection', {
                            returnScreen: 'ToolCategory',
                            categoryName: categoryName
                        } as any)}
                    >
                        <Ionicons name="pencil-outline" size={20} color={COLORS.orange} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>When do you need the Tool?</Text>
                <View style={styles.dateRow}>
                    <View style={styles.dateColumn}>
                        <Text style={styles.dateLabelSmall}>From :</Text>
                        <TouchableOpacity style={styles.dateBox} onPress={() => setShowFromPicker(true)}>
                            <Ionicons name="calendar-outline" size={24} color={COLORS.orange} style={{ marginRight: 12 }} />
                            <View>
                                <Text style={styles.dateLabel}>DATE</Text>
                                <Text style={styles.dateValue}>{formatDate(fromDate)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dateColumn}>
                        <Text style={styles.dateLabelSmall}>To :</Text>
                        <TouchableOpacity style={styles.dateBox} onPress={() => setShowToPicker(true)}>
                            <Ionicons name="calendar-outline" size={24} color={COLORS.orange} style={{ marginRight: 12 }} />
                            <View>
                                <Text style={styles.dateLabel}>DATE</Text>
                                <Text style={styles.dateValue}>{formatDate(toDate)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>Available tool list</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.darkBlue} style={{ marginTop: 20 }} />
                ) : derivedTools.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No available tools for these dates.</Text>
                    </View>
                ) : (
                    <View style={styles.gridContainer}>
                        {derivedTools.map(item => (
                            <View key={item.id} style={styles.gridItemWrapper}>
                                {renderToolCard({ item })}
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 80 }} />
            </ScrollView>

            {showFromPicker && (
                <DateTimePicker value={fromDate} mode="date" display="default" onChange={handleFromDateChange} minimumDate={new Date()} />
            )}
            {showToPicker && (
                <DateTimePicker value={toDate} mode="date" display="default" onChange={handleToDateChange} minimumDate={fromDate} />
            )}

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
        paddingTop: 10,
    },
    addressCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        position: 'relative',
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
        marginLeft: 8,
        textTransform: 'uppercase',
    },
    addressText: {
        fontSize: 14,
        color: COLORS.gray,
        marginLeft: 28,
        lineHeight: 20,
        maxWidth: '85%',
    },
    editIcon: {
        position: 'absolute',
        right: 16,
        top: 24,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 12,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    dateColumn: {
        width: '48%',
    },
    dateLabelSmall: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: COLORS.black
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        height: 60,
    },
    dateLabel: {
        fontSize: 10,
        color: COLORS.gray,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    dateValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItemWrapper: {
        width: '48%',
        marginBottom: 16,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        width: '100%',
        height: 120,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    toolName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 8,
        height: 40,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceTag: {
        backgroundColor: COLORS.orange,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    priceText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.darkBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.gray,
        fontSize: 14,
    }
});

export default ToolCategoryScreen;
