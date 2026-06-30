import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ServicesService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    onModuleInit() {
        this.checkAndSendReminders().catch(err => console.error('Error in initial reminder check:', err));
        setInterval(() => {
            this.checkAndSendReminders().catch(err => console.error('Error in reminder checker loop:', err));
        }, 5 * 60 * 1000);
    }

    private getBookingStartDateTime(bookingDate: Date, startTimeStr: string): Date {
        const date = new Date(bookingDate);
        const match = startTimeStr.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
        if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const ampm = match[3].toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            date.setHours(hours, minutes, 0, 0);
        } else {
            date.setHours(9, 0, 0, 0);
        }
        return date;
    }

    async checkAndSendReminders() {
        const now = new Date();
        const minDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const bookings = await (this.prisma as any).booking.findMany({
            where: {
                status: 'CONFIRMED',
                bookingDate: {
                    gte: minDate,
                    lte: maxDate
                }
            }
        });

        for (const booking of bookings) {
            const startDateTime = this.getBookingStartDateTime(booking.bookingDate, booking.startTime);
            const diffMs = startDateTime.getTime() - now.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours <= 24 && diffHours > 0) {
                const alreadySent = await (this.prisma as any).notification.findFirst({
                    where: {
                        linkId: booking.id,
                        type: 'REMINDER_1DAY'
                    }
                });
                if (!alreadySent) {
                    await this.createNotification(
                        booking.customerId,
                        'Upcoming Service Reminder',
                        `Your booking for ${booking.serviceType} is scheduled for tomorrow at ${booking.startTime}.`,
                        'REMINDER_1DAY',
                        booking.id
                    );
                    await this.createNotification(
                        booking.providerId,
                        'Upcoming Job Reminder',
                        `You have a scheduled job for ${booking.serviceType} tomorrow at ${booking.startTime}.`,
                        'REMINDER_1DAY',
                        booking.id
                    );
                }
            }

            if (diffHours <= 1 && diffHours > 0) {
                const alreadySent = await (this.prisma as any).notification.findFirst({
                    where: {
                        linkId: booking.id,
                        type: 'REMINDER_1HOUR'
                    }
                });
                if (!alreadySent) {
                    await this.createNotification(
                        booking.customerId,
                        'Upcoming Service Reminder',
                        `Your booking for ${booking.serviceType} starts in 1 hour at ${booking.startTime}.`,
                        'REMINDER_1HOUR',
                        booking.id
                    );
                    await this.createNotification(
                        booking.providerId,
                        'Upcoming Job Reminder',
                        `You have a scheduled job for ${booking.serviceType} starting in 1 hour at ${booking.startTime}.`,
                        'REMINDER_1HOUR',
                        booking.id
                    );
                }
            }
        }
    }

    async getNearbyProviders(lat: number, lng: number, radius: number = 20, category?: string, dateStr?: string, timeStr?: string) {
        const now = dateStr ? new Date(dateStr) : new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDay = days[now.getDay()];

        let currentTimeString: string;
        if (timeStr) {
            currentTimeString = timeStr; // Expected format like "10:00 AM"
        } else {
            currentTimeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }

        const providers = await this.prisma.user.findMany({
            where: {
                serviceProvider: {
                    status: VerificationStatus.APPROVED,
                    ...(category && { category: category })
                }
            },
            include: {
                serviceProvider: true,
                reviewsReceived: true
            }
        }) as any[];

        let conflictingBookings: any[] = [];
        if (dateStr && providers.length > 0) {
            const targetDate = new Date(dateStr);
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            conflictingBookings = await (this.prisma as any).booking.findMany({
                where: {
                    providerId: {
                        in: providers.map(p => p.id)
                    },
                    bookingDate: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    status: {
                        in: ['PENDING', 'CONFIRMED']
                    }
                }
            });
        }

        return providers
            .map(user => {
                const sp = user.serviceProvider!;
                const distance = this.calculateDistance(
                    lat,
                    lng,
                    sp.latitude || 0,
                    sp.longitude || 0
                );

                const isAvailableToday = sp.workingDays.includes('Everyday') ||
                    sp.workingDays.includes(currentDay) ||
                    (currentDay === 'Sat' || currentDay === 'Sun') && sp.workingDays.includes('Weekend only');

                const isWithinHours = this.isTimeBetween(currentTimeString, sp.workingHoursStart || '08:00 AM', sp.workingHoursEnd || '06:00 PM');

                let isAvailableSlot = true;
                if (dateStr && timeStr) {
                    const hasConflict = conflictingBookings.some((b: any) => {
                        return b.providerId === user.id && b.startTime === timeStr;
                    });
                    if (hasConflict) {
                        isAvailableSlot = false;
                    }
                }

                const avgRating = user.reviewsReceived && user.reviewsReceived.length > 0
                    ? user.reviewsReceived.reduce((sum: number, r: any) => sum + r.rating, 0) / user.reviewsReceived.length
                    : 0;

                return {
                    id: user.id,
                    fullName: user.fullName,
                    profileImage: user.profileImage,
                    category: sp.category,
                    rating: parseFloat(avgRating.toFixed(1)) || 0,
                    distance: parseFloat(distance.toFixed(1)),
                    address: sp.formattedAddress,
                    latitude: sp.latitude,
                    longitude: sp.longitude,
                    yearsOfExperience: sp.yearsOfExperience,
                    isAvailable: isAvailableToday && isWithinHours && isAvailableSlot
                };
            })
            .filter(p => p.distance <= radius)
            .sort((a, b) => {
                // Primary sort: Available first
                if (a.isAvailable && !b.isAvailable) return -1;
                if (!a.isAvailable && b.isAvailable) return 1;
                // Secondary sort: Distance
                return a.distance - b.distance;
            })
            .slice(0, 10); // Show more results (up to 10)
    }

    async getProviderById(id: string) {
        const user = await (this.prisma as any).user.findUnique({
            where: { id },
            include: {
                serviceProvider: true,
                reviewsReceived: true
            }
        }) as any;

        if (!user || !user.serviceProvider) {
            throw new Error('Service provider not found');
        }

        const avgRating = user.reviewsReceived.length > 0
            ? user.reviewsReceived.reduce((sum: number, r: any) => sum + r.rating, 0) / user.reviewsReceived.length
            : 0;

        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            profileImage: user.profileImage,
            category: user.serviceProvider.category,
            yearsOfExperience: user.serviceProvider.yearsOfExperience,
            skills: user.serviceProvider.skills,
            address: user.serviceProvider.formattedAddress,
            workingDays: user.serviceProvider.workingDays,
            workingHoursStart: user.serviceProvider.workingHoursStart,
            workingHoursEnd: user.serviceProvider.workingHoursEnd,
            rating: parseFloat(avgRating.toFixed(1)) || 0,
            reviews: user.reviewsReceived.length || 0
        };
    }

    async getProviderAvailability(providerId: string, dateStr: string) {
        const date = new Date(dateStr);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayOfWeek = days[date.getDay()];

        const user = await this.prisma.user.findUnique({
            where: { id: providerId },
            include: { serviceProvider: true }
        });

        if (!user || !user.serviceProvider) {
            throw new Error('Service provider not found');
        }

        const sp = user.serviceProvider;
        const isWorkingDay = sp.workingDays.includes('Everyday') ||
            sp.workingDays.includes(dayOfWeek) ||
            ((dayOfWeek === 'Sat' || dayOfWeek === 'Sun') && sp.workingDays.includes('Weekend only'));

        if (!isWorkingDay) {
            return {
                isWorkingDay: false,
                slots: []
            };
        }

        const start = sp.workingHoursStart || '09:00 AM';
        const end = sp.workingHoursEnd || '05:00 PM';

        // Generate slots
        const slots = this.generateTimeSlots(start, end);

        // Define start and end of day for the query
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch existing bookings for this provider on this date
        const bookings = await (this.prisma as any).booking.findMany({
            where: {
                providerId,
                bookingDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    in: ['PENDING', 'CONFIRMED']
                }
            }
        });

        // Map availability
        const availability = (slots as any[]).map(slot => {
            const isBooked = bookings.some((b: any) => {
                return b.startTime === slot.start;
            });
            return {
                time: `${slot.start} - ${slot.end}`,
                status: isBooked ? 'not available' : 'available'
            };
        });

        return {
            isWorkingDay: true,
            slots: availability
        };
    }

    async getUserBookings(customerId: string) {
        return (this.prisma as any).booking.findMany({
            where: { customerId },
            include: {
                provider: {
                    select: {
                        fullName: true,
                        profileImage: true,
                        phone: true,
                        serviceProvider: {
                            select: {
                                category: true
                            }
                        }
                    }
                },
                reviews: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getProviderBookings(providerId: string, date?: string) {
        const whereClause: any = { providerId };
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            whereClause.bookingDate = {
                gte: startOfDay,
                lte: endOfDay
            };
        }

        return (this.prisma as any).booking.findMany({
            where: whereClause,
            include: {
                customer: {
                    select: {
                        fullName: true,
                        profileImage: true,
                        phone: true,
                        addresses: true
                    }
                },
                reviews: true
            },
            orderBy: date ? { startTime: 'asc' } : { createdAt: 'desc' }
        });
    }

    async updateBookingStatus(bookingId: string, status: string, additionalCharges: number = 0, reason?: string, cancelledBy?: string, actualHours?: number) {
        if (additionalCharges < 0) {
            throw new BadRequestException('Additional charges cannot be negative');
        }

        if (actualHours !== undefined && actualHours !== null && actualHours < 0) {
            throw new BadRequestException('Actual hours cannot be negative');
        }

        const existingBooking = await (this.prisma as any).booking.findUnique({
            where: { id: bookingId },
            include: { customer: true, provider: true }
        });

        if (status === 'CANCELLED') {
            if (existingBooking) {
                if (cancelledBy === 'CUSTOMER' && 
                    existingBooking.status !== 'PENDING' && 
                    existingBooking.status !== 'CONFIRMED') {
                    throw new BadRequestException('Cannot cancel the booking after the provider has started the journey.');
                }
            }
        }

        const updateData: any = {
            status,
        };

        if (status === 'ARRIVED') {
            updateData.arrivedAt = new Date();
        }
        if (status === 'CANCELLED' && reason) {
            updateData.disputeReason = reason;
        }

        if (status === 'COMPLETED') {
            const booking = await (this.prisma as any).booking.findUnique({
                where: { id: bookingId },
                include: { provider: { include: { serviceProvider: true } } }
            });

            if (booking) {
                const hourlyRate = booking.provider?.serviceProvider?.hourlyRate;
                let baseAmount = 0;

                if (actualHours !== undefined && actualHours !== null) {
                    baseAmount = actualHours * (hourlyRate || 500);
                } else if (booking.arrivedAt && hourlyRate) {
                    const durationMs = new Date().getTime() - new Date(booking.arrivedAt).getTime();
                    const durationHours = durationMs / (1000 * 60 * 60);
                    baseAmount = Math.max(1, durationHours) * hourlyRate;
                } else {
                    baseAmount = booking.totalAmount || 0;
                }

                const totalBeforePlatformFee = baseAmount + additionalCharges;
                let rateFactor = 0.05; // Default to 5% for services
                try {
                    const settingsPath = path.join(__dirname, '..', 'admin', 'platform-settings.json');
                    if (fs.existsSync(settingsPath)) {
                        const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
                        if (typeof settingsData.serviceCommissionRate === 'number') {
                            rateFactor = settingsData.serviceCommissionRate / 100;
                        } else if (typeof settingsData.commissionRate === 'number') {
                            rateFactor = settingsData.commissionRate / 100;
                        }
                    }
                } catch (e) {
                    console.error("Error reading platform settings in services:", e);
                }
                const platformFee = totalBeforePlatformFee * rateFactor;
                const finalAmount = totalBeforePlatformFee + platformFee;

                updateData.baseAmount = baseAmount;
                updateData.additionalCharges = additionalCharges;
                updateData.platformFee = platformFee;
                updateData.totalAmount = finalAmount;
            }
        }

        const updatedBooking = await (this.prisma as any).booking.update({
            where: { id: bookingId },
            data: updateData
        });

        // Trigger Notifications based on status
        if (existingBooking) {
            if (status === 'CONFIRMED') {
                await this.createNotification(existingBooking.customerId, 'Booking Confirmed!', `Your booking for ${existingBooking.serviceType} has been accepted.`, 'STATUS_UPDATE', bookingId);
                
                // Auto-decline conflicting pending bookings
                try {
                    const conflicting = await (this.prisma as any).booking.findMany({
                        where: {
                            id: { not: bookingId },
                            providerId: existingBooking.providerId,
                            bookingDate: existingBooking.bookingDate,
                            startTime: existingBooking.startTime,
                            status: 'PENDING'
                        }
                    });

                    for (const conflict of conflicting) {
                        await (this.prisma as any).booking.update({
                            where: { id: conflict.id },
                            data: { status: 'REJECTED' }
                        });

                        await this.createNotification(
                            conflict.customerId,
                            'Booking Declined',
                            `Your request for ${conflict.serviceType} was declined due to a schedule conflict.`,
                            'STATUS_UPDATE',
                            conflict.id
                        );
                    }
                } catch (err) {
                    console.error('Error auto-declining conflicting bookings:', err);
                }
            } else if (status === 'REJECTED') {
                await this.createNotification(existingBooking.customerId, 'Booking Declined', `The professional declined your request for ${existingBooking.serviceType}.`, 'STATUS_UPDATE', bookingId);
            } else if (status === 'ON_THE_WAY') {
                await this.createNotification(existingBooking.customerId, 'Provider On the Way', `${existingBooking.provider?.fullName} is heading to your location.`, 'STATUS_UPDATE', bookingId);
            } else if (status === 'ARRIVED') {
                await this.createNotification(existingBooking.customerId, 'Provider Arrived', `${existingBooking.provider?.fullName} has arrived at your location.`, 'STATUS_UPDATE', bookingId);
            } else if (status === 'COMPLETED') {
                await this.createNotification(existingBooking.customerId, 'Job Completed', `Work for ${existingBooking.serviceType} is done. Please review the invoice.`, 'STATUS_UPDATE', bookingId);
            } else if (status === 'PAID') {
                await this.createNotification(existingBooking.providerId, 'Payment Received', `${existingBooking.customer?.fullName} has paid the invoice. Job closed.`, 'STATUS_UPDATE', bookingId);
            } else if (status === 'CANCELLED') {
                if (cancelledBy === 'PROVIDER') {
                    await this.createNotification(
                        existingBooking.customerId,
                        'Booking Cancelled',
                        `The professional has cancelled the booking. Reason: ${reason || 'Not specified'}.`,
                        'STATUS_UPDATE',
                        bookingId
                    );
                    await this.createNotification(
                        existingBooking.providerId,
                        'Booking Cancelled',
                        `You have successfully cancelled the booking.`,
                        'STATUS_UPDATE',
                        bookingId
                    );
                } else if (cancelledBy === 'CUSTOMER') {
                    await this.createNotification(
                        existingBooking.providerId,
                        'Booking Cancelled',
                        `The customer has cancelled the booking. Reason: ${reason || 'Not specified'}.`,
                        'STATUS_UPDATE',
                        bookingId
                    );
                    await this.createNotification(
                        existingBooking.customerId,
                        'Booking Cancelled',
                        `You have successfully cancelled the booking.`,
                        'STATUS_UPDATE',
                        bookingId
                    );
                } else {
                    await this.createNotification(existingBooking.customerId, 'Booking Cancelled', `The booking for ${existingBooking.serviceType} has been cancelled.`, 'STATUS_UPDATE', bookingId);
                    await this.createNotification(existingBooking.providerId, 'Booking Cancelled', `The booking for ${existingBooking.serviceType} has been cancelled.`, 'STATUS_UPDATE', bookingId);
                }
            }
        }

        return updatedBooking;
    }

    async createBooking(data: {
        customerId: string;
        providerId: string;
        serviceType: string;
        bookingDate: string;
        startTime: string;
        endTime: string;
        address: string;
        totalAmount: number;
        description?: string;
        issueImage?: string;
    }) {
        const booking = await (this.prisma as any).booking.create({
            data: {
                ...data,
                bookingDate: new Date(data.bookingDate),
                status: 'PENDING'
            }
        });

        // Notify Provider
        await this.createNotification(
            data.providerId,
            'New Booking Request',
            `You have a new request for ${data.serviceType} at ${data.startTime}.`,
            'BOOKING_REQUEST',
            booking.id
        );

        return booking;
    }

    async getProviderReviews(providerId: string) {
        return (this.prisma as any).review.findMany({
            where: { revieweeId: providerId },
            include: {
                reviewer: {
                    select: {
                        fullName: true,
                        profileImage: true,
                        addresses: {
                            take: 1
                        }
                    }
                },
                booking: {
                    select: {
                        totalAmount: true,
                        serviceType: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async createReview(data: {
        reviewerId: string;
        revieweeId: string;
        bookingId?: string;
        rentalId?: string;
        rating: number;
        comment: string;
        images?: string[];
    }) {
        if (data.bookingId) {
            const existingReview = await (this.prisma as any).review.findFirst({
                where: { bookingId: data.bookingId }
            });
            if (existingReview) {
                throw new BadRequestException('You have already submitted a review for this booking.');
            }
        }
        if (data.rentalId) {
            const existingReview = await (this.prisma as any).review.findFirst({
                where: { rentalId: data.rentalId }
            });
            if (existingReview) {
                throw new BadRequestException('You have already submitted a review for this rental.');
            }
        }

        const review = await (this.prisma as any).review.create({
            data
        });

        // Notify person who received the review
        await this.createNotification(
            data.revieweeId,
            'New Review Received',
            `Someone left you a ${data.rating}-star review.`,
            'REVIEW_RECEIVED',
            review.id
        );

        return review;
    }

    async replyToReview(reviewId: string, reply: string) {
        const review = await (this.prisma as any).review.update({
            where: { id: reviewId },
            data: { reply },
            include: { reviewer: true }
        });

        // Notify the person who left the original review
        await this.createNotification(
            review.reviewerId,
            'Provider Replied',
            'The professional replied to your review.',
            'REVIEW_REPLY',
            reviewId
        );

        return review;
    }

    async likeReview(reviewId: string) {
        return (this.prisma as any).review.update({
            where: { id: reviewId },
            data: {
                likes: {
                    increment: 1
                }
            }
        });
    }

    async unlikeReview(reviewId: string) {
        const review = await (this.prisma as any).review.findUnique({
            where: { id: reviewId }
        });
        if (!review) return null;
        return (this.prisma as any).review.update({
            where: { id: reviewId },
            data: {
                likes: Math.max(0, (review.likes || 0) - 1)
            }
        });
    }

    async getNotifications(userId: string) {
        return (this.prisma as any).notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    }

    async markNotificationAsRead(id: string) {
        return (this.prisma as any).notification.update({
            where: { id },
            data: { isRead: true }
        });
    }

    async createNotification(userId: string, title: string, message: string, type: string, linkId?: string, data?: any) {
        try {
            return await (this.prisma as any).notification.create({
                data: {
                    userId,
                    title,
                    message,
                    type,
                    linkId,
                    data: data || {}
                }
            });
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    }

    async getReviewsForUser(userId: string) {
        return (this.prisma as any).review.findMany({
            where: { revieweeId: userId },
            include: {
                reviewer: {
                    select: {
                        fullName: true,
                        profileImage: true,
                        addresses: {
                            take: 1
                        }
                    }
                },
                booking: {
                    select: {
                        totalAmount: true,
                        serviceType: true
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

    private generateTimeSlots(startStr: string, endStr: string) {
        const parseTime = (t: string) => {
            const normalized = t.replace(/\s+/g, ' ').replace(/\u202f/g, ' ').trim();
            const [time, modifier] = normalized.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return hours;
        };

        const startHour = parseTime(startStr);
        const endHour = parseTime(endStr);
        const slots: { start: string, end: string }[] = [];

        for (let h = startHour; h < endHour; h++) {
            const formatTime = (hour: number) => {
                const mod = hour >= 12 ? 'PM' : 'AM';
                let h12 = hour % 12;
                if (h12 === 0) h12 = 12;
                return `${h12.toString().padStart(2, '0')}:00 ${mod}`;
            };

            slots.push({
                start: formatTime(h),
                end: formatTime(h + 1)
            });
        }
        return slots;
    }

    private isTimeBetween(current: string, start: string, end: string) {
        const parseTime = (t: string) => {
            const normalized = t.replace(/\s+/g, ' ').replace(/\u202f/g, ' ').trim();
            const [time, modifier] = normalized.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const curr = parseTime(current);
        const s = parseTime(start);
        const e = parseTime(end);

        return curr >= s && curr <= e;
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
