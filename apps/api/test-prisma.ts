
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
console.log('OTP model:', prisma.otp);
