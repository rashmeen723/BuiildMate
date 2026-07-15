import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VerificationStatus } from '@prisma/client';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Will add protection later

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('pending-verifications')
    async getPendingVerifications() {
        return this.adminService.getPendingVerifications();
    }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('providers')
    async getProviders() {
        return this.adminService.getProviders();
    }

    @Get('services')
    async getServices() {
        return this.adminService.getServices();
    }

    @Post('category')
    async addCategory(
        @Body('type') type: 'service' | 'rental',
        @Body('name') name: string
    ) {
        return this.adminService.addCategory(type, name);
    }

    @Put('category')
    async updateCategory(
        @Body('type') type: 'service' | 'rental',
        @Body('oldName') oldName: string,
        @Body('newName') newName: string
    ) {
        return this.adminService.updateCategory(type, oldName, newName);
    }

    @Delete('category/:type/:name')
    async deleteCategory(
        @Param('type') type: string,
        @Param('name') name: string
    ) {
        return this.adminService.deleteCategory(type, name);
    }

    @Get('verification/:id')
    async getVerificationDetails(@Param('id') id: string) {
        return this.adminService.getVerificationDetails(id);
    }

    @Post('verify/:id')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: VerificationStatus,
        @Body('reason') reason?: string
    ) {
        return this.adminService.updateVerificationStatus(id, status, reason);
    }

    @Post('user/:id/suspend')
    async suspendUser(
        @Param('id') id: string,
        @Body('reason') reason: string
    ) {
        return this.adminService.suspendUser(id, reason);
    }

    @Post('user/:id/unsuspend')
    async unsuspendUser(@Param('id') id: string) {
        return this.adminService.unsuspendUser(id);
    }

    @Delete('user/:id')
    async deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }

    @Get('reports/monthly')
    async getMonthlyReport() {
        return this.adminService.getMonthlyReportData();
    }

    @Get('settings')
    async getSettings() {
        return this.adminService.getPlatformSettings();
    }

    @Post('settings')
    async updateSettings(@Body() data: { serviceCommissionRate?: number; rentalCommissionRate?: number; commissionRate?: number }) {
        return this.adminService.updatePlatformSettings(data);
    }

    @Post('broadcast')
    async broadcastAnnouncement(
        @Body() data: { title: string; message: string; targetAudience: 'ALL' | 'SERVICE_PROVIDER' | 'RENTAL_OWNER' | 'HOUSEHOLD' }
    ) {
        return this.adminService.broadcastAnnouncement(data);
    }
}
