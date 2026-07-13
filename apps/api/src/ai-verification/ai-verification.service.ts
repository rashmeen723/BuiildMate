import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AiVerificationService {
    private readonly logger = new Logger(AiVerificationService.name);
    private genAI: GoogleGenerativeAI;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private mailerService: MailerService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    private async fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from URL: ${url}, status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        return {
            data: buffer.toString('base64'),
            mimeType,
        };
    }

    async checkUserAutoApproval(userId: string) {
        const updatedUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { 
                documents: true,
                serviceProvider: true,
                rentalOwner: true
            }
        });

        if (updatedUser) {
            const allPassed = updatedUser.documents.every(d => d.status === 'AI_PASSED' && (d.aiConfidence || 0) > 0.85);
            const hasPendingOrFlagged = updatedUser.documents.some(d => d.status === 'PENDING' || d.status === 'AI_FLAGGED');
            
            if (allPassed && !hasPendingOrFlagged && updatedUser.documents.length > 0) {
                this.logger.log(`Auto-approving user: ${updatedUser.id} as all documents passed AI checks with high confidence.`);
                
                const badgesToGrant: any[] = [];
                
                if (updatedUser.serviceProvider) {
                    const hasUtilityBill = updatedUser.documents.some(d => d.documentType === 'UTILITY_BILL');
                    if (hasUtilityBill) {
                        badgesToGrant.push('ADDRESS_VERIFIED');
                    }
                    
                    await this.prisma.serviceProviderProfile.update({
                        where: { userId: updatedUser.id },
                        data: { status: 'APPROVED' }
                    });
                }

                if (updatedUser.rentalOwner) {
                    const hasBrDoc = updatedUser.documents.some(d => d.documentType === 'BUSINESS_PERMIT');
                    if (hasBrDoc) {
                        badgesToGrant.push('BUSINESS_VERIFIED');
                    }
                    
                    const hasUtilityBill = updatedUser.documents.some(d => d.documentType === 'UTILITY_BILL');
                    if (hasUtilityBill) {
                        badgesToGrant.push('ADDRESS_VERIFIED');
                    }
                    
                    await this.prisma.rentalOwnerProfile.update({
                        where: { userId: updatedUser.id },
                        data: { status: 'APPROVED' }
                    });
                }

                const updatedBadges = Array.from(new Set([...updatedUser.badges, ...badgesToGrant]));

                await this.prisma.user.update({
                    where: { id: updatedUser.id },
                    data: { badges: updatedBadges as any[] }
                });

                this.logger.log(`Auto-approval successful for user: ${updatedUser.id}. Badges granted: ${badgesToGrant.join(', ')}`);

                await this.prisma.notification.create({
                    data: {
                        userId: updatedUser.id,
                        title: 'Verification Approved! 🎉',
                        message: 'Your documents have been verified and approved automatically by our AI system. You are now fully verified on BuildMate.',
                        type: 'STATUS_UPDATE',
                    }
                }).catch(err => {
                    this.logger.error(`Failed to create auto-approval notification for user ${updatedUser.id}: ${err.message}`);
                });

                // Send Email Notification
                this.mailerService.sendMail({
                    to: updatedUser.email,
                    subject: 'BuildMate Profile Verification Status: Approved (AI)',
                    text: `Hello ${updatedUser.fullName},\n\nWe are pleased to inform you that your document verification has been successfully approved automatically by our AI system. Your profile is now active on the BuildMate platform.\n\nBest Regards,\nThe BuildMate Trust Team`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #14213D; border-bottom: 2px solid #F59E0B; padding-bottom: 10px;">BuildMate Profile Verified</h2>
                            <p>Hello <strong>${updatedUser.fullName}</strong>,</p>
                            <p>We are pleased to inform you that your document verification has been successfully approved automatically by our AI verification system! Your profile is now active, and you can start listing tools or accepting service bookings on BuildMate.</p>
                            <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; border-radius: 4px; margin: 20px 0;">
                                <strong style="color: #065F46;">Status: Verified & Approved (Automated AI Check)</strong>
                            </div>
                            <p>Thank you for partnering with us to build a trusted community.</p>
                            <br/>
                            <p style="color: #6B7280; font-size: 12px; border-top: 1px solid #E5E7EB; padding-top: 15px;">
                                Best Regards,<br/>
                                <strong>The BuildMate Trust Team</strong>
                            </p>
                        </div>
                    `
                }).catch(err => {
                    this.logger.error(`Failed to send auto-approval email to user ${updatedUser.email}: ${err.message}`);
                });
            }
        }
    }

    async verifyDocument(documentId: string) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: { 
                user: { 
                    include: { 
                        serviceProvider: true, 
                        rentalOwner: true,
                        documents: true 
                    } 
                } 
            },
        });

        if (!document) {
            this.logger.error(`Document ${documentId} not found in database`);
            return;
        }

        // Auto-approve certificate documents without AI check
        if (document.documentType === 'CERTIFICATE') {
            this.logger.log(`Auto-approving certificate document: ${documentId} without AI verification.`);
            await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    status: 'AI_PASSED',
                    aiConfidence: 1.0,
                    aiResult: { 
                        status: 'AI_PASSED', 
                        confidence: 1.0, 
                        reason: 'Certificates are accepted automatically.' 
                    } as any,
                },
            });
            await this.checkUserAutoApproval(document.userId);
            return { status: 'AI_PASSED', confidence: 1.0, reason: 'Certificates are accepted automatically.' };
        }

        if (!this.genAI) {
            this.logger.error(`Gemini API not configured. Please set GEMINI_API_KEY in environment variables.`);
            return;
        }

        try {
            this.logger.log(`Starting AI verification for document: ${documentId}`);
            
            const model = this.genAI.getGenerativeModel({ 
                model: 'gemini-2.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });

            let prompt = '';
            if (document.documentType === 'UTILITY_BILL') {
                const address = document.user.serviceProvider?.formattedAddress || 
                                document.user.rentalOwner?.formattedAddress || 
                                'General Sri Lanka';
                prompt = `
                    You are an expert document verification assistant for 'BuildMate', a marketplace in Sri Lanka.
                    You are provided with one image:
                    1. A Utility Bill or Tenancy/Lease Agreement (mandatory)

                    Compare this document with the user's profile:
                    - Registered Full Name: ${document.user.fullName}
                    - Registered Home Address (Google Maps location): ${address}

                    Tasks:
                    1. **Provider/Document Classification**:
                       - Verify if the document is an official Sri Lankan utility bill (e.g., Ceylon Electricity Board (CEB), LECO, National Water Supply and Drainage Board (NWSDB), Sri Lanka Telecom (SLT), Dialog, Mobitel postpaid) or a formal Tenancy/Lease Agreement.
                       - If it is not a valid utility bill or lease agreement, set "looksAuthentic" to false.

                     2. **Name Verification (Spouse, Family, & Tenant Handling)**:
                       - Compare the name printed on the document with the Registered Full Name.
                       - Allow flexible matching for initials/abbreviations (e.g. "R.K. Perera" vs "Rashmeen Kavindya Perera").
                       - If the name on the bill is completely different (e.g. belongs to a husband/wife, parent, or landlord), but the address is a geographical match, set "nameMatch" to true. In the "reason" field, explain that the address matches and the bill is accepted under a third-party/spouse/landlord name.
                       - Set "nameMatch" to false only if there is both a name mismatch AND the address does not match.

                    3. **Address Verification (Sri Lankan Address Alignment)**:
                       - Compare the address on the document with the Registered Home Address ("${address}").
                       - Address formats in Sri Lanka vary between post office addresses (assessment numbers, GS divisions) and Google Maps API addresses. 
                       - Ignore minor formatting differences. Verify if they refer to the same physical location by matching:
                         - Road / Street name
                         - Sub-locality / Village / Ward
                         - City / Town / Postal zone (e.g., Galle, Ambalantota, Colombo 03)
                         - District (e.g., Hambantota, Gampaha)
                       - Set "addressMatch" to true if they refer to the same geographical property.

                    4. **Recency**:
                       - Check if the utility bill is recent (e.g., within 3-6 months. Look for billing date if visible). Set "notExpired" to true if recent, and false if outdated.

                    5. **Authenticity**:
                       - Check for signs of tampering, photo editing, or forgery. Set "looksAuthentic" to true if the document appears to be genuine, and false otherwise.

                    Return ONLY a JSON object with this structure:
                    {
                        "status": "AI_PASSED" | "AI_FLAGGED",
                        "confidence": number (0-1),
                        "reason": "short explanation of the findings, including provider classification, surname/tenant matching details, and geographical address correlation",
                        "extractedData": {
                            "providerName": "string (e.g., CEB, Dialog, Tenancy Agreement)",
                            "nameOnBill": "string",
                            "addressOnBill": "string",
                            "billDate": "string"
                        },
                        "checks": {
                            "nameMatch": boolean,
                            "addressMatch": boolean,
                            "looksAuthentic": boolean,
                            "notExpired": boolean
                        }
                    }
                `;
            } else if (document.documentType === 'BUSINESS_PERMIT') {
                const businessName = document.user.rentalOwner?.businessName || 'General Business';
                const ownerName = document.user.fullName;
                const address = document.user.rentalOwner?.formattedAddress || 'General Sri Lanka';
                prompt = `
                    You are an expert document verification assistant for 'BuildMate', a marketplace in Sri Lanka.
                    Analyze the provided Business Permit / Registration document image and compare it with the following profile:
                    - Registered Full Name (Owner): ${ownerName}
                    - Registered Business Name: ${businessName}
                    - Registered Business Address (Google Maps location): ${address}
                    - Document Type: BUSINESS_PERMIT

                    Tasks:
                    1. **Name & Business Verification**:
                       - Verify if the business name or owner name on the document matches the registered business name or owner name. Note that the match does NOT need to be an exact, character-for-character match. Set "nameMatch" to true if there is a reasonable match for either the business name or the owner name, and false otherwise.
                    2. **Address Verification**:
                       - Compare the address printed on the Business Permit and the Registered Business Address ("${address}").
                       - Address formats in Sri Lanka vary greatly. Verify if they refer to the same geographical/spatial property (e.g. same street name, sub-district, city, or coordinates). Set "addressMatch" to true if they match or correlate geographically, and false if they refer to entirely different properties.
                    3. **Recency / Validity**:
                       - Check if the business permit is valid/not expired (if applicable). Set "notExpired" to true if valid, and false if expired.
                    4. **Authenticity**:
                       - Look for signs of tampering or forgery. Set "looksAuthentic" to true if the document appears to be genuine, and false otherwise.

                    Return ONLY a JSON object with this structure:
                    {
                        "status": "AI_PASSED" | "AI_FLAGGED",
                        "confidence": number (0-1),
                        "reason": "short explanation of the findings, including details about name/business name verification and geographical address matching",
                        "extractedData": {
                            "businessName": "string",
                            "registrationNumber": "string",
                            "address": "string"
                        },
                        "checks": {
                            "nameMatch": boolean,
                            "addressMatch": boolean,
                            "notExpired": boolean,
                            "looksAuthentic": boolean
                        }
                    }
                `;
            } else {
                prompt = `
                    You are an expert document verification assistant for 'BuildMate', a marketplace in Sri Lanka.
                    Analyze the provided document image and compare it with the following user profile:
                    - Full Name: ${document.user.fullName}
                    - Document Type: ${document.documentType}

                    Tasks:
                    1. Verify if the name on the document matches the registered full name. Allow flexible matching. Set "nameMatch" to true if they match, and false otherwise.
                    2. Check if the document is expired (if applicable).
                    3. Look for signs of tampering or forgery.
                    4. Extract all key text.

                    Return ONLY a JSON object with this structure:
                    {
                        "status": "AI_PASSED" | "AI_FLAGGED",
                        "confidence": number (0-1),
                        "reason": "short explanation of the findings, including details about name verification",
                        "extractedData": {
                            "name": "string",
                            "documentId": "string",
                            "address": "string"
                        },
                        "checks": {
                            "nameMatch": boolean,
                            "notExpired": boolean,
                            "looksAuthentic": boolean
                        }
                    }
                `;
            }

            const parts: any[] = [prompt];

            if (document.documentType === 'UTILITY_BILL') {
                this.logger.log(`Fetching Utility Bill image: ${document.documentUrl}`);
                const utilityBillData = await this.fetchImageAsBase64(document.documentUrl);
                parts.push({
                    inlineData: {
                        data: utilityBillData.data,
                        mimeType: utilityBillData.mimeType
                    }
                });
            } else {
                this.logger.log(`Fetching document image: ${document.documentUrl}`);
                const docData = await this.fetchImageAsBase64(document.documentUrl);
                parts.push({
                    inlineData: {
                        data: docData.data,
                        mimeType: docData.mimeType
                    }
                });
            }

            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();
            
            let aiData;
            try {
                aiData = JSON.parse(text);
            } catch (jsonErr) {
                this.logger.error(`Failed to parse Gemini response as JSON: ${text}`);
                throw new Error(`Invalid JSON response format from AI model`);
            }

            await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    status: aiData.status as any,
                    aiConfidence: aiData.confidence,
                    aiResult: aiData as any,
                    ocrData: aiData.extractedData as any,
                },
            });

            this.logger.log(`AI Verification completed for ${documentId}: ${aiData.status}`);

            if (aiData.status === 'AI_FLAGGED') {
                await this.prisma.notification.create({
                    data: {
                        userId: document.userId,
                        title: 'Automatic Verification Failed ⏳',
                        message: 'Our automated system could not verify your documents. Your profile has been sent to our team for manual review.',
                        type: 'STATUS_UPDATE',
                    }
                }).catch(err => {
                    this.logger.error(`Failed to create flagging notification for user ${document.userId}: ${err.message}`);
                });

                // Send Email Notification
                this.mailerService.sendMail({
                    to: document.user.email,
                    subject: 'BuildMate Verification Status: Manual Review Pending',
                    text: `Hello ${document.user.fullName},\n\nOur automated system could not instantly verify your profile documents. Your application has been escalated to our team for manual review. No action is required from you at this time.\n\nBest Regards,\nThe BuildMate Trust Team`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #14213D; border-bottom: 2px solid #F59E0B; padding-bottom: 10px;">BuildMate Profile Verification Status</h2>
                            <p>Hello <strong>${document.user.fullName}</strong>,</p>
                            <p>Our automated verification system could not instantly match your uploaded documents to your profile details.</p>
                            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 4px; margin: 20px 0;">
                                <strong style="color: #92400E;">Status: Automated Check Failed & Manual Review Pending</strong>
                            </div>
                            <p><strong>What happens next?</strong> No action is required from you at this moment. Your application has been automatically escalated to our administrator team for manual review. We will notify you once our team has reviewed it.</p>
                            <p style="background-color: #F8FAFC; padding: 12px; border-radius: 4px; border: 1px dashed #E2E8F0; font-size: 13px; margin-top: 15px;">
                                <strong>Questions?</strong> If you have any concerns, please contact the BuildMate support team at <a href="mailto:support@buildmate.lk">support@buildmate.lk</a> or call our helpline at <strong>+94 11 234 5678</strong> (Weekdays 9 AM - 5 PM).
                            </p>
                            <br/>
                            <p style="color: #6B7280; font-size: 12px; border-top: 1px solid #E5E7EB; padding-top: 15px;">
                                Best Regards,<br/>
                                <strong>The BuildMate Trust Team</strong>
                            </p>
                        </div>
                    `
                }).catch(err => {
                    this.logger.error(`Failed to send manual review pending email to user ${document.user.email}: ${err.message}`);
                });
            }

            // Trigger auto-approval check
            await this.checkUserAutoApproval(document.userId);
            
            return aiData;

        } catch (error) {
            this.logger.error(`AI Verification failed for ${documentId}: ${error.message}`);
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'AI_FLAGGED' as any },
            });
        }
    }
}
