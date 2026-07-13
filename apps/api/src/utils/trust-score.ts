import { PrismaClient } from '@prisma/client';

/**
 * Calculates a weighted trust score (1.0 to 5.0) for a provider or rental owner:
 * - Average Rating (60% weight)
 * - Booking/Rental Completion Rate (30% weight)
 * - Disputes Penalty (-0.5 points per resolved dispute against the user)
 */
export async function recalculateUserTrustScore(prisma: any, userId: string): Promise<number> {
    try {
        // 1. Get all reviews received
        const reviews = await prisma.review.findMany({
            where: { revieweeId: userId },
            select: { rating: true }
        });
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
            : 5.0;

        // 2. Count resolved disputes where this user was the reported party
        const disputeCount = await prisma.dispute.count({
            where: { reportedId: userId, status: 'RESOLVED' }
        });

        // 3. Count total bookings and completed bookings for services
        const totalBookings = await prisma.booking.count({
            where: { providerId: userId, status: { in: ['COMPLETED', 'PAID', 'CANCELLED'] } }
        });
        const completedBookings = await prisma.booking.count({
            where: { providerId: userId, status: { in: ['COMPLETED', 'PAID'] } }
        });

        // 4. Count total rentals and completed rentals for tools
        const totalRentals = await prisma.toolRental.count({
            where: { tool: { owner: { userId } }, status: { in: ['COMPLETED', 'PAID', 'CANCELLED'] } }
        });
        const completedRentals = await prisma.toolRental.count({
            where: { tool: { owner: { userId } }, status: { in: ['COMPLETED', 'PAID'] } }
        });

        const totalTransactions = totalBookings + totalRentals;
        const completedTransactions = completedBookings + completedRentals;

        let completionRate = 1.0;
        if (totalTransactions > 0) {
            completionRate = completedTransactions / totalTransactions;
        }

        // 5. Weighted Trust Score Formula
        // Trust Score = (Avg Rating * 0.6) + (Completion Rate * 5 * 0.3) - (Dispute Count * 0.5)
        let trustScore = (avgRating * 0.6) + (completionRate * 5 * 0.3) - (disputeCount * 0.5);
        
        // Clamp trustScore to be between 1.0 and 5.0
        trustScore = Math.max(1.0, Math.min(5.0, trustScore));

        // Round to 1 decimal place
        trustScore = parseFloat(trustScore.toFixed(1));

        await prisma.user.update({
            where: { id: userId },
            data: { trustScore }
        });

        return trustScore;
    } catch (error) {
        console.error(`Error recalculating trust score for user ${userId}:`, error);
        return 5.0;
    }
}
