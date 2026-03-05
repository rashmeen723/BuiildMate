import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getPendingVerifications() {
        const providers = await this.prisma.user.findMany({
            where: {
                OR: [
                    { serviceProvider: { status: VerificationStatus.PENDING } },
                    { rentalOwner: { status: VerificationStatus.PENDING } }
                ]
            },
            include: {
                serviceProvider: true,
                rentalOwner: true,
            }
        });

        return providers.map(user => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.serviceProvider?.status || user.rentalOwner?.status,
            createdAt: user.createdAt
        }));
    }

    async getVerificationDetails(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                serviceProvider: true,
                rentalOwner: true,
                documents: true,
                addresses: true
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateVerificationStatus(userId: string, status: VerificationStatus) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { serviceProvider: true, rentalOwner: true }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.serviceProvider) {
            return this.prisma.serviceProviderProfile.update({
                where: { userId },
                data: { status }
            });
        }

        if (user.rentalOwner) {
            return this.prisma.rentalOwnerProfile.update({
                where: { userId },
                data: { status }
            });
        }

        throw new NotFoundException('User does not have a professional profile');
    }
}
