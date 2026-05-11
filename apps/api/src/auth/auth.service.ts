import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { AiVerificationService } from '../ai-verification/ai-verification.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private mailerService: MailerService,
        private jwtService: JwtService,
        private cloudinaryService: CloudinaryService,
        private aiVerificationService: AiVerificationService
    ) { }

    async uploadFilePublic(file: Express.Multer.File) {
        const imageUrl = await this.cloudinaryService.uploadFile(file, 'uploads');
        return { imageUrl };
    }

    async register(registrationData: any) {
        console.log('Received registration request:', JSON.stringify(registrationData, null, 2));

        const {
            email,
            password,
            fullName,
            phone,
            role,
            professionalDetails,
            rentalDetails,
            location,
            documents, // Service Provider Documents
            serviceArea, // Service Provider Service Area
            profileImage // Top-level profile image
        } = registrationData;

        if (!email || !fullName || !password) {
            throw new BadRequestException('Email, Full Name, and Password are required');
        }

        // 1. Check if user already exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone: phone || undefined }
                ]
            }
        });

        if (existingUser) {
            throw new ConflictException('User with this email or phone already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Create the User and their specific profile in a transaction
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    fullName,
                    phone,
                    role,
                    profileImage: profileImage || registrationData.documents?.profileImage || null,
                    isEmailVerified: true,
                    documents: {
                        create: [
                            ...(documents?.idImage ? [{
                                documentType: 'ID_CARD',
                                documentUrl: documents.idImage,
                                selfieUrl: documents.selfieImage // Store the live selfie here
                            }] : []),
                            ...(role === 'SERVICE_PROVIDER' ? (documents?.certificateImages || []).map((url: string) => ({
                                documentType: 'CERTIFICATE',
                                documentUrl: url
                            })) : []),
                            ...(role === 'RENTAL_OWNER' && documents?.businessDoc ? [{
                                documentType: 'BUSINESS_PERMIT',
                                documentUrl: documents.businessDoc
                            }] : [])
                        ]
                    },
                    // Handle specific profiles based on role
                    ...(role === 'SERVICE_PROVIDER' && {
                        serviceProvider: {
                            create: {
                                category: professionalDetails?.categories?.[0] || 'Other',
                                yearsOfExperience: professionalDetails?.yearsOfExperience?.toString(),
                                skills: professionalDetails?.skills || [],
                                hourlyRate: professionalDetails?.hourlyRate ? Number(professionalDetails.hourlyRate) : null,
                                latitude: location?.latitude,
                                longitude: location?.longitude,
                                formattedAddress: serviceArea?.address || location?.address,
                                serviceRadius: serviceArea?.radius,
                                workingDays: serviceArea?.workingDays || [],
                                workingHoursStart: serviceArea?.workingHours?.start,
                                workingHoursEnd: serviceArea?.workingHours?.end
                            }
                        }
                    }),
                    ...(role === 'RENTAL_OWNER' && {
                        rentalOwner: {
                            create: {
                                businessName: rentalDetails?.businessName || 'Business Name',
                                toolCategories: rentalDetails?.categories || [],
                                yearsInBusiness: rentalDetails?.yearsInBusiness?.toString(),
                                latitude: location?.latitude,
                                longitude: location?.longitude,
                                formattedAddress: serviceArea?.address || location?.address
                            }
                        }
                    }),
                    // Create address if location data is provided
                    ...(location && {
                        addresses: {
                            create: {
                                addressLine1: location.address || 'Address',
                                city: location.city || this.extractCity(location.address),
                                latitude: location.latitude,
                                longitude: location.longitude,
                                isDefault: true
                            }
                        }
                    })
                },
                include: {
                    serviceProvider: true,
                    rentalOwner: true,
                    documents: true,
                    addresses: true
                }
            });

            // 3. Trigger AI Verification for uploaded documents (asynchronously)
            user.documents.forEach(doc => {
                this.aiVerificationService.verifyDocument(doc.id).catch(err => {
                    console.error(`Background AI verification failed for document ${doc.id}:`, err);
                });
            });

            // Remove password from response
            const { password: _, ...result } = user;
            return result;
        });
    }

    async login(loginData: any) {
        const { email, password } = loginData;
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                serviceProvider: true,
                rentalOwner: true,
                addresses: true
            }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        // Remove password from response
        const { password: _, ...userData } = user;

        return {
            user: userData,
            token
        };
    }

    async sendOtp(email: string) {
        // 1. Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // 2. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute expiry
        // 3. Save OTP to DB (Update if already exists for this email)
        await this.prisma.otp.deleteMany({ where: { email } }); // Clear old ones
        await this.prisma.otp.create({
            data: {
                email,
                code: otpCode,
                expiresAt,
            }
        });

        // 4. Send Email
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Your BuildMate Verification Code',
                text: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #14213D;">Welcome to BuildMate</h2>
                        <p>Your verification code is:</p>
                        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px;">
                            ${otpCode}
                        </div>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                    </div>
                `,
            });
            return { message: 'OTP sent successfully' };
        } catch (error) {
            console.error('Failed to send email:', error);
            throw new BadRequestException('Failed to send verification email');
        }
    }

    async verifyOtp(email: string, code: string) {
        const otp = await this.prisma.otp.findFirst({
            where: { email, code }
        });

        if (!otp) {
            throw new BadRequestException('Invalid verification code');
        }

        if (new Date() > otp.expiresAt) {
            await this.prisma.otp.delete({ where: { id: otp.id } });
            throw new BadRequestException('Verification code has expired');
        }

        await this.prisma.otp.delete({ where: { id: otp.id } });
        return { message: 'OTP verified successfully' };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                serviceProvider: true,
                rentalOwner: true,
                addresses: true,
                documents: true
            }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const { password, ...result } = user;
        return result;
    }

    async updateProfile(userId: string, updateData: any) {
        const { fullName, phone, profileImage, selectedLocation, selectedAddress } = updateData;

        return this.prisma.$transaction(async (tx) => {
            if (selectedLocation) {
                const existingAddress = await tx.address.findFirst({
                    where: { userId, isDefault: true }
                });

                if (existingAddress) {
                    await tx.address.update({
                        where: { id: existingAddress.id },
                        data: {
                            addressLine1: selectedAddress || 'Address',
                            city: this.extractCity(selectedAddress),
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude
                        }
                    });
                } else {
                    await tx.address.create({
                        data: {
                            userId,
                            addressLine1: selectedAddress || 'Address',
                            city: this.extractCity(selectedAddress),
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude,
                            isDefault: true
                        }
                    });
                }
            }

            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    fullName,
                    phone,
                    profileImage
                },
                include: {
                    serviceProvider: true,
                    rentalOwner: true,
                    addresses: true,
                    documents: true
                }
            });

            const { password, ...result } = user;
            return result;
        });
    }

    async setProfileImage(userId: string, file: Express.Multer.File) {
        const imageUrl = await this.cloudinaryService.uploadFile(file, 'profile-images');

        await this.prisma.user.update({
            where: { id: userId },
            data: { profileImage: imageUrl }
        });

        return { imageUrl };
    }

    private extractCity(address: string): string {
        if (!address) return 'Colombo';
        const parts = address.split(',').map(p => p.trim()).filter(p => p !== '' && p.toLowerCase() !== 'sri lanka');
        if (parts.length > 0) {
            return parts[parts.length - 1]; // Take the last meaningful part
        }
        return 'Colombo';
    }
}
