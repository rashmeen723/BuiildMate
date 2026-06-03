import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { DisputeStatus } from '@prisma/client';

@Controller('disputes')
export class DisputesController {
    constructor(private readonly disputesService: DisputesService) {}

    @Post()
    async createDispute(
        @Body()
        data: {
            reporterId: string;
            reportedId: string;
            bookingId?: string;
            rentalId?: string;
            reason: string;
            description: string;
            evidenceImages?: string[];
        },
    ) {
        return this.disputesService.createDispute(data);
    }

    @Get()
    async getDisputes() {
        return this.disputesService.getDisputes();
    }

    @Get(':id')
    async getDisputeById(@Param('id') id: string) {
        return this.disputesService.getDisputeById(id);
    }

    @Post(':id/resolve')
    async resolveDispute(
        @Param('id') id: string,
        @Body()
        data: {
            status: DisputeStatus;
            resolution: string;
            adjustTrustScore?: boolean;
            penaltyAmount?: number;
        },
    ) {
        return this.disputesService.resolveDispute(id, data);
    }
}
