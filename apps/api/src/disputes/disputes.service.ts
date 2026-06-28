import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DisputeStatus } from '@prisma/client';

@Injectable()
export class DisputesService {
    constructor(private prisma: PrismaService) {}

    async createDispute(data: {
        reporterId: string;
        reportedId: string;
        bookingId?: string;
        rentalId?: string;
        reason: string;
        description: string;
        evidenceImages?: string[];
    }) {
        const { reporterId, reportedId, bookingId, rentalId, reason, description, evidenceImages } = data;

        // Verify reporter and reported users exist
        const reporter = await this.prisma.user.findUnique({ where: { id: reporterId } });
        const reported = await this.prisma.user.findUnique({ where: { id: reportedId } });

        if (!reporter || !reported) {
            throw new NotFoundException('Reporter or Reported user not found');
        }

        // Verify booking / rental relationship to block unauthorized disputes (IDOR protection)
        if (bookingId) {
            const booking = await this.prisma.booking.findUnique({
                where: { id: bookingId }
            });
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }
            const isParticipant = (booking.customerId === reporterId && booking.providerId === reportedId) ||
                                  (booking.providerId === reporterId && booking.customerId === reportedId);
            if (!isParticipant) {
                throw new BadRequestException('You are not authorized to raise a dispute for this booking');
            }
        }

        if (rentalId) {
            const rental = await (this.prisma as any).toolRental.findUnique({
                where: { id: rentalId },
                include: { tool: true }
            });
            if (!rental) {
                throw new NotFoundException('Rental not found');
            }
            const isParticipant = (rental.customerId === reporterId && rental.tool.ownerId === reportedId) ||
                                  (rental.tool.ownerId === reporterId && rental.customerId === reportedId);
            if (!isParticipant) {
                throw new BadRequestException('You are not authorized to raise a dispute for this rental');
            }
        }

        // Create the dispute
        const dispute = await this.prisma.dispute.create({
            data: {
                reporterId,
                reportedId,
                bookingId: bookingId || null,
                rentalId: rentalId || null,
                reason,
                description,
                evidenceImages: evidenceImages || [],
                status: DisputeStatus.PENDING,
            },
        });

        // If it's a booking, update the booking status to show it is disputed
        if (bookingId) {
            await this.prisma.booking.update({
                where: { id: bookingId },
                data: {
                    isDisputed: true,
                    disputeReason: reason,
                },
            });
        }

        // Send notification to the reported user
        try {
            await this.prisma.notification.create({
                data: {
                    userId: reportedId,
                    title: 'Dispute Raised',
                    message: `A dispute has been raised against you for reason: "${reason}". Our team is reviewing it.`,
                    type: 'DISPUTE_CREATED',
                    linkId: dispute.id,
                },
            });
        } catch (err) {
            console.error('Failed to create notification for reported user:', err);
        }

        return dispute;
    }

    async getDisputes() {
        return this.prisma.dispute.findMany({
            include: {
                reporter: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        profileImage: true,
                    },
                },
                reported: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        profileImage: true,
                    },
                },
                booking: true,
                rental: {
                    include: {
                        tool: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getDisputeById(id: string) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id },
            include: {
                reporter: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        profileImage: true,
                        trustScore: true,
                    },
                },
                reported: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        profileImage: true,
                        trustScore: true,
                    },
                },
                booking: true,
                rental: {
                    include: {
                        tool: true,
                    },
                },
            },
        });

        if (!dispute) {
            throw new NotFoundException(`Dispute with ID ${id} not found`);
        }

        return dispute;
    }

    async resolveDispute(
        id: string,
        data: {
            status: DisputeStatus;
            resolution: string;
            adjustTrustScore?: boolean;
            penaltyAmount?: number;
        },
    ) {
        const { status, resolution, adjustTrustScore, penaltyAmount = 0.5 } = data;

        const dispute = await this.prisma.dispute.findUnique({
            where: { id },
        });

        if (!dispute) {
            throw new NotFoundException(`Dispute with ID ${id} not found`);
        }

        // Update the dispute
        const updatedDispute = await this.prisma.dispute.update({
            where: { id },
            data: {
                status,
                resolution,
            },
        });

        // Apply penalty to reported user if applicable
        if (adjustTrustScore && status === DisputeStatus.RESOLVED) {
            const reportedUser = await this.prisma.user.findUnique({
                where: { id: dispute.reportedId },
            });

            if (reportedUser) {
                const currentScore = reportedUser.trustScore;
                const newScore = Math.max(0.0, currentScore - penaltyAmount);
                const shouldSuspend = newScore < 2.0;

                await this.prisma.user.update({
                    where: { id: dispute.reportedId },
                    data: {
                        trustScore: newScore,
                        isSuspended: shouldSuspend ? true : reportedUser.isSuspended,
                        suspensionReason: shouldSuspend 
                            ? "Trust score fell below safety threshold (2.0)" 
                            : reportedUser.suspensionReason,
                    },
                });
            }
        }

        // Send notifications to both reporter and reported users
        try {
            await this.prisma.notification.create({
                data: {
                    userId: dispute.reporterId,
                    title: 'Dispute Resolved',
                    message: `Your dispute (ID: ${dispute.id.substring(0, 8)}) has been resolved. Outcome: ${status}. Note: ${resolution}`,
                    type: 'DISPUTE_RESOLVED',
                    linkId: dispute.id,
                },
            });

            await this.prisma.notification.create({
                data: {
                    userId: dispute.reportedId,
                    title: 'Dispute Resolution Notification',
                    message: `The dispute against you (ID: ${dispute.id.substring(0, 8)}) is now resolved. Status: ${status}. Note: ${resolution}`,
                    type: 'DISPUTE_RESOLVED',
                    linkId: dispute.id,
                },
            });
        } catch (err) {
            console.error('Failed to create resolution notifications:', err);
        }

        return updatedDispute;
    }
}
