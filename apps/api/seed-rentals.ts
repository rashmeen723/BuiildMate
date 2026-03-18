import { PrismaClient, Role, VerificationStatus, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Rental Owner data...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Rental Owner User
    const ownerUser = await prisma.user.upsert({
        where: { email: 'rental@buildmate.com' },
        update: {},
        create: {
            email: 'rental@buildmate.com',
            password: hashedPassword,
            fullName: 'Nuwan Perera',
            phone: '+94771234567',
            role: Role.RENTAL_OWNER,
            profileImage: 'https://images.unsplash.com/photo-1540569014015-19a7ee504e3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            isEmailVerified: true,
            rentalOwner: {
                create: {
                    businessName: 'Nuwan Tools & Hardware',
                    toolCategories: ['Power Tools', 'Ladders', 'Construction', 'Gardening'],
                    yearsInBusiness: '5',
                    status: VerificationStatus.APPROVED,
                    formattedAddress: 'No.45, Galle Road, Colombo 03',
                    latitude: 6.9147,
                    longitude: 79.8541,
                }
            },
            addresses: {
                create: {
                    addressLine1: 'No.45, Galle Road, Colombo 03',
                    city: 'Colombo',
                    latitude: 6.9147,
                    longitude: 79.8541,
                    isDefault: true
                }
            }
        },
        include: { rentalOwner: true }
    });

    const ownerProfileId = ownerUser.rentalOwner!.id;

    // 2. Create Tools
    const toolsData = [
        {
            name: 'Bosch Hammer Drill GBH 220',
            description: 'Powerful 720W motor and 2.0J impact energy for effective hammer drilling in concrete.',
            category: 'Power Tools',
            dailyRate: 1200,
            images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
            status: 'AVAILABLE'
        },
        {
            name: 'DeWalt Circular Saw',
            description: '18V cordless circular saw, 184mm blade. Perfect for clean wood cuts.',
            category: 'Power Tools',
            dailyRate: 1500,
            images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
            status: 'AVAILABLE'
        },
        {
            name: '12-Step Aluminum Ladder',
            description: 'Heavy duty multipurpose folding ladder. Max height 3.7m.',
            category: 'Ladders',
            dailyRate: 800,
            images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
            status: 'RENTED'
        },
        {
            name: 'STIHL Petrol Lawn Mower',
            description: 'Easy-start petrol mower for medium to large lawns.',
            category: 'Gardening',
            dailyRate: 2000,
            images: ['https://images.unsplash.com/photo-1589410319565-f95213605e54?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
            status: 'AVAILABLE'
        },
        {
            name: 'Makita Angle Grinder',
            description: '9553NBX 100mm Angle Grinder with powerful 710W motor.',
            category: 'Power Tools',
            dailyRate: 900,
            images: ['https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
            status: 'AVAILABLE'
        }
    ];

    for (const tool of toolsData) {
        await prisma.tool.create({
            data: {
                ...tool,
                ownerId: ownerProfileId
            }
        });
    }

    // 3. Create a Customer user to mock rentals
    const customerUser = await prisma.user.upsert({
        where: { email: 'customer@test.com' },
        update: {},
        create: {
            email: 'customer@test.com',
            password: hashedPassword,
            fullName: 'Kasun Bandara',
            phone: '+94711111111',
            role: Role.HOUSEHOLD,
            isEmailVerified: true
        }
    });

    const drillTool = await prisma.tool.findFirst({ where: { name: 'Bosch Hammer Drill GBH 220' } });
    const ladderTool = await prisma.tool.findFirst({ where: { name: '12-Step Aluminum Ladder' } });

    // 4. Create Mock Rentals
    if (drillTool && ladderTool) {
        await prisma.toolRental.createMany({
            data: [
                {
                    toolId: drillTool.id,
                    customerId: customerUser.id,
                    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                    status: BookingStatus.CONFIRMED,
                    totalAmount: 3600,
                    pickupLocation: 'No.45, Galle Road, Colombo 03'
                },
                {
                    toolId: ladderTool.id,
                    customerId: customerUser.id,
                    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    status: BookingStatus.PAID,
                    totalAmount: 2400,
                    pickupLocation: 'No.45, Galle Road, Colombo 03'
                }
            ]
        });
    }

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
