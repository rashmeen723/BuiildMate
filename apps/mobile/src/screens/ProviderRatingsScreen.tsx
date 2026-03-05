import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, StatusBar, FlatList, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNavBar from '../components/BottomNavBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProviderRatingsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp<RootStackParamList, 'ProviderRatings'>>();
    const { providerId, providerName } = route.params || {};
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [activeFilter, setActiveFilter] = useState('Latest');
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const targetId = providerId || user?.id;

    const filters = ['Latest', 'Highest Rated', 'Critical', 'With Photos'];

    const fetchReviews = async () => {
        if (!targetId) return;
        try {
            // If viewing a specific provider (e.g. from customer side)
            const data = providerId
                ? await authApi.getProviderReviews(providerId)
                : await authApi.getUserReviews(user?.id || '');
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [targetId]);

    const handleLike = async (reviewId: string) => {
        try {
            await authApi.likeReview(reviewId);
            // Optimistic update
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r));
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleReplyPress = (review: any) => {
        setSelectedReview(review);
        setReplyText(review.reply || '');
        setReplyModalVisible(true);
    };

    const submitReply = async () => {
        if (!selectedReview || !replyText.trim()) return;
        setSubmittingReply(true);
        try {
            await authApi.replyToReview(selectedReview.id, replyText);
            Alert.alert('Success', 'Reply submitted successfully!');
            setReplyModalVisible(false);
            fetchReviews(); // Refresh list
        } catch (error) {
            Alert.alert('Error', 'Failed to submit reply');
        } finally {
            setSubmittingReply(false);
        }
    };

    const calculateStats = () => {
        if (reviews.length === 0) return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };

        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const average = (sum / total).toFixed(1);

        const counts = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                counts[5 - r.rating]++;
            }
        });

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

    const getFilteredReviews = () => {
        let filtered = [...reviews];
        if (activeFilter === 'Highest Rated') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (activeFilter === 'Critical') {
            filtered = filtered.filter(r => r.rating <= 3);
            filtered.sort((a, b) => a.rating - b.rating);
        } else if (activeFilter === 'With Photos') {
            filtered = filtered.filter(r => (r.images && r.images.length > 0) || r.booking?.issueImage);
        } else {
            // Latest (default)
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return filtered;
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
                        <Text style={styles.reviewLocation}>
                            {item.reviewer?.addresses?.[0]?.city || 'Colombo'} • {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                </View>
                <View style={[styles.starsRow, { alignItems: 'center' }]}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.orange, marginRight: 4 }}>{item.rating.toFixed(1)}</Text>
                    {renderStars(item.rating)}
                </View>
            </View>

            <Text style={styles.reviewComment}>{item.comment}</Text>

            {item.images && item.images.length > 0 && (
                <View style={styles.reviewImagesContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {item.images.map((img: string, idx: number) => (
                            <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.reviewFooter}>
                <View style={styles.interactionRow}>
                    <TouchableOpacity style={styles.interactionBtn} onPress={() => handleLike(item.id)}>
                        <Ionicons name="thumbs-up-outline" size={16} color={COLORS.gray} />
                        <Text style={styles.interactionText}>{item.likes || 0}</Text>
                    </TouchableOpacity>
                    {user?.id === item.revieweeId && (
                        <TouchableOpacity
                            style={[styles.interactionBtn, { marginLeft: 16 }]}
                            onPress={() => handleReplyPress(item)}
                        >
                            <Text style={[styles.interactionText, { color: COLORS.darkBlue }]}>Reply</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {item.booking?.totalAmount && (
                    <Text style={styles.verifiedJobText}>Verified Job • LKR {item.booking.totalAmount.toLocaleString()}</Text>
                )}
            </View>

            {item.reply && (
                <View style={[styles.responseBox, { borderLeftColor: COLORS.orange, borderLeftWidth: 4 }]}>
                    <Text style={[styles.responseTitle, { color: COLORS.orange }]}>Your Response:</Text>
                    <Text style={styles.responseText}>"{item.reply}"</Text>
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
                <Text style={styles.headerTitle}>{providerName ? `${providerName}'s Reviews` : 'Ratings & Reviews'}</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.darkBlue} />
                </View>
            ) : (
                <FlatList
                    data={getFilteredReviews()}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <>
                            {/* Summary Section */}
                            <View style={styles.summarySection}>
                                <View style={styles.averageColumn}>
                                    <Text style={styles.averageText}>{stats.average}</Text>
                                    <View style={[styles.starsRow, { marginBottom: 8 }]}>
                                        {renderStars(Math.round(Number(stats.average)), 20)}
                                    </View>
                                    <Text style={styles.totalReviewsText}>{stats.total} REVIEWS</Text>
                                </View>

                                <View style={styles.distributionColumn}>
                                    {stats.distribution.map((perc, index) => (
                                        <View key={index} style={styles.distRow}>
                                            <Text style={styles.distLabel}>{5 - index}</Text>
                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: `${perc}%` }]} />
                                            </View>
                                            <Text style={styles.distPerc}>{perc}%</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Filters */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filtersContainer}
                            >
                                {filters.map(filter => (
                                    <TouchableOpacity
                                        key={filter}
                                        style={[
                                            styles.filterChip,
                                            activeFilter === filter && styles.filterChipActive
                                        ]}
                                        onPress={() => setActiveFilter(filter)}
                                    >
                                        <Text style={[
                                            styles.filterText,
                                            activeFilter === filter && styles.filterTextActive
                                        ]}>
                                            {filter}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    }
                    renderItem={renderReviewItem}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="star-outline" size={60} color={COLORS.lightGray} />
                            <Text style={styles.emptyText}>No reviews yet</Text>
                        </View>
                    }
                />
            )}

            {/* Reply Modal */}
            <Modal
                visible={replyModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setReplyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.replyModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Reply to Review</Text>
                            <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.black} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.originalComment}>
                            <Text style={{ fontWeight: 'bold' }}>{selectedReview?.reviewer?.fullName}: </Text>
                            "{selectedReview?.comment}"
                        </Text>

                        <TextInput
                            style={styles.replyInput}
                            placeholder="Type your response here..."
                            multiline
                            numberOfLines={4}
                            value={replyText}
                            onChangeText={setReplyText}
                        />

                        <TouchableOpacity
                            style={[styles.submitReplyBtn, submittingReply && { opacity: 0.7 }]}
                            onPress={submitReply}
                            disabled={submittingReply}
                        >
                            {submittingReply ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <Text style={styles.submitReplyText}>Submit Reply</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 100,
    },
    summarySection: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 24,
        alignItems: 'center',
    },
    averageColumn: {
        alignItems: 'center',
        flex: 1,
    },
    averageText: {
        fontSize: 48,
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: 56,
    },
    totalReviewsText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.gray,
        letterSpacing: 0.5,
    },
    starsRow: {
        flexDirection: 'row',
    },
    distributionColumn: {
        flex: 1.5,
        paddingLeft: 24,
    },
    distRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    distLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.black,
        width: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        marginHorizontal: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#0F172A',
        borderRadius: 3,
    },
    distPerc: {
        fontSize: 11,
        color: COLORS.gray,
        width: 30,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 20,
    },
    filtersContainer: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        marginRight: 10,
    },
    filterChipActive: {
        backgroundColor: '#0F172A',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray,
    },
    filterTextActive: {
        color: COLORS.white,
    },
    reviewCard: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    reviewerMeta: {
        marginLeft: 12,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.black,
    },
    reviewLocation: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 2,
    },
    reviewComment: {
        fontSize: 15,
        lineHeight: 22,
        color: '#334155',
        marginBottom: 16,
    },
    reviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    interactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    interactionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    interactionText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray,
        marginLeft: 6,
    },
    verifiedJobText: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
    responseBox: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    responseTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 4,
    },
    responseText: {
        fontSize: 13,
        color: '#475569',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    reviewImagesContainer: {
        marginTop: 12,
        marginBottom: 8,
    },
    reviewImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginRight: 10,
        backgroundColor: '#F1F5F9',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        color: COLORS.gray,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    replyModal: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    originalComment: {
        fontSize: 14,
        color: COLORS.gray,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    replyInput: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 15,
        height: 120,
        textAlignVertical: 'top',
        fontSize: 15,
        color: COLORS.black,
        marginBottom: 20,
    },
    submitReplyBtn: {
        backgroundColor: COLORS.orange,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
    },
    submitReplyText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProviderRatingsScreen;
