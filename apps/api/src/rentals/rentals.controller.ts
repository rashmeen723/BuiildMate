import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
    constructor(private readonly rentalsService: RentalsService) { }

    @Get('owner/:userId/tools')
    async getOwnerTools(@Param('userId') userId: string) {
        return this.rentalsService.getToolsByOwner(userId);
    }

    @Post('owner/:userId/tools')
    async addTool(@Param('userId') userId: string, @Body() data: any) {
        return this.rentalsService.addTool(userId, data);
    }

    @Put('tool/:toolId')
    async updateTool(@Param('toolId') toolId: string, @Body() data: any) {
        return this.rentalsService.updateTool(toolId, data);
    }

    @Get('owner/:userId/stats')
    async getStats(@Param('userId') userId: string) {
        return this.rentalsService.getStats(userId);
    }

    @Get('owner/:userId/rentals')
    async getOwnerRentals(@Param('userId') userId: string) {
        return this.rentalsService.getOwnerRentals(userId);
    }

    @Get('category/:category')
    async getToolsByCategory(@Param('category') category: string) {
        return this.rentalsService.getToolsByCategory(category);
    }

    @Get('nearby')
    async getNearbyTools(
        @Query('lat') lat: number,
        @Query('lng') lng: number,
        @Query('radius') radius?: number
    ) {
        return this.rentalsService.getNearbyTools(Number(lat), Number(lng), radius ? Number(radius) : undefined);
    }

    @Get(':id')
    async getToolById(@Param('id') id: string) {
        return this.rentalsService.getToolById(id);
    }

    @Get('tool/:id/reviews')
    async getToolReviews(@Param('id') id: string) {
        return this.rentalsService.getToolReviews(id);
    }

    @Post()
    async createRental(@Body() data: any) {
        return this.rentalsService.createRental(data);
    }

    @Put(':id/status')
    async updateRentalStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.rentalsService.updateRentalStatus(id, status);
    }

    @Get('user/:userId/rentals')
    async getUserRentals(@Param('userId') userId: string) {
        return this.rentalsService.getUserRentals(userId);
    }
}
