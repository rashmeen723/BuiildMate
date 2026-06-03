import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiVerificationService {
    private readonly logger = new Logger(AiVerificationService.name);
    private genAI: GoogleGenerativeAI;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
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
            if (document.documentType === 'CERTIFICATE') {
                const category = document.user.serviceProvider?.category || 'General';
                prompt = `
                    You are an expert document verification assistant for 'BuildMate', a marketplace in Sri Lanka.
                    Analyze the provided certificate image and compare it with the following user profile:
                    - Full Name: ${document.user.fullName}
                    - Expected Professional Field: ${category}
                    - Document Type: CERTIFICATE

                    Tasks:
                    1. Verify if the name on the certificate matches the profile name. Note that the match does NOT need to be an exact, character-for-character match. It should be a flexible match where the name on the ID card contains a significant part of the profile name, or is a variation/subset of it (e.g. "Rashmeen Kavindya" matches "Rashmeen Kavindya Perera", "R. Kavindya", or "Rashmeen K."). Set "nameMatch" to true if they match based on these flexible criteria, and false otherwise.
                    2. Check if the certificate is expired (if an expiry date is specified).
                    3. Look for signs of tampering or forgery.
                    4. Check if the certificate certifies skills relevant to the expected professional field ("${category}"). Set "looksAuthentic" to true if it is a relevant and authentic-looking certificate, and false if it is irrelevant or looks fake.
                    5. Extract key text: name of the qualification/qualification level (e.g. NVQ Level 4, Course Completion), issuing authority (e.g. NAITA, TVEC, University, Vocational Center), and the date of issue.

                    Return ONLY a JSON object with this structure:
                    {
                        "status": "AI_PASSED" | "AI_FLAGGED",
                        "confidence": number (0-1),
                        "reason": "short explanation of the findings, including details about name verification and trade relevance",
                        "extractedData": {
                            "qualification": "string",
                            "issuingAuthority": "string",
                            "issueDate": "string"
                        },
                        "checks": {
                            "nameMatch": boolean,
                            "notExpired": boolean,
                            "looksAuthentic": boolean
                        }
                    }
                `;
            } else if (document.documentType === 'UTILITY_BILL') {
                const address = document.user.rentalOwner?.formattedAddress || 'General Sri Lanka';
                prompt = `
                    You are an expert document verification assistant for 'BuildMate', a marketplace in Sri Lanka.
                    You are provided with up to three images:
                    1. A Utility Bill (mandatory)
                    2. The Front side of the user's National Identity Card (NIC) (optional/if available, shows photo and full name)
                    3. The Back side of the user's National Identity Card (NIC) (optional/if available, shows printed home address)

                    Compare these documents with the user's profile:
                    - Registered Full Name: ${document.user.fullName}
                    - Registered Home Address (Google Maps location): ${address}

                    Tasks:
                    1. **Name Verification**:
                       - Compare the name on the Utility Bill, the name on the National ID card Front side (if available), and the Registered Full Name.
                       - Sri Lankan names often have abbreviations/initials (e.g. "R.K. Perera" vs "Rashmeen Kavindya Perera" or "Rashmeen K."). Allow flexible matching. Set "nameMatch" to true if they all reasonably refer to the same person, and false if there is a clear mismatch.
                    2. **Address Verification**:
                       - Compare the address printed on the back of the National ID (if available), the address printed on the Utility Bill, and the Registered Home Address ("${address}").
                       - Address formats in Sri Lanka vary greatly between postal addresses (utility bills/NICs using assessment numbers, sub-localities) and reverse-geocoded map addresses. Verify if they refer to the same geographical/spatial property (e.g. same street name, sub-district, city, or general location coordinates). Set "addressMatch" to true if they match or correlate geographically, and false if they refer to entirely different properties.
                    3. **Recency**:
                       - Check if the utility bill is recent (e.g., within 3-6 months. Look for billing date if visible).
                    4. **Authenticity**:
                       - Look for signs of tampering, editing, or forgery across the documents. Set "looksAuthentic" to true if all provided documents appear to be genuine, and false otherwise.

                    Return ONLY a JSON object with this structure:
                    {
                        "status": "AI_PASSED" | "AI_FLAGGED",
                        "confidence": number (0-1),
                        "reason": "short explanation of the findings, including details about name verification across ID and Utility Bill, and geographical correlation of the addresses",
                        "extractedData": {
                            "nameOnUtilityBill": "string",
                            "nameOnIdCard": "string",
                            "addressOnUtilityBill": "string",
                            "addressOnIdCard": "string",
                            "billDate": "string"
                        },
                        "checks": {
                            "nameMatch": boolean,
                            "addressMatch": boolean,
                            "looksAuthentic": boolean
                        }
                    }
                `;
            } else {
                const isIdBack = document.documentType === 'ID_CARD_BACK';
                prompt = `
                    You are an expert document verification assistant for 'BuildMate', a marketplace in Sri Lanka.
                    Analyze the provided document image and compare it with the following user profile:
                    - Full Name: ${document.user.fullName}
                    - Document Type: ${document.documentType}

                    Tasks:
                    ${isIdBack ? `
                    1. Since this is the Back side of the identity card, it primarily contains address/other details rather than the name. Set "nameMatch" to true automatically since name verification is handled by the front card image.
                    ` : `
                    1. Verify if the name on the document matches the profile name. Note that the match does NOT need to be an exact, character-for-character match. It should be a flexible match where the name on the ID card contains a significant part of the profile name, or is a variation/subset of it (e.g. "Rashmeen Kavindya" matches "Rashmeen Kavindya Perera", "R. Kavindya", or "Rashmeen K."). Set "nameMatch" to true if they match based on these flexible criteria, and false otherwise.
                    `}
                    2. Check if the document is expired (if applicable).
                    3. Look for signs of tampering or forgery.
                    4. Extract all key text (Name, ID Number, Address, Expiry Date).

                    Return ONLY a JSON object with this structure:
                    {
                        "status": "AI_PASSED" | "AI_FLAGGED",
                        "confidence": number (0-1),
                        "reason": "short explanation of the findings, including details about name verification",
                        "extractedData": {
                            "name": "string",
                            "idNumber": "string",
                            "address": "string",
                            "expiryDate": "string"
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

                const idFrontDoc = document.user.documents.find(d => d.documentType === 'ID_CARD_FRONT');
                if (idFrontDoc) {
                    try {
                        this.logger.log(`Fetching ID Front image: ${idFrontDoc.documentUrl}`);
                        const idFrontData = await this.fetchImageAsBase64(idFrontDoc.documentUrl);
                        parts.push({
                            inlineData: {
                                data: idFrontData.data,
                                mimeType: idFrontData.mimeType
                            }
                        });
                    } catch (err) {
                        this.logger.warn(`Failed to fetch ID Front image ${idFrontDoc.documentUrl}: ${err.message}`);
                    }
                }

                const idBackDoc = document.user.documents.find(d => d.documentType === 'ID_CARD_BACK');
                if (idBackDoc) {
                    try {
                        this.logger.log(`Fetching ID Back image: ${idBackDoc.documentUrl}`);
                        const idBackData = await this.fetchImageAsBase64(idBackDoc.documentUrl);
                        parts.push({
                            inlineData: {
                                data: idBackData.data,
                                mimeType: idBackData.mimeType
                            }
                        });
                    } catch (err) {
                        this.logger.warn(`Failed to fetch ID Back image ${idBackDoc.documentUrl}: ${err.message}`);
                    }
                }
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

            // Auto-approval logic
            const updatedUser = await this.prisma.user.findUnique({
                where: { id: document.userId },
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
                    
                    const badgesToGrant: any[] = ['IDENTITY_VERIFIED'];
                    
                    if (updatedUser.serviceProvider) {
                        const hasCertificate = updatedUser.documents.some(d => d.documentType === 'CERTIFICATE');
                        if (hasCertificate) {
                            badgesToGrant.push('CERTIFIED_PRO');
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
                }
            }
            
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
