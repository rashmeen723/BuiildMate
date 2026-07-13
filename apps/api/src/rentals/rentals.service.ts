import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { recalculateUserTrustScore } from '../utils/trust-score';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RentalsService {
    constructor(private prisma: PrismaService) { }

    async getToolsByOwner(userId: string) {
        const owner = await this.prisma.rentalOwnerProfile.findUnique({
            where: { userId },
        });

        if (!owner) return [];

        return this.prisma.tool.findMany({
            where: { ownerId: owner.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async addTool(userId: string, data: {
        name: string;
        description: string;
        category: string;
        dailyRate: number;
        images?: string[];
    }) {
        const owner = await this.prisma.rentalOwnerProfile.findUnique({
            where: { userId },
        });

        if (!owner) throw new Error('Rental owner profile not found');

        return this.prisma.tool.create({
            data: {
                ...data,
                ownerId: owner.id,
            },
        });
    }

    async updateTool(toolId: string, data: any) {
        return this.prisma.tool.update({
            where: { id: toolId },
            data,
        });
    }

    async deleteTool(toolId: string) {
        const rentalCount = await this.prisma.toolRental.count({
            where: { toolId },
        });

        if (rentalCount === 0) {
            return this.prisma.tool.delete({
                where: { id: toolId },
            });
        } else {
            return this.prisma.tool.update({
                where: { id: toolId },
                data: {
                    available: false,
                    status: 'DELETED',
                },
            });
        }
    }

    async getStats(userId: string) {
        const owner = await this.prisma.rentalOwnerProfile.findUnique({
            where: { userId },
        });

        if (!owner) return { earnings: 0, pendingPickups: 0, activeRentals: 0 };

        const tools = await this.prisma.tool.findMany({
            where: { ownerId: owner.id },
            include: { rentals: true },
        });

        const activeRentals = tools.filter(t => t.status === 'RENTED').length;

        const rentals = await this.prisma.toolRental.findMany({
            where: { tool: { ownerId: owner.id }, status: 'PAID' },
        });

        const earnings = rentals.reduce((sum, r) => sum + r.totalAmount, 0);

        const pendingPickups = await this.prisma.toolRental.count({
            where: { tool: { ownerId: owner.id }, status: 'CONFIRMED' },
        });

        return {
            earnings,
            pendingPickups,
            activeRentals,
        };
    }

    async getOwnerRentals(userId: string) {
        const owner = await this.prisma.rentalOwnerProfile.findUnique({
            where: { userId },
        });

        if (!owner) return [];

        return this.prisma.toolRental.findMany({
            where: {
                tool: {
                    ownerId: owner.id,
                },
            },
            include: {
                tool: true,
                customer: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImage: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getToolsByCategory(category: string) {
        const tools = await (this.prisma.tool as any).findMany({
            where: {
                category,
                status: 'AVAILABLE'
            },
            include: {
                owner: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                profileImage: true,
                                phone: true
                            }
                        }
                    }
                },
                rentals: {
                    include: {
                        reviews: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return tools.map((tool: any) => {
            const allReviews = tool.rentals.flatMap((r: any) => r.reviews || []);
            const averageRating = allReviews.length > 0
                ? (allReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / allReviews.length)
                : 0; // Default to 0 for new tools or similar to what UI expects
            return {
                ...tool,
                rating: averageRating,
                reviewCount: allReviews.length
            };
        });
    }

    async getToolById(id: string) {
        const tool = await (this.prisma.tool as any).findUnique({
            where: { id },
            include: {
                owner: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                profileImage: true,
                                phone: true
                            }
                        }
                    }
                },
                rentals: {
                    include: {
                        reviews: true
                    }
                }
            }
        });

        if (!tool) return null;

        const allReviews = tool.rentals.flatMap((r: any) => r.reviews || []);
        const averageRating = allReviews.length > 0
            ? (allReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / allReviews.length)
            : 0;

        return {
            ...tool,
            rating: averageRating,
            reviewCount: allReviews.length
        };
    }

    async createRental(data: {
        toolId: string;
        customerId: string;
        startDate: string;
        endDate: string;
        totalAmount: number;
        pickupLocation?: string;
        paymentMethod?: string;
        isPaid?: boolean;
    }) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (end < start) {
            throw new BadRequestException('End date cannot be prior to start date');
        }

        const tool = await this.prisma.tool.findUnique({
            where: { id: data.toolId },
            include: { owner: true }
        });

        if (!tool || tool.status !== 'AVAILABLE') {
            throw new BadRequestException('This tool is currently not available for rent.');
        }

        let rateFactor = 0.07; // Default to 7% for rentals
        try {
            const settingsPath = path.join(__dirname, '..', 'admin', 'platform-settings.json');
            if (fs.existsSync(settingsPath)) {
                const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
                if (typeof settingsData.rentalCommissionRate === 'number') {
                    rateFactor = settingsData.rentalCommissionRate / 100;
                } else if (typeof settingsData.commissionRate === 'number') {
                    rateFactor = settingsData.commissionRate / 100;
                }
            }
        } catch (e) {
            console.error("Error reading platform settings in rentals:", e);
        }

        const platformFee = data.totalAmount * rateFactor;
        const totalAmountWithFee = data.totalAmount + platformFee;

        const rental = await this.prisma.toolRental.create({
            data: {
                toolId: data.toolId,
                customerId: data.customerId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                totalAmount: totalAmountWithFee,
                platformFee: platformFee,
                status: 'PENDING',
                pickupLocation: data.pickupLocation,
                paymentMethod: data.paymentMethod || 'CASH',
                isPaid: data.isPaid || false,
            } as any,
        });

        if (tool && tool.owner) {
            try {
                await (this.prisma as any).notification.create({
                    data: {
                        userId: tool.owner.userId,
                        title: 'New Rental Request',
                        message: `You have a new rental request for ${tool.name}.`,
                        type: 'RENTAL_REQUEST',
                        linkId: rental.id,
                        data: {}
                    }
                });
            } catch (error) {
                console.error('Error creating notification:', error);
            }
        }

        return rental;
    }

    async updateRentalStatus(rentalId: string, status: string, pickupPhotos?: string[], returnPhotos?: string[]) {
        const existingRental = await this.prisma.toolRental.findUnique({
            where: { id: rentalId },
            include: { tool: { include: { owner: true } } }
        });

        if (!existingRental) {
            throw new BadRequestException('Rental record not found');
        }

        if (status === 'CONFIRMED' && existingRental.tool.status === 'RENTED') {
            throw new BadRequestException('This tool is already rented out to another customer.');
        }

        const updateData: any = { status: status as any };
        if (status === 'PAID') {
            updateData.isPaid = true;
        }
        if (pickupPhotos && pickupPhotos.length > 0) {
            updateData.pickupPhotos = pickupPhotos;
        }
        if (returnPhotos && returnPhotos.length > 0) {
            updateData.returnPhotos = returnPhotos;
        }

        const rental = await this.prisma.toolRental.update({
            where: { id: rentalId },
            data: updateData,
            include: { tool: true }
        });

        // If marked as CONFIRMED or PAID and it's currently active, update tool status
        if (status === 'CONFIRMED' || status === 'ON_THE_WAY' || status === 'IN_PROGRESS' || status === 'PAID') {
            await this.prisma.tool.update({
                where: { id: rental.toolId },
                data: { status: 'RENTED' }
            });
        }

        // If COMPLETED or CANCELLED, mark tool as AVAILABLE
        if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'REJECTED') {
            await this.prisma.tool.update({
                where: { id: rental.toolId },
                data: { status: 'AVAILABLE' }
            });
        }

        try {
            await (this.prisma as any).notification.create({
                data: {
                    userId: rental.customerId,
                    title: 'Rental Status Updated',
                    message: `Your rental for ${rental.tool?.name} is now ${status}.`,
                    type: 'RENTAL_UPDATE',
                    linkId: rental.id,
                    data: {}
                }
            });
        } catch (error) {
            console.error('Error creating notification:', error);
        }

        // Recalculate trust score for the tool owner if rental is completed, paid, or cancelled
        if (existingRental && ['COMPLETED', 'PAID', 'CANCELLED'].includes(status)) {
            await recalculateUserTrustScore(this.prisma, existingRental.tool.owner.userId).catch(err => {
                console.error(`Failed to recalculate trust score for tool owner ${existingRental.tool.owner.userId}:`, err);
            });
        }

        return rental;
    }

    async getUserRentals(userId: string) {
        return (this.prisma.toolRental as any).findMany({
            where: { customerId: userId },
            include: {
                tool: {
                    include: {
                        owner: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        profileImage: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                },
                reviews: true
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getRentalById(id: string) {
        return (this.prisma.toolRental as any).findUnique({
            where: { id },
            include: {
                tool: {
                    include: {
                        owner: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        profileImage: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                },
                reviews: true
            }
        });
    }

    async getToolReviews(toolId: string) {
        return (this.prisma.review as any).findMany({
            where: {
                rental: {
                    toolId: toolId
                }
            },
            include: {
                reviewer: {
                    select: {
                        fullName: true,
                        profileImage: true
                    }
                },
                rental: {
                    include: {
                        tool: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getNearbyTools(lat: number, lng: number, radius: number = 50) {
        const tools = await (this.prisma.tool as any).findMany({
            where: {
                status: 'AVAILABLE',
                owner: {
                    status: 'APPROVED'
                }
            },
            include: {
                owner: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                profileImage: true,
                            }
                        }
                    }
                },
                rentals: {
                    include: {
                        reviews: true
                    }
                }
            }
        });

        const toolsWithMetrics = tools.map((tool: any) => {
            const allReviews = tool.rentals.flatMap((r: any) => r.reviews || []);
            const averageRating = allReviews.length > 0
                ? (allReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / allReviews.length)
                : 0;

            const distance = this.calculateDistance(
                lat,
                lng,
                tool.owner.latitude || 0,
                tool.owner.longitude || 0
            );

            return {
                ...tool,
                rating: averageRating,
                reviewCount: allReviews.length,
                distance: parseFloat(distance.toFixed(1))
            };
        });

        return toolsWithMetrics
            .filter(t => t.distance <= radius)
            .sort((a, b) => {
                if (b.rating !== a.rating) return b.rating - a.rating;
                return a.distance - b.distance;
            });
    }

    async requestExtension(rentalId: string, extensionDays: number) {
        const rental = await this.prisma.toolRental.findUnique({
            where: { id: rentalId },
            include: { tool: { include: { owner: true } } }
        });

        if (!rental) throw new Error('Rental not found');
        if (rental.status !== 'IN_PROGRESS' && rental.status !== 'CONFIRMED') {
            throw new Error('Can only extend active or confirmed rentals');
        }

        const extensionCost = extensionDays * rental.tool.dailyRate;

        const updated = await this.prisma.toolRental.update({
            where: { id: rentalId },
            data: {
                extensionDays,
                extensionCost,
                extensionStatus: 'PENDING'
            }
        });

        if (rental.tool?.owner) {
            try {
                await (this.prisma as any).notification.create({
                    data: {
                        userId: rental.tool.owner.userId,
                        title: 'Extension Request Received',
                        message: `The customer has requested to extend the rental of ${rental.tool.name} by ${extensionDays} days.`,
                        type: 'RENTAL_EXTENSION_REQUEST',
                        linkId: rental.id,
                        data: {}
                    }
                });
            } catch (error) {
                console.error('Error creating notification:', error);
            }
        }

        return updated;
    }

    async approveExtension(rentalId: string) {
        const rental = await this.prisma.toolRental.findUnique({
            where: { id: rentalId },
            include: { tool: true }
        });

        if (!rental) throw new Error('Rental not found');
        if (rental.extensionStatus !== 'PENDING' || !rental.extensionDays) {
            throw new Error('No pending extension request found');
        }

        const newEndDate = new Date(rental.endDate);
        newEndDate.setDate(newEndDate.getDate() + rental.extensionDays);

        const newTotalAmount = rental.totalAmount + (rental.extensionCost || 0);

        const updated = await this.prisma.toolRental.update({
            where: { id: rentalId },
            data: {
                endDate: newEndDate,
                totalAmount: newTotalAmount,
                extensionStatus: 'APPROVED'
            }
        });

        try {
            await (this.prisma as any).notification.create({
                data: {
                    userId: rental.customerId,
                    title: 'Extension Approved!',
                    message: `Your extension request for ${rental.tool?.name} has been approved. New due date is ${newEndDate.toLocaleDateString()}.`,
                    type: 'RENTAL_EXTENSION_APPROVED',
                    linkId: rental.id,
                    data: {}
                }
            });
        } catch (error) {
            console.error('Error creating notification:', error);
        }

        return updated;
    }

    async rejectExtension(rentalId: string) {
        const rental = await this.prisma.toolRental.findUnique({
            where: { id: rentalId },
            include: { tool: true }
        });

        if (!rental) throw new Error('Rental not found');
        if (rental.extensionStatus !== 'PENDING') {
            throw new Error('No pending extension request found');
        }

        const updated = await this.prisma.toolRental.update({
            where: { id: rentalId },
            data: {
                extensionStatus: 'REJECTED'
            }
        });

        try {
            await (this.prisma as any).notification.create({
                data: {
                    userId: rental.customerId,
                    title: 'Extension Declined',
                    message: `Your extension request for ${rental.tool?.name} has been declined.`,
                    type: 'RENTAL_EXTENSION_REJECTED',
                    linkId: rental.id,
                    data: {}
                }
            });
        } catch (error) {
            console.error('Error creating notification:', error);
        }

        return updated;
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }
}
