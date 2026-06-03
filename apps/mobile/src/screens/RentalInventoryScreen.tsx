import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { rentalsApi } from '../services/api';

type InventoryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddTool'>;

const RentalInventoryScreen = () => {
    const navigation = useNavigation<InventoryNavigationProp>();
    const { user } = useAuth();
    const [tools, setTools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTools = async () => {
        if (!user?.id) return;
        try {
            const data = await rentalsApi.getOwnerTools(user.id);
            setTools(data);
        } catch (error) {
            console.error('Error fetching tools:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTools();
        }, [user?.id])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchTools();
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={COLORS.darkBlue} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inventory</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddTool')}
                >
                    <Ionicons name="add" size={24} color={COLORS.darkBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.darkBlue]} />
                }
            >
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{tools.length}</Text>
                        <Text style={styles.summaryLabel}>Total Tools</Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{tools.filter(t => t.status === 'AVAILABLE').length}</Text>
                        <Text style={styles.summaryLabel}>Available</Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{tools.filter(t => t.status === 'RENTED').length}</Text>
                        <Text style={styles.summaryLabel}>Rented</Text>
                    </View>
                </View>

                {tools.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="toolbox-outline" size={80} color="#CBD5E1" />
                        <Text style={styles.emptyStateTitle}>Your toolbox is empty</Text>
                        <Text style={styles.emptyStateSub}>Start adding your tools to earn money from rentals.</Text>
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={() => navigation.navigate('AddTool')}
                        >
                            <Text style={styles.emptyStateButtonText}>Add Your First Tool</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    tools.map((tool) => (
                        <View key={tool.id} style={styles.toolCard}>
                            <View style={styles.toolTopSection}>
                                <View style={[styles.iconContainer, { backgroundColor: tool.status === 'AVAILABLE' ? '#EBF2FF' : '#FFF7ED' }]}>
                                    <MaterialCommunityIcons
                                        name={tool.category === 'Power Tools' ? 'toolbox' : 'hammer'}
                                        size={24}
                                        color={tool.status === 'AVAILABLE' ? '#3B82F6' : '#F97316'}
                                    />
                                </View>
                                <View style={styles.toolInfo}>
                                    <View style={styles.toolTitleRow}>
                                        <Text style={styles.toolTitleText} numberOfLines={1}>{tool.name}</Text>
                                        <View style={tool.status === 'AVAILABLE' ? styles.statusBadgeActive : styles.statusBadgeRented}>
                                            <Text style={tool.status === 'AVAILABLE' ? styles.statusBadgeTextActive : styles.statusBadgeTextRented}>
                                                {tool.status}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.toolSubText}>{tool.category}</Text>
                                </View>
                            </View>
                            <View style={styles.toolBottomSection}>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceLabel}>Daily Rate</Text>
                                    <Text style={styles.priceValue}>LKR {tool.dailyRate.toLocaleString()}</Text>
                                </View>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity 
                                        style={styles.editButton}
                                        onPress={() => navigation.navigate('AddTool', { tool })}
                                    >
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTool')}
            >
                <Ionicons name="add" size={30} color={COLORS.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 24 : 16,
        paddingBottom: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    addButton: {
        padding: 4,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.darkBlue,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    verticalDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#F1F5F9',
    },
    toolCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
    },
    toolTopSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolInfo: {
        flex: 1,
        marginLeft: 16,
    },
    toolTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    toolTitleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        flex: 1,
        marginRight: 10,
    },
    statusBadgeActive: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        flexShrink: 0,
    },
    statusBadgeTextActive: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#15803D',
    },
    statusBadgeRented: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        flexShrink: 0,
    },
    statusBadgeTextRented: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#B91C1C',
    },
    toolSubText: {
        fontSize: 13,
        color: '#64748B',
    },
    toolBottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    priceContainer: {
        flexDirection: 'column',
    },
    priceLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    editButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#475569',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 20,
    },
    emptyStateSub: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    emptyStateButton: {
        marginTop: 30,
        backgroundColor: COLORS.darkBlue,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
    },
    emptyStateButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 15,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.darkBlue,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    }
});

export default RentalInventoryScreen;
