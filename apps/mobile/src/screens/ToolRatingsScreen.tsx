import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { rentalsApi } from '../services/api';

type ToolRatingsScreenRouteProp = RouteProp<RootStackParamList, 'ToolRatings'>;

const ToolRatingsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<ToolRatingsScreenRouteProp>();
    const { toolId, toolName } = route.params;

    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await rentalsApi.getToolReviews(toolId);
                setReviews(data);
            } catch (error) {
                console.error('Error fetching tool reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [toolId]);

    const calculateStats = () => {
        if (reviews.length === 0) return { average: '0.0', total: 0, distribution: [0, 0, 0, 0, 0] };
        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const average = (sum / total).toFixed(1);
        const counts = [0, 0, 0, 0, 0];
        reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[5 - r.rating]++; });
        const distribution = counts.map(c => Math.round((c / total) * 100));
        return { average, total, distribution };
    };

    const stats = calculateStats();

    const renderStars = (rating: number, size = 16) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= Math.floor(rating) ? 'star' : i - rating < 1 ? 'star-half' : 'star-outline'}
                    size={size}
                    color={COLORS.orange}
                    style={{ marginRight: 2 }}
                />
            );
        }
        return stars;
    };

    const renderReviewItem = ({ item }: { item: any }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                    <Image
                        source={{ uri: item.reviewer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.reviewer?.fullName || 'User')}&background=random` }}
                        style={styles.avatar}
                    />
                    <View style={styles.reviewerMeta}>
                        <Text style={styles.reviewerName}>{item.reviewer?.fullName || 'Anonymous'}</Text>
                        <Text style={styles.reviewDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={styles.starsRow}>{renderStars(item.rating)}</View>
            </View>
            <Text style={styles.reviewComment}>{item.comment}</Text>
            {item.reply && (
                <View style={styles.responseBox}>
                    <Text style={styles.responseTitle}>Owner Response:</Text>
                    <Text style={styles.responseText}>{item.reply}</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Reviews</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{toolName}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.darkBlue} /></View>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListHeaderComponent={
                        <View style={styles.summarySection}>
                            <View style={styles.averageColumn}>
                                <Text style={styles.averageText}>{stats.average}</Text>
                                <View style={styles.starsRow}>{renderStars(Math.round(Number(stats.average)), 20)}</View>
                                <Text style={styles.totalReviewsText}>{stats.total} REVIEWS</Text>
                            </View>
                            <View style={styles.distributionColumn}>
                                {stats.distribution.map((perc, index) => (
                                    <View key={index} style={styles.distRow}>
                                        <Text style={styles.distLabel}>{5 - index}</Text>
                                        <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${perc}%` }]} /></View>
                                        <Text style={styles.distPerc}>{perc}%</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    }
                    renderItem={renderReviewItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="star-outline" size={60} color={COLORS.gray} opacity={0.3} />
                            <Text style={styles.emptyText}>No reviews found for this tool.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black },
    headerSubtitle: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
    backButton: { padding: 5 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    summarySection: { flexDirection: 'row', padding: 24, alignItems: 'center', backgroundColor: '#F8FAFC', marginBottom: 8 },
    averageColumn: { alignItems: 'center', flex: 1 },
    averageText: { fontSize: 48, fontWeight: '800', color: COLORS.darkBlue },
    totalReviewsText: { fontSize: 12, fontWeight: '700', color: COLORS.gray, marginTop: 4 },
    starsRow: { flexDirection: 'row' },
    distributionColumn: { flex: 1.5, paddingLeft: 24 },
    distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    distLabel: { fontSize: 11, fontWeight: 'bold', width: 12 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginHorizontal: 8 },
    progressBarFill: { height: '100%', backgroundColor: COLORS.orange, borderRadius: 3 },
    distPerc: { fontSize: 11, color: COLORS.gray, width: 30, textAlign: 'right' },
    reviewCard: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    reviewerInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    reviewerMeta: { marginLeft: 12 },
    reviewerName: { fontSize: 15, fontWeight: 'bold' },
    reviewDate: { fontSize: 12, color: COLORS.gray },
    reviewComment: { fontSize: 14, color: '#334155', lineHeight: 20 },
    responseBox: { marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: COLORS.orange },
    responseTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.orange, marginBottom: 4 },
    responseText: { fontSize: 13, color: '#475569', fontStyle: 'italic' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, color: COLORS.gray, fontSize: 16 },
});

export default ToolRatingsScreen;
