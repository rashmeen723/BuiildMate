import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post('checkout')
    @HttpCode(HttpStatus.OK)
    async getCheckoutParams(
        @Body() body: { orderId: string; orderType: 'booking' | 'rental' }
    ) {
        return this.paymentService.generateCheckoutParams(body.orderId, body.orderType);
    }

    @Post('notify')
    @HttpCode(HttpStatus.OK)
    async handlePayHereNotification(@Body() body: any) {
        return this.paymentService.handleNotification(body);
    }
}
