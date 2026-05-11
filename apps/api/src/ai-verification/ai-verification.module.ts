import { Module } from '@nestjs/common';
import { AiVerificationService } from './ai-verification.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AiVerificationService],
  exports: [AiVerificationService],
})
export class AiVerificationModule {}
