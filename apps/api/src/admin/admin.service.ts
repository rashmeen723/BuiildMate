import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationStatus } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as path from 'path';

const customCategoriesPath = path.join(__dirname, 'custom_categories.json');
const platformSettingsPath = path.join(__dirname, 'platform-settings.json');

const DEFAULT_SERVICES = [
    'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician',
    'Interior Design', 'Cleaning', 'Masonry', 'AC Repair'
];

const DEFAULT_RENTALS = [
    'Power Tools', 'Ladders', 'Painting Equipment', 'Plumbing Equipment',
    'Cleaning Equipment', 'Safety Gear', 'Gardening Tools', 'Scaffolding', 'Other'
];

function readPlatformSettings(): { serviceCommissionRate: number; rentalCommissionRate: number; commissionRate?: number } {
    try {
        if (fs.existsSync(platformSettingsPath)) {
            const data = fs.readFileSync(platformSettingsPath, 'utf-8');
            const parsed = JSON.parse(data);
            return {
                serviceCommissionRate: parsed.serviceCommissionRate ?? parsed.commissionRate ?? 5.0,
                rentalCommissionRate: parsed.rentalCommissionRate ?? parsed.commissionRate ?? 7.0,
                commissionRate: parsed.commissionRate
            };
        }
    } catch (e) {
        console.error("Error reading platform settings:", e);
    }
    return { serviceCommissionRate: 5.0, rentalCommissionRate: 7.0 };
}

function writePlatformSettings(data: { serviceCommissionRate: number; rentalCommissionRate: number; commissionRate?: number }) {
    try {
        fs.writeFileSync(platformSettingsPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error("Error writing platform settings:", e);
    }
}

function readCustomCategories(): { services: string[], rentals: string[], deletedServices?: string[], deletedRentals?: string[] } {
    try {
        if (fs.existsSync(customCategoriesPath)) {
            const data = fs.readFileSync(customCategoriesPath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error("Error reading custom categories:", e);
    }
    return { services: [], rentals: [] };
}

function writeCustomCategories(data: { services: string[], rentals: string[], deletedServices?: string[], deletedRentals?: string[] }) {
    try {
        fs.writeFileSync(customCategoriesPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error("Error writing custom categories:", e);
    }
}

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private mailerService: MailerService,
    ) { }

    async getStats() {
        // 1. Registered Users (all non-admin accounts)
        const registeredUsers = await this.prisma.user.count({
            where: {
                role: { not: 'ADMIN' }
            }
        });

        // 2. Live Rentals (Tool Rentals that are currently active/in progress or confirmed)
        const liveRentals = await this.prisma.toolRental.count({
            where: {
                status: {
                    in: ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS']
                }
            }
        });

        // 3. Monthly Revenue (sum of completed/paid bookings + rentals for current month)
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const currentMonthBookingRev = await this.prisma.booking.aggregate({
            where: {
                bookingDate: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
                status: { in: ['COMPLETED', 'PAID'] }
            },
            _sum: { totalAmount: true }
        });

        const currentMonthRentalRev = await this.prisma.toolRental.aggregate({
            where: {
                startDate: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
                status: { in: ['COMPLETED', 'PAID'] }
            },
            _sum: { totalAmount: true }
        });

        const monthlyRevenue = (currentMonthBookingRev._sum.totalAmount || 0) + (currentMonthRentalRev._sum.totalAmount || 0);

        // 4. Active Disputes
        const activeDisputes = await this.prisma.dispute.count({
            where: {
                status: { in: ['PENDING', 'REVIEWING'] }
            }
        });

        // 5. Monthly Chart Data (last 6 months)
        const monthlyData: any[] = [];
        const monthNames = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
            const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

            const bookingsCount = await this.prisma.booking.count({
                where: {
                    bookingDate: { gte: startOfMonth, lte: endOfMonth },
                    status: { in: ['COMPLETED', 'PAID'] }
                }
            });

            const rentalsCount = await this.prisma.toolRental.count({
                where: {
                    startDate: { gte: startOfMonth, lte: endOfMonth },
                    status: { in: ['COMPLETED', 'PAID'] }
                }
            });

            const monthBookingRevenue = await this.prisma.booking.aggregate({
                where: {
                    bookingDate: { gte: startOfMonth, lte: endOfMonth },
                    status: { in: ['COMPLETED', 'PAID'] }
                },
                _sum: { totalAmount: true }
            });

            const monthRentalRevenue = await this.prisma.toolRental.aggregate({
                where: {
                    startDate: { gte: startOfMonth, lte: endOfMonth },
                    status: { in: ['COMPLETED', 'PAID'] }
                },
                _sum: { totalAmount: true }
            });

            const bookingsTotal = bookingsCount + rentalsCount;
            const revenueTotal = (monthBookingRevenue._sum.totalAmount || 0) + (monthRentalRevenue._sum.totalAmount || 0);

            monthlyData.push({
                month: monthNames[d.getMonth()],
                bookings: bookingsTotal,
                revenue: revenueTotal
            });
        }

        // 6. Tool Utilization Rate
        const totalTools = await this.prisma.tool.count();
        const rentedTools = await this.prisma.tool.count({ where: { status: 'RENTED' } });
        const toolUtilization = totalTools > 0 ? (rentedTools / totalTools) * 100 : 0.0;

        // 7. User Return Rate
        const customersWithMultipleBookings = await this.prisma.booking.groupBy({
            by: ['customerId'],
            _count: { id: true },
            having: {
                customerId: {
                    _count: { gt: 1 }
                }
            }
        });
        const totalCustomers = await this.prisma.user.count({ where: { role: 'HOUSEHOLD' } });
        const userReturnRate = totalCustomers > 0 ? (customersWithMultipleBookings.length / totalCustomers) * 100 : 0.0;

        // 8. AI Verification Success
        const totalDocs = await this.prisma.document.count();
        const passedDocs = await this.prisma.document.count({ where: { status: 'AI_PASSED' } });
        const aiVerificationSuccess = totalDocs > 0 ? (passedDocs / totalDocs) * 100 : 0.0;
        // 9. Escrow Payout Efficiency (Calculated dynamically across both Bookings & Rentals)
        const paidRentals = await this.prisma.toolRental.count({ where: { isPaid: true } });
        const paidBookings = await this.prisma.booking.count({ where: { status: 'PAID' } });

        const totalRentals = await this.prisma.toolRental.count();
        const totalBookings = await this.prisma.booking.count();

        const totalTransactions = totalRentals + totalBookings;
        const totalPaidTransactions = paidRentals + paidBookings;
        const escrowEfficiency = totalTransactions > 0 ? (totalPaidTransactions / totalTransactions) * 100 : 0.0;

        return {
            registeredUsers,
            liveRentals,
            monthlyRevenue,
            activeDisputes,
            monthlyData,
            toolUtilization,
            userReturnRate,
            aiVerificationSuccess,
            escrowEfficiency
        };
    }

    async getPendingVerifications() {
        const providers = await this.prisma.user.findMany({
            where: {
                OR: [
                    { serviceProvider: { isNot: null } },
                    { rentalOwner: { isNot: null } }
                ]
            },
            include: {
                serviceProvider: true,
                rentalOwner: true,
                documents: true,
            }
        });

        const mapped = providers.map(user => {
            const status = user.serviceProvider?.status || user.rentalOwner?.status;
            const aiStatus = user.documents.some(d => d.status === 'AI_FLAGGED') ? 'AI_FLAGGED' :
                (user.documents.every(d => d.status === 'AI_PASSED') ? 'AI_PASSED' : 'PENDING');
            return {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status,
                aiStatus,
                createdAt: user.createdAt
            };
        });

        // Sort: PENDING and AI_FLAGGED first, then others. Within each group, sort by createdAt desc.
        return mapped.sort((a, b) => {
            const score = (status: any) => {
                if (status === 'PENDING') return 0;
                if (status === 'AI_FLAGGED') return 1;
                return 2; // APPROVED, REJECTED, etc.
            };
            const scoreA = score(a.status);
            const scoreB = score(b.status);
            if (scoreA !== scoreB) return scoreA - scoreB;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    async getProviders() {
        const providers = await this.prisma.user.findMany({
            where: {
                role: { not: 'ADMIN' }
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
            status: user.serviceProvider?.status || user.rentalOwner?.status || 'APPROVED',
            trustScore: user.trustScore,
            isSuspended: user.isSuspended,
            suspensionReason: user.suspensionReason,
            createdAt: user.createdAt
        }));
    }

    async getServices() {
        // 1. Get Service Provider counts
        const spGroups = await this.prisma.serviceProviderProfile.groupBy({
            by: ['category'],
            _count: {
                id: true
            }
        });

        // 2. Get Rental Owner tool counts
        const toolsGroups = await this.prisma.tool.groupBy({
            by: ['category'],
            _count: {
                id: true
            }
        });

        const customCats = readCustomCategories();
        const deletedServices = customCats.deletedServices || [];
        const deletedRentals = customCats.deletedRentals || [];

        const activeDefaultServices = DEFAULT_SERVICES.filter(s => !deletedServices.includes(s));
        const activeDefaultRentals = DEFAULT_RENTALS.filter(r => !deletedRentals.includes(r));

        // Map service counts
        const serviceCounts = new Map<string, number>();
        spGroups.forEach(g => {
            serviceCounts.set(g.category, g._count.id);
        });

        // Map rental counts
        const rentalCounts = new Map<string, number>();
        toolsGroups.forEach(g => {
            rentalCounts.set(g.category, g._count.id);
        });

        // Generate final arrays
        const servicesList = Array.from(new Set([...activeDefaultServices, ...(customCats.services || []), ...serviceCounts.keys()]))
            .map(name => ({
                name,
                providers: serviceCounts.get(name) || 0,
                status: "Active",
                type: "SERVICE"
            }));

        const rentalsList = Array.from(new Set([...activeDefaultRentals, ...(customCats.rentals || []), ...rentalCounts.keys()]))
            .map(name => ({
                name,
                providers: rentalCounts.get(name) || 0,
                status: "Active",
                type: "RENTAL"
            }));

        return {
            services: servicesList,
            rentals: rentalsList
        };
    }

    async addCategory(type: 'service' | 'rental', name: string) {
        if (!name || !name.trim()) {
            throw new BadRequestException('Category name cannot be empty');
        }

        const trimmedName = name.trim();
        const customCats = readCustomCategories();

        if (type === 'service') {
            const allServices = [...DEFAULT_SERVICES, ...(customCats.services || [])];
            if (allServices.some(s => s.toLowerCase() === trimmedName.toLowerCase())) {
                throw new ConflictException(`Service category '${trimmedName}' already exists`);
            }
            if (!customCats.services) customCats.services = [];
            customCats.services.push(trimmedName);
            if (customCats.deletedServices) {
                customCats.deletedServices = customCats.deletedServices.filter(s => s.toLowerCase() !== trimmedName.toLowerCase());
            }
        } else if (type === 'rental') {
            const allRentals = [...DEFAULT_RENTALS, ...(customCats.rentals || [])];
            if (allRentals.some(r => r.toLowerCase() === trimmedName.toLowerCase())) {
                throw new ConflictException(`Rental category '${trimmedName}' already exists`);
            }
            if (!customCats.rentals) customCats.rentals = [];
            customCats.rentals.push(trimmedName);
            if (customCats.deletedRentals) {
                customCats.deletedRentals = customCats.deletedRentals.filter(r => r.toLowerCase() !== trimmedName.toLowerCase());
            }
        } else {
            throw new BadRequestException('Invalid category type');
        }

        writeCustomCategories(customCats);
        return { success: true, message: `Category '${trimmedName}' added successfully` };
    }

    async updateCategory(type: 'service' | 'rental', oldName: string, newName: string) {
        if (!newName || !newName.trim()) {
            throw new BadRequestException('New category name cannot be empty');
        }
        if (!oldName || !oldName.trim()) {
            throw new BadRequestException('Old category name cannot be empty');
        }

        const trimmedNewName = newName.trim();
        const trimmedOldName = oldName.trim();

        if (trimmedNewName.toLowerCase() === trimmedOldName.toLowerCase()) {
            return { success: true, message: 'No change' };
        }

        const customCats = readCustomCategories();

        if (type === 'service') {
            const allServices = [...DEFAULT_SERVICES, ...(customCats.services || [])];
            if (allServices.some(s => s.toLowerCase() === trimmedNewName.toLowerCase() && s.toLowerCase() !== trimmedOldName.toLowerCase())) {
                throw new ConflictException(`Service category '${trimmedNewName}' already exists`);
            }

            const isDefault = DEFAULT_SERVICES.some(s => s.toLowerCase() === trimmedOldName.toLowerCase());
            if (isDefault) {
                if (!customCats.deletedServices) customCats.deletedServices = [];
                if (!customCats.deletedServices.includes(trimmedOldName)) {
                    customCats.deletedServices.push(trimmedOldName);
                }
            } else {
                if (customCats.services) {
                    customCats.services = customCats.services.filter(s => s.toLowerCase() !== trimmedOldName.toLowerCase());
                }
            }

            if (!customCats.services) customCats.services = [];
            customCats.services.push(trimmedNewName);
            if (customCats.deletedServices) {
                customCats.deletedServices = customCats.deletedServices.filter(s => s.toLowerCase() !== trimmedNewName.toLowerCase());
            }

            writeCustomCategories(customCats);

            await this.prisma.serviceProviderProfile.updateMany({
                where: { category: trimmedOldName },
                data: { category: trimmedNewName }
            });

            return { success: true, message: `Category '${trimmedOldName}' renamed to '${trimmedNewName}' successfully` };

        } else if (type === 'rental') {
            const allRentals = [...DEFAULT_RENTALS, ...(customCats.rentals || [])];
            if (allRentals.some(r => r.toLowerCase() === trimmedNewName.toLowerCase() && r.toLowerCase() !== trimmedOldName.toLowerCase())) {
                throw new ConflictException(`Rental category '${trimmedNewName}' already exists`);
            }

            const isDefault = DEFAULT_RENTALS.some(r => r.toLowerCase() === trimmedOldName.toLowerCase());
            if (isDefault) {
                if (!customCats.deletedRentals) customCats.deletedRentals = [];
                if (!customCats.deletedRentals.includes(trimmedOldName)) {
                    customCats.deletedRentals.push(trimmedOldName);
                }
            } else {
                if (customCats.rentals) {
                    customCats.rentals = customCats.rentals.filter(r => r.toLowerCase() !== trimmedOldName.toLowerCase());
                }
            }

            if (!customCats.rentals) customCats.rentals = [];
            customCats.rentals.push(trimmedNewName);
            if (customCats.deletedRentals) {
                customCats.deletedRentals = customCats.deletedRentals.filter(r => r.toLowerCase() !== trimmedNewName.toLowerCase());
            }

            writeCustomCategories(customCats);

            await this.prisma.tool.updateMany({
                where: { category: trimmedOldName },
                data: { category: trimmedNewName }
            });

            const owners = await this.prisma.rentalOwnerProfile.findMany({
                where: { toolCategories: { has: trimmedOldName } }
            });

            for (const owner of owners) {
                const updatedCats = owner.toolCategories.map(c => c === trimmedOldName ? trimmedNewName : c);
                await this.prisma.rentalOwnerProfile.update({
                    where: { id: owner.id },
                    data: { toolCategories: updatedCats }
                });
            }

            return { success: true, message: `Category '${trimmedOldName}' renamed to '${trimmedNewName}' successfully` };
        } else {
            throw new BadRequestException('Invalid category type');
        }
    }

    async deleteCategory(type: string, name: string) {
        const customCats = readCustomCategories();

        if (type === 'service') {
            const isDefault = DEFAULT_SERVICES.includes(name);
            if (isDefault) {
                if (!customCats.deletedServices) customCats.deletedServices = [];
                if (!customCats.deletedServices.includes(name)) {
                    customCats.deletedServices.push(name);
                }
            } else {
                if (customCats.services) {
                    customCats.services = customCats.services.filter(s => s !== name);
                }
            }
            writeCustomCategories(customCats);

            await this.prisma.serviceProviderProfile.updateMany({
                where: { category: name },
                data: { category: 'Other' }
            });
            return { message: `Service category '${name}' deleted successfully.` };
        } else if (type === 'rental') {
            const isDefault = DEFAULT_RENTALS.includes(name);
            if (isDefault) {
                if (!customCats.deletedRentals) customCats.deletedRentals = [];
                if (!customCats.deletedRentals.includes(name)) {
                    customCats.deletedRentals.push(name);
                }
            } else {
                if (customCats.rentals) {
                    customCats.rentals = customCats.rentals.filter(r => r !== name);
                }
            }
            writeCustomCategories(customCats);

            await this.prisma.tool.updateMany({
                where: { category: name },
                data: { category: 'Other' }
            });

            const owners = await this.prisma.rentalOwnerProfile.findMany({
                where: { toolCategories: { has: name } }
            });

            for (const owner of owners) {
                const updatedCats = owner.toolCategories.filter(c => c !== name);
                if (updatedCats.length === 0) {
                    updatedCats.push('Other');
                }
                await this.prisma.rentalOwnerProfile.update({
                    where: { id: owner.id },
                    data: { toolCategories: updatedCats }
                });
            }

            return { message: `Rental category '${name}' deleted successfully.` };
        }
        throw new BadRequestException('Invalid category type');
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

    async updateVerificationStatus(userId: string, status: VerificationStatus, reason?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                serviceProvider: true,
                rentalOwner: true,
                documents: true
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (status === 'APPROVED') {
            const badgesToGrant: any[] = [];

            if (user.serviceProvider) {
                const hasUtilityBill = user.documents.some(d => d.documentType === 'UTILITY_BILL');
                if (hasUtilityBill) {
                    badgesToGrant.push('ADDRESS_VERIFIED');
                }
            }

            if (user.rentalOwner) {
                const hasBrDoc = user.documents.some(d => d.documentType === 'BUSINESS_PERMIT');
                if (hasBrDoc) {
                    badgesToGrant.push('BUSINESS_VERIFIED');
                }
                const hasUtilityBill = user.documents.some(d => d.documentType === 'UTILITY_BILL');
                if (hasUtilityBill) {
                    badgesToGrant.push('ADDRESS_VERIFIED');
                }
            }

            const updatedBadges = Array.from(new Set([...user.badges, ...badgesToGrant]));

            await this.prisma.user.update({
                where: { id: userId },
                data: { badges: updatedBadges as any[] }
            });
        }

        // Notify user about status change
        const isApproved = status === 'APPROVED';
        const rejectionReason = reason || 'Your uploaded documents do not match your profile details or are invalid/blurry.';
        const notificationTitle = isApproved ? 'Verification Approved! 🎉' : 'Verification Rejected ⚠️';
        const notificationMessage = isApproved
            ? 'Congratulations! Your document verification has been approved. You are now fully verified on BuildMate.'
            : `Your document verification was rejected by the administrator. Reason: ${rejectionReason}`;

        await this.prisma.notification.create({
            data: {
                userId,
                title: notificationTitle,
                message: notificationMessage,
                type: 'STATUS_UPDATE',
            }
        }).catch(err => {
            console.error(`Failed to create verification notification for user ${userId}:`, err);
        });

        // Send Email Notification
        this.mailerService.sendMail({
            to: user.email,
            subject: `BuildMate Profile Verification: ${isApproved ? 'Approved' : 'Action Required'}`,
            text: isApproved
                ? `Hello ${user.fullName},\n\nWe are pleased to inform you that your document verification has been approved. Your profile is now active on the BuildMate platform.\n\nBest Regards,\nThe BuildMate Trust Team`
                : `Hello ${user.fullName},\n\nWe regret to inform you that your document verification was rejected. Reason: ${rejectionReason}\n\nPlease review your profile, update your documents, and re-submit them.\n\nBest Regards,\nThe BuildMate Trust Team`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #14213D; border-bottom: 2px solid ${isApproved ? '#10B981' : '#EF4444'}; padding-bottom: 10px;">
                        BuildMate Profile Verification Status
                    </h2>
                    <p>Hello <strong>${user.fullName}</strong>,</p>
                    ${isApproved ? `
                        <p>We are pleased to inform you that your document verification has been successfully approved! Your profile is now active, and you can start listing tools or accepting service bookings on BuildMate.</p>
                        <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; border-radius: 4px; margin: 20px 0;">
                            <strong style="color: #065F46;">Status: Verified & Approved</strong>
                        </div>
                    ` : `
                        <p>We regret to inform you that your document verification was rejected by our review team. To list tools or services, please log into your account, check your details, and upload valid documents (such as utility bills or business permits).</p>
                        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
                            <strong style="color: #991B1B;">Status: Rejected & Awaiting Re-submission</strong><br/>
                            <p style="margin: 8px 0 0 0; color: #7F1D1D; font-size: 14px;"><strong>Reason for Rejection:</strong> ${rejectionReason}</p>
                        </div>
                        <p style="background-color: #F8FAFC; padding: 12px; border-radius: 4px; border: 1px dashed #E2E8F0; font-size: 13px;">
                            <strong>Need help?</strong> If you have any questions or concern regarding this verification rejection, please contact the BuildMate Support Team via email at <a href="mailto:support@buildmate.lk">support@buildmate.lk</a> or call our hotline at <strong>+94 11 234 5678</strong> (Weekdays 9 AM - 5 PM).
                        </p>
                    `}
                    <p>Thank you for partnering with us to build a trusted community.</p>
                    <br/>
                    <p style="color: #6B7280; font-size: 12px; border-top: 1px solid #E5E7EB; padding-top: 15px;">
                        Best Regards,<br/>
                        <strong>The BuildMate Trust Team</strong>
                    </p>
                </div>
            `
        }).catch(err => {
            console.error(`Failed to send verification status email to user ${user.email}:`, err);
        });

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

    async suspendUser(userId: string, reason: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isSuspended: true,
                suspensionReason: reason || 'Suspended by Administrator',
            },
        });
    }

    async unsuspendUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isSuspended: false,
                suspensionReason: null,
                trustScore: 5.0,
            },
        });
    }


    async getMonthlyReportData() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // --- FINANCIAL METRICS ---
        const bookings = await this.prisma.booking.findMany({
            where: {
                bookingDate: { gte: startOfMonth, lte: endOfMonth },
                status: { in: ['COMPLETED', 'PAID'] }
            }
        });

        const rentals = await this.prisma.toolRental.findMany({
            where: {
                startDate: { gte: startOfMonth, lte: endOfMonth },
                status: { in: ['COMPLETED', 'PAID'] }
            }
        });

        const platformSettings = readPlatformSettings();
        const serviceRateFactor = (platformSettings.serviceCommissionRate ?? 5.0) / 100;
        const rentalRateFactor = (platformSettings.rentalCommissionRate ?? 7.0) / 100;

        const bookingsRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const bookingsProfit = bookings.reduce((sum, b) => sum + (b.platformFee || (b.totalAmount || 0) * serviceRateFactor), 0);

        const rentalsRevenue = rentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
        const rentalsProfit = rentals.reduce((sum, r) => sum + ((r as any).platformFee || (r.totalAmount || 0) * rentalRateFactor), 0);

        // Payment Method splits
        const cashRentalsCount = rentals.filter(r => r.paymentMethod === 'CASH').length;
        const cardRentalsCount = rentals.filter(r => r.paymentMethod === 'CARD').length;
        const cashRentalsRevenue = rentals.filter(r => r.paymentMethod === 'CASH').reduce((sum, r) => sum + (r.totalAmount || 0), 0);
        const cardRentalsRevenue = rentals.filter(r => r.paymentMethod === 'CARD').reduce((sum, r) => sum + (r.totalAmount || 0), 0);

        const totalRevenue = bookingsRevenue + rentalsRevenue;
        const totalProfit = bookingsProfit + rentalsProfit;
        const netPayouts = totalRevenue - totalProfit;

        // --- MARKETING & TRUST METRICS ---
        const newHouseholds = await this.prisma.user.count({
            where: {
                role: 'HOUSEHOLD',
                createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
        });
        const newProviders = await this.prisma.user.count({
            where: {
                role: 'SERVICE_PROVIDER',
                createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
        });
        const newOwners = await this.prisma.user.count({
            where: {
                role: 'RENTAL_OWNER',
                createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
        });

        const bookingGroup = await this.prisma.booking.groupBy({
            by: ['serviceType'],
            where: {
                bookingDate: { gte: startOfMonth, lte: endOfMonth }
            },
            _count: { id: true },
            orderBy: {
                _count: { id: 'desc' }
            },
            take: 1
        });
        const topService = bookingGroup[0]?.serviceType || "None";

        const rentalGroup = await this.prisma.toolRental.groupBy({
            by: ['toolId'],
            where: {
                startDate: { gte: startOfMonth, lte: endOfMonth }
            },
            _count: { id: true },
            orderBy: {
                _count: { id: 'desc' }
            },
            take: 1
        });

        let topTool = "None";
        if (rentalGroup[0]?.toolId) {
            const toolObj = await this.prisma.tool.findUnique({
                where: { id: rentalGroup[0].toolId }
            });
            if (toolObj) {
                topTool = toolObj.name;
            }
        }

        // Trust Safety Disputes
        const disputesLogged = await this.prisma.dispute.count({
            where: {
                createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
        });
        const disputesResolved = await this.prisma.dispute.count({
            where: {
                createdAt: { gte: startOfMonth, lte: endOfMonth },
                status: { in: ['RESOLVED', 'DISMISSED'] }
            }
        });
        const totalSuspensions = await this.prisma.user.count({
            where: {
                isSuspended: true,
                updatedAt: { gte: startOfMonth, lte: endOfMonth }
            }
        });

        // --- LOCATION ANALYSIS ---
        const bookingsWithLocation = await this.prisma.booking.findMany({
            where: {
                bookingDate: { gte: startOfMonth, lte: endOfMonth }
            },
            select: { address: true }
        });
        const rentalsWithLocation = await this.prisma.toolRental.findMany({
            where: {
                startDate: { gte: startOfMonth, lte: endOfMonth }
            },
            select: { pickupLocation: true }
        });

        const cityActivity: { [key: string]: number } = {};
        const addActivity = (addressStr: string | null) => {
            if (!addressStr) return;
            const parts = addressStr.split(',');
            const city = parts[parts.length - 1].trim();
            if (city) {
                cityActivity[city] = (cityActivity[city] || 0) + 1;
            }
        };

        bookingsWithLocation.forEach(b => addActivity(b.address));
        rentalsWithLocation.forEach(r => addActivity(r.pickupLocation));

        let topBookingLocation = "None";
        let maxAct = 0;
        let leastBookingLocation = "None";
        let minAct = Infinity;

        for (const city of Object.keys(cityActivity)) {
            const count = cityActivity[city];
            if (count > maxAct) {
                maxAct = count;
                topBookingLocation = `${city} (${count} orders)`;
            }
            if (count < minAct) {
                minAct = count;
                leastBookingLocation = `${city} (${count} orders)`;
            }
        }
        if (leastBookingLocation === "None" && Object.keys(cityActivity).length > 0) {
            leastBookingLocation = Object.keys(cityActivity)[0] + ` (${cityActivity[Object.keys(cityActivity)[0]]} orders)`;
        }

        const reviewsThisMonth = await this.prisma.review.findMany({
            where: {
                createdAt: { gte: startOfMonth, lte: endOfMonth }
            },
            include: {
                booking: true,
                rental: true
            }
        });

        const locationRatings: { [key: string]: { sum: number, count: number } } = {};
        for (const r of reviewsThisMonth) {
            let addressStr = "";
            if (r.booking) {
                addressStr = r.booking.address;
            } else if (r.rental && r.rental.pickupLocation) {
                addressStr = r.rental.pickupLocation;
            }

            if (!addressStr) continue;
            const parts = addressStr.split(',');
            const city = parts[parts.length - 1].trim();
            if (city) {
                if (!locationRatings[city]) {
                    locationRatings[city] = { sum: 0, count: 0 };
                }
                locationRatings[city].sum += r.rating;
                locationRatings[city].count += 1;
            }
        }

        let topRatedArea = "None";
        let maxAvg = 0;

        for (const city of Object.keys(locationRatings)) {
            const avg = locationRatings[city].sum / locationRatings[city].count;
            if (avg > maxAvg) {
                maxAvg = avg;
                topRatedArea = `${city} (${avg.toFixed(1)} ★)`;
            }
        }

        return {
            financials: {
                month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
                bookingsCount: bookings.length,
                rentalsCount: rentals.length,
                bookingsRevenue,
                bookingsProfit,
                rentalsRevenue,
                rentalsProfit,
                cashRentalsCount,
                cardRentalsCount,
                cashRentalsRevenue,
                cardRentalsRevenue,
                totalRevenue,
                totalProfit,
                netPayouts
            },
            marketing: {
                month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
                newHouseholds,
                newProviders,
                newOwners,
                totalNewSignups: newHouseholds + newProviders + newOwners,
                topService,
                topTool,
                disputesLogged,
                disputesResolved,
                totalSuspensions,
                topRatedArea,
                topBookingLocation,
                leastBookingLocation
            }
        };
    }

    getPlatformSettings() {
        return readPlatformSettings();
    }

    async updatePlatformSettings(data: { serviceCommissionRate?: number; rentalCommissionRate?: number; commissionRate?: number }) {
        const current = readPlatformSettings();

        const serviceRate = data.serviceCommissionRate !== undefined ? data.serviceCommissionRate : (data.commissionRate ?? current.serviceCommissionRate);
        const rentalRate = data.rentalCommissionRate !== undefined ? data.rentalCommissionRate : (data.commissionRate ?? current.rentalCommissionRate);

        if (typeof serviceRate !== 'number' || serviceRate < 0 || serviceRate > 100) {
            throw new BadRequestException('Service commission rate must be a percentage value between 0 and 100.');
        }
        if (typeof rentalRate !== 'number' || rentalRate < 0 || rentalRate > 100) {
            throw new BadRequestException('Rental commission rate must be a percentage value between 0 and 100.');
        }

        writePlatformSettings({
            serviceCommissionRate: serviceRate,
            rentalCommissionRate: rentalRate
        });

        // Notify all active system users of commission adjustments
        try {
            const users = await this.prisma.user.findMany({
                where: {
                    role: { in: ['SERVICE_PROVIDER', 'RENTAL_OWNER', 'HOUSEHOLD'] }
                },
                select: { id: true }
            });

            const notificationsData = users.map(user => ({
                userId: user.id,
                title: 'Marketplace Commission Adjusted',
                message: `Please be advised that the platform commission fees have been updated: Service booking fee is now ${serviceRate.toFixed(1)}% and Equipment rental fee is ${rentalRate.toFixed(1)}% per completed transaction.`,
                type: 'COMMISSION_UPDATE'
            }));

            if (notificationsData.length > 0) {
                await this.prisma.notification.createMany({
                    data: notificationsData
                });
            }
        } catch (err) {
            console.error('Failed to dispatch commission update notifications:', err);
        }

        return { message: 'Platform settings updated successfully', settings: readPlatformSettings() };
    }

    async broadcastAnnouncement(data: { title: string; message: string; targetAudience: 'ALL' | 'SERVICE_PROVIDER' | 'RENTAL_OWNER' | 'HOUSEHOLD' }) {
        const { title, message, targetAudience } = data;
        if (!title || !message) {
            throw new BadRequestException('Announcement title and message are required.');
        }

        let roles: string[] = [];
        if (targetAudience === 'ALL') {
            roles = ['SERVICE_PROVIDER', 'RENTAL_OWNER', 'HOUSEHOLD'];
        } else {
            roles = [targetAudience];
        }

        const users = await this.prisma.user.findMany({
            where: { role: { in: roles as any } },
            select: { id: true }
        });

        if (users.length === 0) {
            return { message: 'No users found matching target audience criteria.', count: 0 };
        }

        const notificationsData = users.map(user => ({
            userId: user.id,
            title,
            message,
            type: 'SYSTEM_BROADCAST'
        }));

        await this.prisma.notification.createMany({
            data: notificationsData
        });

        return { message: `Announcement dispatched successfully!`, count: users.length };
    }
}
