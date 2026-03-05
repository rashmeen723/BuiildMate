import { PrismaClient, Role, VerificationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
        data: {
            email: 'testprovider@buildmate.com',
            password: password,
            fullName: 'Test Professional',
            phone: '0712345678',
            role: Role.SERVICE_PROVIDER,
            isEmailVerified: true,
            serviceProvider: {
                create: {
                    category: 'Electrician',
                    yearsOfExperience: '5',
                    skills: ['House Wiring', 'AC Repair'],
                    status: VerificationStatus.PENDING,
                    formattedAddress: '123, Main Street, Colombo 07'
                }
            },
            documents: {
                create: [
                    {
                        documentType: 'ID_CARD',
                        documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
                    },
                    {
                        documentType: 'CERTIFICATE',
                        documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
                    }
                ]
            }
        }
    });

    console.log('Created test provider:', user.fullName);
    await prisma.$disconnect();
}

main();
