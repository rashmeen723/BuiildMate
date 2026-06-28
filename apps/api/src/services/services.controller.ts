import { Controller, Get, Query, ParseFloatPipe, Param, Post, Body } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get('nearby')
    async getNearbyProviders(
        @Query('lat', ParseFloatPipe) lat: number,
        @Query('lng', ParseFloatPipe) lng: number,
        @Query('radius') radius?: number,
        @Query('category') category?: string,
        @Query('date') date?: string,
        @Query('time') time?: string
    ) {
        return this.servicesService.getNearbyProviders(lat, lng, radius ? Number(radius) : 20, category, date, time);
    }

    @Get('provider/:id')
    async getProvider(@Param('id') id: string) {
        return this.servicesService.getProviderById(id);
    }

    @Get('provider/:id/availability')
    async getProviderAvailability(
        @Param('id') id: string,
        @Query('date') date: string
    ) {
        return this.servicesService.getProviderAvailability(id, date);
    }

    @Get('user/:id/bookings')
    async getUserBookings(@Param('id') id: string) {
        return this.servicesService.getUserBookings(id);
    }

    @Get('provider/:id/reviews')
    async getProviderReviews(@Param('id') id: string) {
        return this.servicesService.getProviderReviews(id);
    }

    @Get('user/:id/reviews')
    async getUserReviews(@Param('id') id: string) {
        return this.servicesService.getReviewsForUser(id);
    }

    @Post('review')
    async createReview(@Body() reviewData: any) {
        return this.servicesService.createReview(reviewData);
    }

    @Post('review/:id/reply')
    async replyToReview(@Param('id') id: string, @Body('reply') reply: string) {
        return this.servicesService.replyToReview(id, reply);
    }

    @Post('review/:id/like')
    async likeReview(@Param('id') id: string) {
        return this.servicesService.likeReview(id);
    }

    @Post('review/:id/unlike')
    async unlikeReview(@Param('id') id: string) {
        return this.servicesService.unlikeReview(id);
    }

    @Get('provider/:id/bookings')
    async getProviderBookings(@Param('id') id: string, @Query('date') date?: string) {
        return this.servicesService.getProviderBookings(id, date);
    }

    @Post('booking/status')
    async updateBookingStatus(@Body() data: { bookingId: string, status: string, additionalCharges?: number, reason?: string, cancelledBy?: string, actualHours?: number }) {
        return this.servicesService.updateBookingStatus(data.bookingId, data.status, data.additionalCharges, data.reason, data.cancelledBy, data.actualHours);
    }

    @Get('user/:userId/notifications')
    async getNotifications(@Param('userId') userId: string) {
        return this.servicesService.getNotifications(userId);
    }

    @Post('notification/:id/read')
    async markAsRead(@Param('id') id: string) {
        return this.servicesService.markNotificationAsRead(id);
    }

    @Post('book')
    async createBooking(@Body() bookingData: any) {
        return this.servicesService.createBooking(bookingData);
    }
}
