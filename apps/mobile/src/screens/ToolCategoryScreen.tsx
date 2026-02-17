import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';

type ToolCategoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToolCategory'>;
type ToolCategoryScreenRouteProp = RouteProp<RootStackParamList, 'ToolCategory'>;

const { width } = Dimensions.get('window');

const ToolCategoryScreen = () => {
    const navigation = useNavigation<ToolCategoryScreenNavigationProp>();
    const route = useRoute<ToolCategoryScreenRouteProp>();
    const { categoryName = 'Power Tools' } = route.params || {};

    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)); // Default +2 days
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const tools = [
        {
            id: 1,
            name: 'Circular Power Saw',
            rating: 4.8,
            price: 800,
            image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            voltage: '18V',
            weight: '3.4 lbs',
            chuckSize: '1/2"'
        },
        {
            id: 2,
            name: 'DeWalt Impact Drill',
            rating: 4.8,
            price: 800,
            image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            voltage: '18V',
            weight: '2.4 lbs',
            chuckSize: '1/4"'
        },
        {
            id: 3,
            name: 'Angle Grinder',
            rating: 4.8,
            price: 900,
            image: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            voltage: '20V',
            weight: '4.0 lbs',
            chuckSize: 'N/A'
        },
        {
            id: 4,
            name: 'Jig Saw',
            rating: 4.8,
            price: 800,
            image: 'https://images.unsplash.com/photo-1540539234-c14a205bf96e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            voltage: '12V',
            weight: '3.2 lbs',
            chuckSize: 'N/A'
        },
        {
            id: 5,
            name: 'Cordless Drill',
            rating: 4.8,
            price: 800,
            image: 'https://images.unsplash.com/photo-1622037022824-0c71d511ef3c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            voltage: '18V',
            weight: '3.4 lbs',
            chuckSize: '1/2"'
        },
        {
            id: 6,
            name: 'Sander',
            rating: 4.5,
            price: 700,
            image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            voltage: '120V',
            weight: '2.5 lbs',
            chuckSize: 'N/A'
        }
    ];

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
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.toolName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={COLORS.orange} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                <View style={styles.footer}>
                    <View style={styles.priceTag}>
                        <Text style={styles.priceText}>LKR {item.price}/d</Text>
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName}</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Delivery Address Card */}
                <View style={styles.addressCard}>
                    <View style={styles.addressHeader}>
                        <Ionicons name="location-outline" size={20} color={COLORS.orange} />
                        <Text style={styles.addressLabel}>DELEVERY ADDRESS</Text>
                    </View>
                    <Text style={styles.addressText}>216 Ananda Road, Moratuwa, Colombo</Text>
                    <TouchableOpacity style={styles.editIcon}>
                        <Ionicons name="pencil-outline" size={20} color={COLORS.orange} />
                    </TouchableOpacity>
                </View>

                {/* Date Selection */}
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
                    <Text style={styles.sectionTitle}>Avaliable tool list</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>view all</Text>
                    </TouchableOpacity>
                </View>

                {/* Tool Grid */}
                <View style={styles.gridContainer}>
                    {tools.map(item => (
                        <View key={item.id} style={styles.gridItemWrapper}>
                            {renderToolCard({ item })}
                        </View>
                    ))}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>

            {showFromPicker && (
                <DateTimePicker value={fromDate} mode="date" display="default" onChange={handleFromDateChange} minimumDate={new Date()} />
            )}
            {showToPicker && (
                <DateTimePicker value={toDate} mode="date" display="default" onChange={handleToDateChange} minimumDate={fromDate} />
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
    viewAllText: {
        fontSize: 14,
        color: COLORS.gray,
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
        borderColor: '#F3F4F6', // Lighter border
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
    },
    image: {
        width: '100%',
        height: '100%',
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

export default ToolCategoryScreen;
