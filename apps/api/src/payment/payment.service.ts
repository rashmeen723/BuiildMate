import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    private md5(value: string): string {
        return crypto.createHash('md5').update(value).digest('hex');
    }

    async generateCheckoutParams(orderId: string, orderType: 'booking' | 'rental') {
        const rawMerchantId = this.configService.get<string>('PAYHERE_MERCHANT_ID') || '1211149';
        const rawMerchantSecret = this.configService.get<string>('PAYHERE_MERCHANT_SECRET') || '4SU429P58p4428q1tN398845O12x432857418731';
        
        const merchantId = rawMerchantId.replace(/"/g, '').trim();
        const merchantSecret = rawMerchantSecret.replace(/"/g, '').trim();
        
        let amount = 0;
        let description = '';
        let customerEmail = '';
        let customerName = '';
        let customerPhone = '';

        if (orderType === 'booking') {
            const booking = await this.prisma.booking.findUnique({
                where: { id: orderId },
                include: { customer: true }
            });
            if (!booking) throw new NotFoundException('Booking not found');
            amount = booking.totalAmount;
            description = `BuildMate Service Booking: ${booking.serviceType}`;
            customerEmail = booking.customer.email;
            customerName = booking.customer.fullName;
            customerPhone = booking.customer.phone || '0771234567';
        } else {
            const rental = await this.prisma.toolRental.findUnique({
                where: { id: orderId },
                include: { customer: true, tool: true }
            });
            if (!rental) throw new NotFoundException('Rental transaction not found');
            amount = rental.totalAmount;
            description = `BuildMate Tool Rental: ${rental.tool.name}`;
            customerEmail = rental.customer.email;
            customerName = rental.customer.fullName;
            customerPhone = rental.customer.phone || '0771234567';
        }

        // Format amount strictly to 2 decimal places
        const formattedAmount = amount.toFixed(2);
        const currency = 'LKR';

        // PayHere Signature format: md5(merchant_id + order_id + amount + currency + md5(merchant_secret))
        const hashedSecret = this.md5(merchantSecret).toUpperCase();
        const hashString = merchantId + orderId + formattedAmount + currency + hashedSecret;
        const signatureHash = this.md5(hashString).toUpperCase();

        return {
            merchantId,
            orderId,
            amount: formattedAmount,
            currency,
            description,
            customerName,
            customerEmail,
            customerPhone,
            hash: signatureHash,
            checkoutUrl: 'https://sandbox.payhere.lk/pay/checkout'
        };
    }

    async handleNotification(body: any) {
        this.logger.log(`Received PayHere webhook notification: ${JSON.stringify(body)}`);

        const merchantId = body.merchant_id;
        const orderId = body.order_id;
        const paymentId = body.payment_id;
        const payhereAmount = body.payhere_amount; // e.g. "250.00"
        const payhereCurrency = body.payhere_currency;
        const statusCode = body.status_code; // 2 = Success, 0 = Pending, -1 = Cancelled, -2 = Failed
        const md5sig = body.md5sig;

        const rawMerchantSecret = this.configService.get<string>('PAYHERE_MERCHANT_SECRET') || '4SU429P58p4428q1tN398845O12x432857418731';
        const merchantSecret = rawMerchantSecret.replace(/"/g, '').trim();
        
        // PayHere Webhook verification format:
        // md5sig = uppercase(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + uppercase(md5(merchant_secret))))
        const hashedSecret = this.md5(merchantSecret).toUpperCase();
        const hashString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret;
        const expectedSig = this.md5(hashString).toUpperCase();

        if (md5sig !== expectedSig) {
            this.logger.error(`Signature verification failed! Expected: ${expectedSig}, Received: ${md5sig}`);
            throw new BadRequestException('Invalid signature hash');
        }

        if (statusCode === '2') {
            this.logger.log(`Payment successful for order: ${orderId}`);
            
            // 1. Try to find and update a Service Booking
            const booking = await this.prisma.booking.findUnique({
                where: { id: orderId }
            });

            if (booking) {
                await this.prisma.booking.update({
                    where: { id: orderId },
                    data: {
                        status: 'PAID',
                        paymentId: paymentId
                    }
                });

                // Generate system notification
                await this.prisma.notification.create({
                    data: {
                        userId: booking.customerId,
                        title: 'Payment Confirmed! 💳',
                        message: `Your payment of LKR ${booking.totalAmount} for ${booking.serviceType} booking has been received.`,
                        type: 'STATUS_UPDATE',
                        linkId: booking.id
                    }
                });

                return { status: 'success', type: 'booking' };
            }

            // 2. Try to find and update a Tool Rental
            const rental = await this.prisma.toolRental.findUnique({
                where: { id: orderId }
            });

            if (rental) {
                await this.prisma.toolRental.update({
                    where: { id: orderId },
                    data: {
                        status: 'CONFIRMED',
                        isPaid: true,
                        paymentId: paymentId
                    }
                });

                // Generate system notification
                await this.prisma.notification.create({
                    data: {
                        userId: rental.customerId,
                        title: 'Rental Deposit Received! 🔩',
                        message: `Your deposit of LKR ${rental.totalAmount} has been processed successfully.`,
                        type: 'STATUS_UPDATE',
                        linkId: rental.id
                    }
                });

                return { status: 'success', type: 'rental' };
            }

            throw new NotFoundException(`Order ${orderId} not found as booking or rental`);
        } else {
            this.logger.warn(`Payment not processed. Status code received: ${statusCode}`);
            return { status: 'unprocessed', code: statusCode };
        }
    }
}
