import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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

    @Get('verification/:id')
    async getVerificationDetails(@Param('id') id: string) {
        return this.adminService.getVerificationDetails(id);
    }

    @Post('verify/:id')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: VerificationStatus
    ) {
        return this.adminService.updateVerificationStatus(id, status);
    }
}
