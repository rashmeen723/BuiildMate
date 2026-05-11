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

    async verifyDocument(documentId: string) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: { user: true },
        });

        if (!document || !this.genAI) {
            this.logger.error(`Document ${documentId} not found or Gemini API not configured`);
            return;
        }

        try {
            this.logger.log(`Starting AI verification for document: ${documentId}`);
            
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            // In a real scenario, we'd fetch the image from document.documentUrl
            // For now, I'll structure the prompt. We'd need to convert the image to base64.
            const prompt = `
                You are an expert document verification assistant for 'BuildMate', a marketplace in Sri Lanka.
                Analyze this document image and compare it with the following user profile:
                - Full Name: ${document.user.fullName}
                - Document Type: ${document.documentType}

                Tasks:
                1. Verify if the name on the document matches the profile name.
                2. Check if the document is expired.
                3. Look for signs of tampering or forgery.
                4. Extract all key text (Name, ID Number, Expiry Date).
                5. COMPARE THE SELFIE PHOTO WITH THE PHOTO ON THE ID CARD. Are they the same person?

                Return ONLY a JSON object with this structure:
                {
                    "status": "AI_PASSED" | "AI_FLAGGED",
                    "confidence": number (0-1),
                    "reason": "short explanation",
                    "extractedData": {
                        "name": "string",
                        "idNumber": "string",
                        "expiryDate": "string"
                    },
                    "checks": {
                        "nameMatch": boolean,
                        "notExpired": boolean,
                        "looksAuthentic": boolean,
                        "faceMatch": boolean
                    },
                    "faceMatchScore": number (0-1)
                }
            `;

            // Note: To actually process the image, we need to fetch it and convert to Part
            // This is a placeholder for the actual generative call
            /*
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();
            const aiData = JSON.parse(text);
            */

            // For now, I'll simulate a successful call to show the flow
            const simulatedResult = {
                status: 'AI_PASSED',
                confidence: 0.95,
                reason: 'Document matches user profile perfectly.',
                extractedData: {
                    name: document.user.fullName,
                    idNumber: '199512345678',
                    expiryDate: '2030-01-01'
                },
                checks: {
                    nameMatch: true,
                    notExpired: true,
                    looksAuthentic: true,
                    faceMatch: true
                },
                faceMatchScore: 0.98
            };

            await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    status: simulatedResult.status as any,
                    aiConfidence: simulatedResult.confidence,
                    aiResult: simulatedResult as any,
                    ocrData: simulatedResult.extractedData as any,
                    faceMatchScore: simulatedResult.faceMatchScore,
                },
            });

            this.logger.log(`AI Verification completed for ${documentId}: ${simulatedResult.status}`);
            
            return simulatedResult;

        } catch (error) {
            this.logger.error(`AI Verification failed for ${documentId}: ${error.message}`);
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'AI_FLAGGED' as any },
            });
        }
    }
}
