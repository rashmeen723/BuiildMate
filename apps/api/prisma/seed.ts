import { PrismaClient, Role, VerificationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing existing database records...');

    // Clear in order of dependencies to avoid foreign key constraints
    await prisma.dispute.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.toolRental.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.otp.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.tool.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.rentalOwnerProfile.deleteMany({});
    await prisma.serviceProviderProfile.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Existing records cleared!');
    console.log('Seeding new data...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // Moratuwa and surrounding coordinates
    // Moratuwa: 6.7730, 79.8816
    // Panadura: 6.7118, 79.9071
    // Ratmalana: 6.8172, 79.8824
    // Mount Lavinia: 6.8290, 79.8662
    // Piliyandala: 6.7972, 79.9234

    const locations = [
        { lat: 6.7730, lng: 79.8816, address: 'Moratuwa Central, Moratuwa' },
        { lat: 6.7118, lng: 79.9071, address: 'Panadura Bus Stand, Panadura' },
        { lat: 6.8172, lng: 79.8824, address: 'Ratmalana Airport Road, Ratmalana' },
        { lat: 6.8290, lng: 79.8662, address: 'Mount Lavinia Hotel Road, Mount Lavinia' },
        { lat: 6.7972, lng: 79.9234, address: 'Piliyandala Clock Tower, Piliyandala' },
    ];

    // Create Service Providers
    const serviceProviders = [
        { name: 'Kamal Perera', category: 'Electrician', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { name: 'Nimal Silva', category: 'Plumber', img: 'https://randomuser.me/api/portraits/men/44.jpg' },
        { name: 'Sunil Shantha', category: 'Carpenter', img: 'https://randomuser.me/api/portraits/men/22.jpg' },
        { name: 'Ruwan Fernando', category: 'Painter', img: 'https://randomuser.me/api/portraits/men/85.jpg' },
        { name: 'Saman Kumara', category: 'AC Technician', img: 'https://randomuser.me/api/portraits/men/11.jpg' }
    ];

    for (let i = 0; i < serviceProviders.length; i++) {
        const sp = serviceProviders[i];
        const loc = locations[i % locations.length];

        await prisma.user.create({
            data: {
                email: `provider${i + 1}@example.com`,
                password: passwordHash,
                fullName: sp.name,
                phone: `077111222${i}`,
                profileImage: sp.img,
                role: Role.SERVICE_PROVIDER,
                isEmailVerified: true,
                serviceProvider: {
                    create: {
                        category: sp.category,
                        yearsOfExperience: `${2 + i}`,
                        skills: [`${sp.category} Expert`, 'Troubleshooting', 'Maintenance'],
                        hourlyRate: 500 + (100 * i),
                        status: VerificationStatus.APPROVED,
                        latitude: loc.lat,
                        longitude: loc.lng,
                        formattedAddress: loc.address,
                        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Everyday'],
                        workingHoursStart: '08:00 AM',
                        workingHoursEnd: '06:00 PM'
                    }
                }
            }
        });
    }

    // Create Rental Owners
    const rentalOwners = [
        { name: 'Ravi Hardware', ownerName: 'Ravindra Pieris', img: 'https://randomuser.me/api/portraits/men/50.jpg' },
        { name: 'Gamage Tools', ownerName: 'Wasantha Gamage', img: 'https://randomuser.me/api/portraits/men/60.jpg' },
        { name: 'Lanka Builders Equip', ownerName: 'Chanaka De Silva', img: 'https://randomuser.me/api/portraits/men/70.jpg' }
    ];

    const ownerUsers: any[] = [];
    for (let i = 0; i < rentalOwners.length; i++) {
        const ro = rentalOwners[i];
        const loc = locations[(i + 2) % locations.length]; // Mix up locations

        const user = await prisma.user.create({
            data: {
                email: `owner${i + 1}@example.com`,
                password: passwordHash,
                fullName: ro.ownerName,
                phone: `071222333${i}`,
                profileImage: ro.img,
                role: Role.RENTAL_OWNER,
                isEmailVerified: true,
                rentalOwner: {
                    create: {
                        businessName: ro.name,
                        toolCategories: ['Power Tools', 'Ladders', 'Safety Gear'],
                        yearsInBusiness: `${5 + i}`,
                        status: VerificationStatus.APPROVED,
                        latitude: loc.lat,
                        longitude: loc.lng,
                        formattedAddress: loc.address,
                    }
                }
            },
            include: {
                rentalOwner: true
            }
        });
        ownerUsers.push(user);
    }

    // Tools pool
    const toolsPool = [
        { name: 'DeWalt Impact Drill', category: 'Power Tools', rate: 1500, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800' },
        { name: 'Makita Angle Grinder', category: 'Power Tools', rate: 1200, img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=800' },
        { name: 'Bosch Circular Saw', category: 'Power Tools', rate: 2000, img: 'https://images.unsplash.com/photo-1546948630-1149ea60dc86?q=80&w=800' },
        { name: '10ft Aluminum Ladder', category: 'Ladders', rate: 800, img: 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=800' },
        { name: '20ft Extension Ladder', category: 'Ladders', rate: 1500, img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800' },
        { name: 'Electric Cement Mixer', category: 'Construction', rate: 4500, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800' },
        { name: 'Honda Lawnmower', category: 'Gardening', rate: 2500, img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800' },
        { name: 'Stihl Chainsaw', category: 'Gardening', rate: 3000, img: 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?q=80&w=800' },
        { name: 'High Pressure Washer', category: 'Cleaning', rate: 2000, img: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=800' },
        { name: 'Scaffolding Set (5 Frames)', category: 'Scaffolding', rate: 3500, img: 'https://images.unsplash.com/photo-1627989396347-1af6bf6ebac9?q=80&w=800' },
    ];

    const allTools: any[] = [];
    const usedToolsPool = [...toolsPool, ...toolsPool]; // Duplicate to get more items

    // Distribute tools among owners
    for (let i = 0; i < usedToolsPool.length; i++) {
        const toolData = usedToolsPool[i];
        const ownerProfile = ownerUsers[i % ownerUsers.length].rentalOwner;

        if (!ownerProfile) continue;

        const tool = await prisma.tool.create({
            data: {
                name: toolData.name,
                description: `Professional grade ${toolData.name} in excellent condition. Suitable for all your ${toolData.category.toLowerCase()} needs. Carefully maintained and regularly serviced.`,
                category: toolData.category,
                dailyRate: toolData.rate,
                ownerId: ownerProfile.id,
                images: [toolData.img],
                status: 'AVAILABLE',
                available: true
            }
        });
        allTools.push(tool);
    }

    // Create a Household User (For testing the Home screen)
    const householdUser = await prisma.user.create({
        data: {
            email: 'user@example.com',
            password: passwordHash,
            fullName: 'Rashmeen',
            phone: '0701112223',
            profileImage: 'https://randomuser.me/api/portraits/men/90.jpg',
            role: Role.HOUSEHOLD,
            isEmailVerified: true,
            addresses: {
                create: {
                    addressLine1: 'Main Road',
                    city: 'Moratuwa',
                    latitude: 6.7730,
                    longitude: 79.8816,
                    isDefault: true
                }
            }
        }
    });

    console.log('Seed completed successfully!');
    console.log(`Test user: user@example.com / password123`);
    console.log(`Created ${serviceProviders.length} providers and ${rentalOwners.length} tool owners with ${allTools.length} tools near Moratuwa.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
