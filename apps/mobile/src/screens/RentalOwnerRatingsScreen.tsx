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

const RentalOwnerRatingsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp<RootStackParamList, 'RentalOwnerRatings'>>();
    const { ownerId, ownerName } = route.params || {};
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [activeFilter, setActiveFilter] = useState('Latest');
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const targetId = ownerId || user?.id;
    const filters = ['Latest', 'Highest Rated', 'Critical', 'With Photos'];

    const fetchReviews = async () => {
        if (!targetId) return;
        try {
            const data = await authApi.getUserReviews(targetId);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching owner reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [targetId]);

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
            Alert.alert('Success', 'Reply submitted!');
            setReplyModalVisible(false);
            fetchReviews();
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
            {item.rental?.tool && (
                <View style={styles.toolTag}>
                    <Ionicons name="construct-outline" size={12} color={COLORS.darkBlue} />
                    <Text style={styles.toolTagName}>{item.rental.tool.name}</Text>
                </View>
            )}
            <Text style={styles.reviewComment}>{item.comment}</Text>
            {user?.id === item.revieweeId && (
                <TouchableOpacity onPress={() => handleReplyPress(item)}>
                    <Text style={styles.replyBtnText}>{item.reply ? 'Edit Reply' : 'Reply to Customer'}</Text>
                </TouchableOpacity>
            )}
            {item.reply && (
                <View style={styles.responseBox}>
                    <Text style={styles.responseTitle}>Your Response:</Text>
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
                <Text style={styles.headerTitle}>Store Ratings</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.darkBlue} /></View>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
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
                />
            )}

            <Modal visible={replyModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.replyModal}>
                        <Text style={styles.modalTitle}>Reply to Customer</Text>
                        <TextInput
                            style={styles.replyInput}
                            multiline
                            placeholder="Thank the customer or address their concerns..."
                            value={replyText}
                            onChangeText={setReplyText}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setReplyModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={submitReply} disabled={submittingReply}>
                                <Text style={styles.submitBtnText}>{submittingReply ? '...' : 'Submit'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <BottomNavBar />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    backButton: { padding: 5 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    summarySection: { flexDirection: 'row', padding: 24, alignItems: 'center' },
    averageColumn: { alignItems: 'center', flex: 1 },
    averageText: { fontSize: 48, fontWeight: '800', color: '#0F172A' },
    totalReviewsText: { fontSize: 12, fontWeight: '700', color: COLORS.gray, marginTop: 4 },
    starsRow: { flexDirection: 'row' },
    distributionColumn: { flex: 1.5, paddingLeft: 24 },
    distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    distLabel: { fontSize: 11, fontWeight: 'bold', width: 12 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginHorizontal: 8 },
    progressBarFill: { height: '100%', backgroundColor: COLORS.darkBlue, borderRadius: 3 },
    distPerc: { fontSize: 11, color: COLORS.gray, width: 30, textAlign: 'right' },
    reviewCard: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    reviewerInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    reviewerMeta: { marginLeft: 12 },
    reviewerName: { fontSize: 15, fontWeight: 'bold' },
    reviewDate: { fontSize: 12, color: COLORS.gray },
    reviewComment: { fontSize: 14, color: '#334155', lineHeight: 20 },
    replyBtnText: { color: COLORS.primary, fontWeight: 'bold', marginTop: 12, fontSize: 13 },
    responseBox: { marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: COLORS.orange },
    responseTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.orange, marginBottom: 4 },
    responseText: { fontSize: 13, color: '#475569', fontStyle: 'italic' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    replyModal: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    replyInput: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
    cancelBtnText: { color: COLORS.gray, fontWeight: 'bold' },
    submitBtn: { flex: 2, backgroundColor: COLORS.darkBlue, padding: 15, borderRadius: 12, alignItems: 'center' },
    submitBtnText: { color: 'white', fontWeight: 'bold' },
    toolTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
        gap: 4,
    },
    toolTagName: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.darkBlue,
    },
});

export default RentalOwnerRatingsScreen;
