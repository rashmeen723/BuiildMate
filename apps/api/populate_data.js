const { PrismaClient, Role, VerificationStatus, BookingStatus, DisputeStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Helper to generate type-safe, correctly padded Date objects
const makeDate = (year, month, day, time = '00:00:00Z') => {
    return new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${time}`);
};

async function main() {
    console.log('--- DATABASE DATA POPULATION START ---');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Clear existing database records in correct order of dependency
    console.log('Clearing old database records...');
    await prisma.review.deleteMany({});
    await prisma.dispute.deleteMany({});
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
    console.log('Database cleared.');

    // Helper to create users
    async function createUser(id, email, fullName, role, phone, profileImage) {
        return await prisma.user.create({
            data: {
                id,
                email,
                password: passwordHash,
                fullName,
                phone,
                role,
                isEmailVerified: true,
                profileImage
            }
        });
    }

    console.log('Creating primary demo users...');
    
    // Customers (Role.HOUSEHOLD)
    const customer1 = await createUser('75812404-477d-46d1-a55c-1e8878e0951c', 'customer1@example.com', 'Rashmeen', Role.HOUSEHOLD, '0701112223', 'https://randomuser.me/api/portraits/men/90.jpg');
    const customer2 = await createUser('d3b10b00-349f-4316-95fb-8a213e4b7529', 'customer2@example.com', 'Dilusha Liyanage', Role.HOUSEHOLD, '0703334445', 'https://randomuser.me/api/portraits/women/45.jpg');
    const customer3 = await createUser('e4c10b00-349f-4316-95fb-8a213e4b7530', 'customer3@example.com', 'Sajith Wijesinghe', Role.HOUSEHOLD, '0705556667', 'https://randomuser.me/api/portraits/men/15.jpg');
    const customer4 = await createUser('f5d10b00-349f-4316-95fb-8a213e4b7531', 'customer4@example.com', 'Ruwan Fernando', Role.HOUSEHOLD, '0707778889', 'https://randomuser.me/api/portraits/men/46.jpg');
    const customer5 = await createUser('a6e10b00-349f-4316-95fb-8a213e4b7532', 'customer5@example.com', 'Piyumi Silva', Role.HOUSEHOLD, '0709990001', 'https://randomuser.me/api/portraits/women/12.jpg');
    const customer6 = await createUser('b7f10b00-349f-4316-95fb-8a213e4b7533', 'customer6@example.com', 'Sanduni Perera', Role.HOUSEHOLD, '0702224446', 'https://randomuser.me/api/portraits/women/28.jpg');

    // Service Partners (Role.SERVICE_PROVIDER)
    const provider1 = await createUser('97812404-477d-46d1-a55c-1e8878e0951e', 'provider1@example.com', 'Kamal Perera', Role.SERVICE_PROVIDER, '0771112221', 'https://randomuser.me/api/portraits/men/32.jpg');
    const provider2 = await createUser('a8812404-477d-46d1-a55c-1e8878e0951f', 'provider2@example.com', 'Nimal Silva', Role.SERVICE_PROVIDER, '0771112222', 'https://randomuser.me/api/portraits/men/44.jpg');

    // Rental Partners (Role.RENTAL_OWNER)
    const owner1 = await createUser('b9812404-477d-46d1-a55c-1e8878e0952a', 'owner1@example.com', 'Ravindra Pieris', Role.RENTAL_OWNER, '0712223331', 'https://randomuser.me/api/portraits/men/50.jpg');
    const owner2 = await createUser('ca812404-477d-46d1-a55c-1e8878e0952b', 'owner2@example.com', 'Wasantha Gamage', Role.RENTAL_OWNER, '0712223332', 'https://randomuser.me/api/portraits/men/60.jpg');

    // 2. Create Addresses
    console.log('Creating user addresses...');
    await prisma.address.createMany({
        data: [
            { userId: customer1.id, addressLine1: '45/2 Galle Road, Moratuwa', city: 'Moratuwa', latitude: 6.7730, longitude: 79.8816, isDefault: true },
            { userId: customer2.id, addressLine1: '12 Temple Road, Panadura', city: 'Panadura', latitude: 6.7118, longitude: 79.9071, isDefault: true },
            { userId: customer3.id, addressLine1: '18 Galle Road, Dehiwala', city: 'Dehiwala', latitude: 6.8378, longitude: 79.8732, isDefault: true },
            { userId: customer4.id, addressLine1: '201 High Level Road, Nugegoda', city: 'Nugegoda', latitude: 6.8649, longitude: 79.8997, isDefault: true },
            { userId: customer5.id, addressLine1: '55 Parliament Road, Kotte', city: 'Kotte', latitude: 6.8911, longitude: 79.9162, isDefault: true },
            { userId: customer6.id, addressLine1: '30 Baseline Road, Colombo 08', city: 'Colombo', latitude: 6.9271, longitude: 79.8777, isDefault: true },
            { userId: provider1.id, addressLine1: '88 Central Road, Moratuwa', city: 'Moratuwa', latitude: 6.7732, longitude: 79.8810, isDefault: true },
            { userId: provider2.id, addressLine1: '14 Station Road, Ratmalana', city: 'Ratmalana', latitude: 6.8172, longitude: 79.8824, isDefault: true },
            { userId: owner1.id, addressLine1: '120 Galle Road, Moratuwa', city: 'Moratuwa', latitude: 6.7725, longitude: 79.8818, isDefault: true },
            { userId: owner2.id, addressLine1: '55 Clock Tower, Piliyandala', city: 'Piliyandala', latitude: 6.7972, longitude: 79.9234, isDefault: true }
        ]
    });

    // 3. Create Service Provider Profiles
    console.log('Creating service profiles...');
    await prisma.serviceProviderProfile.create({
        data: {
            userId: provider1.id,
            category: 'Electrician',
            yearsOfExperience: '5',
            status: VerificationStatus.APPROVED,
            hourlyRate: 850,
            formattedAddress: 'Moratuwa Central, Moratuwa',
            latitude: 6.7730,
            longitude: 79.8816,
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Everyday'],
            workingHoursStart: '08:00 AM',
            workingHoursEnd: '06:00 PM',
            skills: ['Residential Wiring', 'Appliance Repair', 'Emergency Fixes']
        }
    });

    await prisma.serviceProviderProfile.create({
        data: {
            userId: provider2.id,
            category: 'Plumber',
            yearsOfExperience: '8',
            status: VerificationStatus.APPROVED,
            hourlyRate: 750,
            formattedAddress: 'Ratmalana Central, Ratmalana',
            latitude: 6.8172,
            longitude: 79.8824,
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            workingHoursStart: '08:30 AM',
            workingHoursEnd: '05:30 PM',
            skills: ['Pipe Fitting', 'Leak Detection', 'Drain Clearing', 'Tap Installation']
        }
    });

    // 4. Create Rental Owner Profiles
    console.log('Creating rental profiles...');
    const pOwner1 = await prisma.rentalOwnerProfile.create({
        data: {
            userId: owner1.id,
            businessName: 'Ravi Hardware',
            toolCategories: ['Power Tools', 'Ladders', 'Safety Gear'],
            yearsInBusiness: '8',
            status: VerificationStatus.APPROVED,
            latitude: 6.7725,
            longitude: 79.8818,
            formattedAddress: 'Ravi Hardware, Galle Road, Moratuwa'
        }
    });

    const pOwner2 = await prisma.rentalOwnerProfile.create({
        data: {
            userId: owner2.id,
            businessName: 'Gamage Tools',
            toolCategories: ['Ladders', 'Gardening', 'Construction'],
            yearsInBusiness: '6',
            status: VerificationStatus.APPROVED,
            latitude: 6.7972,
            longitude: 79.9234,
            formattedAddress: 'Gamage Tools, Clock Tower Road, Piliyandala'
        }
    });

    // 5. Create Tools (utilization will show 3 rented / 7 total tools)
    console.log('Creating tools catalog...');
    const tools = [
        { name: 'DeWalt Impact Drill', category: 'Power Tools', rate: 1500, ownerId: pOwner1.id, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800', status: 'AVAILABLE' },
        { name: 'Makita Angle Grinder', category: 'Power Tools', rate: 1200, ownerId: pOwner1.id, img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=800', status: 'RENTED' },
        { name: 'Bosch Circular Saw', category: 'Power Tools', rate: 2000, ownerId: pOwner1.id, img: 'https://images.unsplash.com/photo-1546948630-1149ea60dc86?q=80&w=800', status: 'AVAILABLE' },
        { name: '10ft Aluminum Ladder', category: 'Ladders', rate: 800, ownerId: pOwner1.id, img: 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=800', status: 'RENTED' },
        
        { name: 'Honda Lawnmower', category: 'Gardening', rate: 2500, ownerId: pOwner2.id, img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800', status: 'AVAILABLE' },
        { name: 'Stihl Chainsaw', category: 'Gardening', rate: 3000, ownerId: pOwner2.id, img: 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?q=80&w=800', status: 'RENTED' },
        { name: 'Electric Cement Mixer', category: 'Construction', rate: 4500, ownerId: pOwner2.id, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800', status: 'AVAILABLE' },
    ];

    const dbTools = [];
    for (const t of tools) {
        const tool = await prisma.tool.create({
            data: {
                name: t.name,
                description: `Professional grade ${t.name}. Carefully maintained, serviced and fully operational. Suitable for commercial or household utility.`,
                category: t.category,
                dailyRate: t.rate,
                ownerId: t.ownerId,
                images: [t.img],
                status: t.status,
                available: t.status === 'AVAILABLE'
            }
        });
        dbTools.push(tool);
    }

    const tDrill = dbTools.find(t => t.name === 'DeWalt Impact Drill');
    const tGrinder = dbTools.find(t => t.name === 'Makita Angle Grinder');
    const tSaw = dbTools.find(t => t.name === 'Bosch Circular Saw');
    const tLadder = dbTools.find(t => t.name === '10ft Aluminum Ladder');
    const tLawn = dbTools.find(t => t.name === 'Honda Lawnmower');
    const tChainsaw = dbTools.find(t => t.name === 'Stihl Chainsaw');

    // 6. Seed Historical Data (Dec - June)
    console.log('Seeding historical bookings and rentals (Dec - June)...');
    
    // December (Target: 5 bookings, 2 rentals, ~12k LKR)
    const hbDec1 = await createHistoricalBooking(customer1.id, provider1.id, 'Electrician', makeDate(2025, 12, 5, '10:00:00Z'), 2000);
    const hbDec2 = await createHistoricalBooking(customer2.id, provider2.id, 'Plumber', makeDate(2025, 12, 10, '14:00:00Z'), 1500);
    const hbDec3 = await createHistoricalBooking(customer1.id, provider1.id, 'Electrician', makeDate(2025, 12, 15, '09:00:00Z'), 1800);
    const hbDec4 = await createHistoricalBooking(customer2.id, provider2.id, 'Plumber', makeDate(2025, 12, 20, '11:00:00Z'), 1200);
    await createHistoricalBooking(customer1.id, provider1.id, 'Electrician', makeDate(2025, 12, 24, '15:00:00Z'), 2500);
    const hrDec1 = await createHistoricalRental(customer1.id, tDrill.id, makeDate(2025, 12, 5), makeDate(2025, 12, 6), 1500);
    const hrDec2 = await createHistoricalRental(customer2.id, tLadder.id, makeDate(2025, 12, 18), makeDate(2025, 12, 20), 1600);

    // January (Target: 8 bookings, 4 rentals, ~22k LKR)
    const hbJan1 = await createHistoricalBooking(customer1.id, provider1.id, 'Electrician', makeDate(2026, 1, 5, '10:00:00Z'), 1800);
    const hbJan2 = await createHistoricalBooking(customer2.id, provider2.id, 'Plumber', makeDate(2026, 1, 8, '13:00:00Z'), 1500);
    for (let i = 1; i < 4; i++) {
        await createHistoricalBooking(customer1.id, provider1.id, 'Electrician', makeDate(2026, 1, 5 + i * 5, '10:00:00Z'), 1800);
        await createHistoricalBooking(customer2.id, provider2.id, 'Plumber', makeDate(2026, 1, 8 + i * 5, '13:00:00Z'), 1500);
    }
    const hrJan1 = await createHistoricalRental(customer1.id, tDrill.id, makeDate(2026, 1, 4), makeDate(2026, 1, 6), 3000);
    const hrJan2 = await createHistoricalRental(customer2.id, tSaw.id, makeDate(2026, 1, 12), makeDate(2026, 1, 14), 4000);
    const hrJan3 = await createHistoricalRental(customer1.id, tLadder.id, makeDate(2026, 1, 18), makeDate(2026, 1, 19), 800);
    const hrJan4 = await createHistoricalRental(customer2.id, tLawn.id, makeDate(2026, 1, 25), makeDate(2026, 1, 26), 2500);

    // February (Target: 12 bookings, 6 rentals, ~32k LKR)
    const hbFeb1 = await createHistoricalBooking(customer1.id, provider1.id, 'Electrician', makeDate(2026, 2, 2, '09:00:00Z'), 1700);
    const hbFeb2 = await createHistoricalBooking(customer2.id, provider2.id, 'Plumber', makeDate(2026, 2, 4, '14:30:00Z'), 1600);
    for (let i = 1; i < 6; i++) {
        await createHistoricalBooking(customer1.id, provider1.id, 'Electrician', makeDate(2026, 2, 2 + i * 4, '09:00:00Z'), 1700);
        await createHistoricalBooking(customer2.id, provider2.id, 'Plumber', makeDate(2026, 2, 4 + i * 4, '14:30:00Z'), 1600);
    }
    const hrFeb1 = await createHistoricalRental(customer1.id, tDrill.id, makeDate(2026, 2, 5), makeDate(2026, 2, 6), 1500);
    const hrFeb2 = await createHistoricalRental(customer2.id, tSaw.id, makeDate(2026, 2, 10), makeDate(2026, 2, 11), 2000);
    const hrFeb3 = await createHistoricalRental(customer1.id, tLawn.id, makeDate(2026, 2, 15), makeDate(2026, 2, 17), 5000);
    const hrFeb4 = await createHistoricalRental(customer2.id, tChainsaw.id, makeDate(2026, 2, 20), makeDate(2026, 2, 21), 3000);
    const hrFeb5 = await createHistoricalRental(customer1.id, tLadder.id, makeDate(2026, 2, 22), makeDate(2026, 2, 23), 800);
    const hrFeb6 = await createHistoricalRental(customer2.id, tDrill.id, makeDate(2026, 2, 25), makeDate(2026, 2, 26), 1500);

    // March (Target: 15 bookings, 8 rentals, ~45k LKR)
    for (let i = 0; i < 8; i++) {
        await createHistoricalBooking(customer1.id, provider1.id, 'Electrician', makeDate(2026, 3, 2 + i * 3, '10:00:00Z'), 2000);
        if (i < 7) await createHistoricalBooking(customer2.id, provider2.id, 'Plumber', makeDate(2026, 3, 3 + i * 3, '15:00:00Z'), 1800);
    }
    await createHistoricalRental(customer1.id, tSaw.id, makeDate(2026, 3, 2), makeDate(2026, 3, 5), 6000);
    await createHistoricalRental(customer2.id, tDrill.id, makeDate(2026, 3, 8), makeDate(2026, 3, 10), 3000);
    await createHistoricalRental(customer1.id, tLawn.id, makeDate(2026, 3, 12), makeDate(2026, 3, 13), 2500);
    await createHistoricalRental(customer2.id, tChainsaw.id, makeDate(2026, 3, 16), makeDate(2026, 3, 18), 6000);
    await createHistoricalRental(customer1.id, tLadder.id, makeDate(2026, 3, 20), makeDate(2026, 3, 22), 1600);
    await createHistoricalRental(customer2.id, tDrill.id, makeDate(2026, 3, 24), makeDate(2026, 3, 25), 1500);
    await createHistoricalRental(customer1.id, tSaw.id, makeDate(2026, 3, 26), makeDate(2026, 3, 27), 2000);
    await createHistoricalRental(customer2.id, tLawn.id, makeDate(2026, 3, 28), makeDate(2026, 3, 30), 5000);

    // April (Target: 20 bookings, 12 rentals, ~68k LKR)
    for (let i = 0; i < 10; i++) {
        await createHistoricalBooking(customer1.id, provider1.id, 'Electrician', makeDate(2026, 4, 1 + i * 3, '09:00:00Z'), 2200);
        await createHistoricalBooking(customer2.id, provider2.id, 'Plumber', makeDate(2026, 4, 2 + i * 3, '14:00:00Z'), 1800);
    }
    await createHistoricalRental(customer1.id, tSaw.id, makeDate(2026, 4, 2), makeDate(2026, 4, 4), 4000);
    await createHistoricalRental(customer2.id, tDrill.id, makeDate(2026, 4, 6), makeDate(2026, 4, 9), 4500);
    await createHistoricalRental(customer1.id, tChainsaw.id, makeDate(2026, 4, 10), makeDate(2026, 4, 12), 6000);
    await createHistoricalRental(customer2.id, tLawn.id, makeDate(2026, 4, 13), makeDate(2026, 4, 14), 2500);
    await createHistoricalRental(customer1.id, tLadder.id, makeDate(2026, 4, 16), makeDate(2026, 4, 18), 1600);
    await createHistoricalRental(customer2.id, tDrill.id, makeDate(2026, 4, 20), makeDate(2026, 4, 21), 1500);
    await createHistoricalRental(customer1.id, tSaw.id, makeDate(2026, 4, 22), makeDate(2026, 4, 24), 4000);
    await createHistoricalRental(customer2.id, tLawn.id, makeDate(2026, 4, 25), makeDate(2026, 4, 26), 2500);
    await createHistoricalRental(customer1.id, tChainsaw.id, makeDate(2026, 4, 27), makeDate(2026, 4, 28), 3000);
    await createHistoricalRental(customer2.id, tLadder.id, makeDate(2026, 4, 29), makeDate(2026, 4, 30), 800);

    // May (Target: 25 bookings, 15 rentals, ~88k LKR)
    for (let i = 0; i < 13; i++) {
        await createHistoricalBooking(customer1.id, provider1.id, 'Electrician', makeDate(2026, 5, 1 + i * 2, '10:00:00Z'), 2100);
        if (i < 12) await createHistoricalBooking(customer2.id, provider2.id, 'Plumber', makeDate(2026, 5, 2 + i * 2, '15:30:00Z'), 1900);
    }
    for (let i = 0; i < 5; i++) {
        await createHistoricalRental(customer1.id, tDrill.id, makeDate(2026, 5, 2 + i * 5), makeDate(2026, 5, 3 + i * 5), 1500);
        await createHistoricalRental(customer2.id, tSaw.id, makeDate(2026, 5, 4 + i * 5), makeDate(2026, 5, 5 + i * 5), 4000);
        await createHistoricalRental(customer1.id, tChainsaw.id, makeDate(2026, 5, 5 + i * 5), makeDate(2026, 5, 7 + i * 5), 6000);
    }

    // June (Target: Current active transactions)
    console.log('Seeding June current bookings and rentals...');

    const today = new Date();
    const getDateRel = (daysOffset) => {
        const d = new Date(today);
        d.setDate(today.getDate() + daysOffset);
        return d;
    };

    // provider1 (Kamal) schedule bookings
    const bKamalPast1 = await prisma.booking.create({
        data: {
            customerId: customer1.id,
            providerId: provider1.id,
            serviceType: 'Electrician',
            bookingDate: getDateRel(-4),
            startTime: '09:00 AM',
            endTime: '11:00 AM',
            status: 'PAID',
            totalAmount: 1700,
            address: '45/2 Galle Road, Moratuwa',
            description: 'Wiring replacement in living room.',
            latitude: 6.7730,
            longitude: 79.8816
        }
    });

    const bKamalPast2 = await prisma.booking.create({
        data: {
            customerId: customer3.id,
            providerId: provider1.id,
            serviceType: 'Electrician',
            bookingDate: getDateRel(-3),
            startTime: '10:00 AM',
            endTime: '12:00 PM',
            status: 'COMPLETED',
            totalAmount: 2000,
            address: '18 Galle Road, Dehiwala',
            description: 'Ceiling fan installation.',
            latitude: 6.8378,
            longitude: 79.8732
        }
    });

    const bKamalPast3 = await prisma.booking.create({
        data: {
            customerId: customer4.id,
            providerId: provider1.id,
            serviceType: 'Electrician',
            bookingDate: getDateRel(-2),
            startTime: '11:00 AM',
            endTime: '01:00 PM',
            status: 'CANCELLED',
            totalAmount: 1800,
            address: '201 High Level Road, Nugegoda',
            description: 'AC unit checking.',
            latitude: 6.8649,
            longitude: 79.8997
        }
    });

    // OVERDUE Booking (Kamal) - Confirmed on yesterday but not updated
    const bKamalOverdue1 = await prisma.booking.create({
        data: {
            customerId: customer5.id,
            providerId: provider1.id,
            serviceType: 'Electrician',
            bookingDate: getDateRel(-1),
            startTime: '09:00 AM',
            endTime: '11:00 AM',
            status: 'CONFIRMED',
            totalAmount: 2200,
            address: '55 Parliament Road, Kotte',
            description: 'Exhaust fan wiring fix.',
            latitude: 6.8911,
            longitude: 79.9162
        }
    });

    const bKamalPast4 = await prisma.booking.create({
        data: {
            customerId: customer6.id,
            providerId: provider1.id,
            serviceType: 'Electrician',
            bookingDate: getDateRel(-1),
            startTime: '02:00 PM',
            endTime: '04:00 PM',
            status: 'PAID',
            totalAmount: 2500,
            address: '30 Baseline Road, Colombo 08',
            description: 'Circuit breaker tripping check.',
            latitude: 6.9271,
            longitude: 79.8777
        }
    });

    // Today's Bookings (Kamal)
    const bKamalTodayActive = await prisma.booking.create({
        data: {
            customerId: customer1.id,
            providerId: provider1.id,
            serviceType: 'Electrician',
            bookingDate: getDateRel(0),
            startTime: '09:00 AM',
            endTime: '11:00 AM',
            status: 'IN_PROGRESS',
            totalAmount: 1700,
            address: '45/2 Galle Road, Moratuwa',
            description: 'Checking short circuit in the kitchen wiring.',
            latitude: 6.7730,
            longitude: 79.8816
        }
    });

    const bKamalTodayPending = await prisma.booking.create({
        data: {
            customerId: customer2.id,
            providerId: provider1.id,
            serviceType: 'Electrician',
            bookingDate: getDateRel(0),
            startTime: '02:00 PM',
            endTime: '04:00 PM',
            status: 'PENDING',
            totalAmount: 2000,
            address: '12 Temple Road, Panadura',
            description: 'Installing dynamic dimmers and fancy lighting switches.',
            latitude: 6.7118,
            longitude: 79.9071
        }
    });

    // Upcoming Bookings (Kamal)
    const bKamalUpcoming1 = await prisma.booking.create({
        data: {
            customerId: customer4.id,
            providerId: provider1.id,
            serviceType: 'Electrician',
            bookingDate: getDateRel(1),
            startTime: '09:00 AM',
            endTime: '11:00 AM',
            status: 'CONFIRMED',
            totalAmount: 1800,
            address: '201 High Level Road, Nugegoda',
            description: 'General wiring checkup.',
            latitude: 6.8649,
            longitude: 79.8997
        }
    });

    const bKamalUpcoming2 = await prisma.booking.create({
        data: {
            customerId: customer5.id,
            providerId: provider1.id,
            serviceType: 'Electrician',
            bookingDate: getDateRel(2),
            startTime: '10:00 AM',
            endTime: '12:00 PM',
            status: 'PENDING',
            totalAmount: 1900,
            address: '55 Parliament Road, Kotte',
            description: 'Doorbell and buzzer install.',
            latitude: 6.8911,
            longitude: 79.9162
        }
    });

    const bKamalUpcoming3 = await prisma.booking.create({
        data: {
            customerId: customer6.id,
            providerId: provider1.id,
            serviceType: 'Electrician',
            bookingDate: getDateRel(3),
            startTime: '01:00 PM',
            endTime: '03:00 PM',
            status: 'CONFIRMED',
            totalAmount: 2200,
            address: '30 Baseline Road, Colombo 08',
            description: 'Chandelier mounting and testing.',
            latitude: 6.9271,
            longitude: 79.8777
        }
    });

    // provider2 (Nimal) schedule bookings
    const bNimalPast1 = await prisma.booking.create({
        data: {
            customerId: customer2.id,
            providerId: provider2.id,
            serviceType: 'Plumber',
            bookingDate: getDateRel(-4),
            startTime: '10:00 AM',
            endTime: '12:00 PM',
            status: 'PAID',
            totalAmount: 1500,
            address: '12 Temple Road, Panadura',
            description: 'Bathroom tap replacement.',
            latitude: 6.7118,
            longitude: 79.9071
        }
    });

    const bNimalPast2 = await prisma.booking.create({
        data: {
            customerId: customer4.id,
            providerId: provider2.id,
            serviceType: 'Plumber',
            bookingDate: getDateRel(-3),
            startTime: '01:00 PM',
            endTime: '03:00 PM',
            status: 'COMPLETED',
            totalAmount: 1600,
            address: '201 High Level Road, Nugegoda',
            description: 'Kitchen sink pipe repair.',
            latitude: 6.8649,
            longitude: 79.8997
        }
    });

    const bNimalPast3 = await prisma.booking.create({
        data: {
            customerId: customer5.id,
            providerId: provider2.id,
            serviceType: 'Plumber',
            bookingDate: getDateRel(-2),
            startTime: '02:00 PM',
            endTime: '04:00 PM',
            status: 'PAID',
            totalAmount: 1800,
            address: '55 Parliament Road, Kotte',
            description: 'Shower head cleaning and leak fix.',
            latitude: 6.8911,
            longitude: 79.9162
        }
    });

    // OVERDUE Booking (Nimal) - Pending on yesterday but not updated
    const bNimalOverdue1 = await prisma.booking.create({
        data: {
            customerId: customer6.id,
            providerId: provider2.id,
            serviceType: 'Plumber',
            bookingDate: getDateRel(-1),
            startTime: '11:00 AM',
            endTime: '01:00 PM',
            status: 'PENDING',
            totalAmount: 2000,
            address: '30 Baseline Road, Colombo 08',
            description: 'Water meter area leakage check.',
            latitude: 6.9271,
            longitude: 79.8777
        }
    });

    const bNimalPast4 = await prisma.booking.create({
        data: {
            customerId: customer3.id,
            providerId: provider2.id,
            serviceType: 'Plumber',
            bookingDate: getDateRel(-1),
            startTime: '03:00 PM',
            endTime: '05:00 PM',
            status: 'PAID',
            totalAmount: 2100,
            address: '18 Galle Road, Dehiwala',
            description: 'Water pump check and filter change.',
            latitude: 6.8378,
            longitude: 79.8732
        }
    });

    // Today's Bookings (Nimal)
    const bNimalTodayConfirmed = await prisma.booking.create({
        data: {
            customerId: customer3.id,
            providerId: provider2.id,
            serviceType: 'Plumber',
            bookingDate: getDateRel(0),
            startTime: '11:00 AM',
            endTime: '01:00 PM',
            status: 'CONFIRMED',
            totalAmount: 2200,
            address: '18 Galle Road, Dehiwala',
            description: 'Drain clogging fixing in master bath.',
            latitude: 6.8378,
            longitude: 79.8732
        }
    });

    // Upcoming Bookings (Nimal)
    const bNimalUpcoming1 = await prisma.booking.create({
        data: {
            customerId: customer5.id,
            providerId: provider2.id,
            serviceType: 'Plumber',
            bookingDate: getDateRel(1),
            startTime: '10:00 AM',
            endTime: '12:30 PM',
            status: 'CONFIRMED',
            totalAmount: 2500,
            address: '55 Parliament Road, Kotte',
            description: 'Water pressure drop investigation.',
            latitude: 6.8911,
            longitude: 79.9162
        }
    });

    const bNimalUpcoming2 = await prisma.booking.create({
        data: {
            customerId: customer1.id,
            providerId: provider2.id,
            serviceType: 'Plumber',
            bookingDate: getDateRel(2),
            startTime: '02:00 PM',
            endTime: '04:00 PM',
            status: 'PENDING',
            totalAmount: 2000,
            address: '45/2 Galle Road, Moratuwa',
            description: 'New tap installation.',
            latitude: 6.7730,
            longitude: 79.8816
        }
    });

    // 8. Tool Rentals (active/current)
    // Grinder rented to customer1 (in progress)
    await prisma.toolRental.create({
        data: {
            toolId: tGrinder.id,
            customerId: customer1.id,
            startDate: getDateRel(-1),
            endDate: getDateRel(1),
            status: 'IN_PROGRESS',
            totalAmount: 2400,
            pickupLocation: 'Ravi Hardware, Galle Road, Moratuwa',
            pickupLatitude: 6.7725,
            pickupLongitude: 79.8818,
            paymentMethod: 'CASH',
            isPaid: true
        }
    });

    // Ladder rented to customer2 (in progress)
    await prisma.toolRental.create({
        data: {
            toolId: tLadder.id,
            customerId: customer2.id,
            startDate: getDateRel(-2),
            endDate: getDateRel(0),
            status: 'IN_PROGRESS',
            totalAmount: 1600,
            pickupLocation: 'Ravi Hardware, Galle Road, Moratuwa',
            pickupLatitude: 6.7725,
            pickupLongitude: 79.8818,
            paymentMethod: 'CASH',
            isPaid: true
        }
    });

    // Chainsaw rented to customer1 (confirmed)
    await prisma.toolRental.create({
        data: {
            toolId: tChainsaw.id,
            customerId: customer1.id,
            startDate: getDateRel(0),
            endDate: getDateRel(3),
            status: 'CONFIRMED',
            totalAmount: 9000,
            pickupLocation: 'Gamage Tools, Clock Tower Road, Piliyandala',
            pickupLatitude: 6.7972,
            pickupLongitude: 79.9234,
            paymentMethod: 'CASH',
            isPaid: false
        }
    });

    // Past completed/overdue tool rentals
    const rDrillPast1 = await prisma.toolRental.create({
        data: {
            toolId: tDrill.id,
            customerId: customer3.id,
            startDate: getDateRel(-4),
            endDate: getDateRel(-3),
            status: 'PAID',
            totalAmount: 3000,
            pickupLocation: 'Ravi Hardware, Galle Road, Moratuwa',
            pickupLatitude: 6.7725,
            pickupLongitude: 79.8818,
            paymentMethod: 'CASH',
            isPaid: true
        }
    });

    // OVERDUE Rental - Confirmed/Picked up but past end date
    const rDrillOverdue1 = await prisma.toolRental.create({
        data: {
            toolId: tDrill.id,
            customerId: customer4.id,
            startDate: getDateRel(-3),
            endDate: getDateRel(-1),
            status: 'CONFIRMED',
            totalAmount: 3000,
            pickupLocation: 'Ravi Hardware, Galle Road, Moratuwa',
            pickupLatitude: 6.7725,
            pickupLongitude: 79.8818,
            paymentMethod: 'CASH',
            isPaid: false
        }
    });

    const rSawPast1 = await prisma.toolRental.create({
        data: {
            toolId: tSaw.id,
            customerId: customer5.id,
            startDate: getDateRel(-2),
            endDate: getDateRel(-1),
            status: 'PAID',
            totalAmount: 2000,
            pickupLocation: 'Ravi Hardware, Galle Road, Moratuwa',
            pickupLatitude: 6.7725,
            pickupLongitude: 79.8818,
            paymentMethod: 'CASH',
            isPaid: true
        }
    });

    const rLawnPast1 = await prisma.toolRental.create({
        data: {
            toolId: tLawn.id,
            customerId: customer6.id,
            startDate: getDateRel(-3),
            endDate: getDateRel(-2),
            status: 'PAID',
            totalAmount: 5000,
            pickupLocation: 'Gamage Tools, Clock Tower Road, Piliyandala',
            pickupLatitude: 6.7972,
            pickupLongitude: 79.9234,
            paymentMethod: 'CASH',
            isPaid: true
        }
    });

    // 9. Seed Reviews & Replies
    console.log('Seeding review and replies...');
    
    // provider1 (Kamal) Reviews
    const rev1 = await prisma.review.create({
        data: {
            reviewerId: customer1.id,
            revieweeId: provider1.id,
            bookingId: hbDec1.id,
            rating: 5,
            comment: 'Kamal was fantastic! Arrived on time and solved the short circuit in less than an hour. Very skilled electrician!',
            likes: 5
        }
    });

    await prisma.review.update({
        where: { id: rev1.id },
        data: {
            reply: 'Thank you Rashmeen! Happy to help anytime.'
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer1.id,
            revieweeId: provider1.id,
            bookingId: hbDec3.id,
            rating: 4,
            comment: 'Very professional. Detected the line issue and fixed it properly.',
            likes: 2
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer1.id,
            revieweeId: provider1.id,
            bookingId: hbJan1.id,
            rating: 5,
            comment: 'Great job with the lights installation. Fast and clean.',
            likes: 3
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer3.id,
            revieweeId: provider1.id,
            bookingId: bKamalPast2.id,
            rating: 4,
            comment: 'Very professional ceiling fan installation. Highly recommended!',
            likes: 1
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer6.id,
            revieweeId: provider1.id,
            bookingId: bKamalPast4.id,
            rating: 5,
            comment: 'Excellent work fixing the tripping breaker. Courteous and clean.',
            likes: 2
        }
    });

    // provider2 (Nimal) Reviews
    await prisma.review.create({
        data: {
            reviewerId: customer2.id,
            revieweeId: provider2.id,
            bookingId: hbDec2.id,
            rating: 3,
            comment: 'Fixed the leak, but was late by an hour. The plumbing works fine now.',
            likes: 1
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer2.id,
            revieweeId: provider2.id,
            bookingId: hbJan2.id,
            rating: 4,
            comment: 'Prompt response and repaired the pipes cleanly.',
            likes: 0
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer2.id,
            revieweeId: provider2.id,
            bookingId: hbFeb2.id,
            rating: 3,
            comment: 'Average service, did what was requested.',
            likes: 1
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer4.id,
            revieweeId: provider2.id,
            bookingId: bNimalPast2.id,
            rating: 4,
            comment: 'Very fast repair of kitchen sink pipe. Work was neat.',
            likes: 2
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer5.id,
            revieweeId: provider2.id,
            bookingId: bNimalPast3.id,
            rating: 3,
            comment: 'Did a decent job with the shower leak, but was a bit expensive.',
            likes: 0
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer3.id,
            revieweeId: provider2.id,
            bookingId: bNimalPast4.id,
            rating: 5,
            comment: 'Nimal was extremely professional, quickly replaced the pump filter and tested pressure.',
            likes: 3
        }
    });

    // owner1 (Ravi Hardware) Tool Reviews
    const rev2 = await prisma.review.create({
        data: {
            reviewerId: customer2.id,
            revieweeId: owner1.id,
            rentalId: hrDec2.id,
            rating: 5,
            comment: 'The ladder from Ravi Hardware was extremely sturdy and clean. Great communication!',
            likes: 3
        }
    });

    await prisma.review.update({
        where: { id: rev2.id },
        data: {
            reply: 'Glad the ladder served you well, Dilusha! Keep building!'
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer1.id,
            revieweeId: owner1.id,
            rentalId: hrDec1.id,
            rating: 5,
            comment: 'DeWalt impact drill was a beast. Made the drilling work extremely easy.',
            likes: 4
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer1.id,
            revieweeId: owner1.id,
            rentalId: hrJan1.id,
            rating: 4,
            comment: 'The impact drill worked great. Fast pickup.',
            likes: 1
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer2.id,
            revieweeId: owner1.id,
            rentalId: hrJan2.id,
            rating: 3,
            comment: 'Bosch circular saw was powerful, but the guide fence was slightly loose.',
            likes: 2
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer2.id,
            revieweeId: owner1.id,
            rentalId: hrFeb2.id,
            rating: 4,
            comment: 'Circular saw was sharp and neat. Very helpful owner.',
            likes: 2
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer1.id,
            revieweeId: owner1.id,
            rentalId: hrJan3.id,
            rating: 5,
            comment: 'Perfect ladder for double story roofing work. Very clean.',
            likes: 1
        }
    });

    // owner2 (Gamage Tools) Tool Reviews
    await prisma.review.create({
        data: {
            reviewerId: customer2.id,
            revieweeId: owner2.id,
            rentalId: hrJan4.id,
            rating: 2,
            comment: 'Honda lawnmower had some fuel filter clogging issue. Wasantha was nice but it delayed my gardening.',
            likes: 3
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer1.id,
            revieweeId: owner2.id,
            rentalId: hrFeb3.id,
            rating: 3,
            comment: 'Lawnmower worked fine after some tuning. Reasonable rate.',
            likes: 0
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer2.id,
            revieweeId: owner2.id,
            rentalId: hrFeb4.id,
            rating: 4,
            comment: 'Chainsaw is very powerful and reliable. Cut through tree trunks like butter.',
            likes: 2
        }
    });

    // New Rentals Reviews
    await prisma.review.create({
        data: {
            reviewerId: customer3.id,
            revieweeId: owner1.id,
            rentalId: rDrillPast1.id,
            rating: 5,
            comment: 'Drill was in perfect condition. Made mounting shelves easy.',
            likes: 1
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer5.id,
            revieweeId: owner1.id,
            rentalId: rSawPast1.id,
            rating: 4,
            comment: 'Bosch circular saw was sharp and worked great. Smooth transaction.',
            likes: 1
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: customer6.id,
            revieweeId: owner2.id,
            rentalId: rLawnPast1.id,
            rating: 5,
            comment: 'Lawnmower was fully fueled and in perfect shape. Saved me a lot of time.',
            likes: 4
        }
    });

    // 10. Seed Disputes (3 active, 2 resolved)
    console.log('Seeding disputes (3 active, 2 resolved)...');

    // Resolved dispute 1: 12-hour resolution
    const disp1Created = new Date();
    disp1Created.setDate(today.getDate() - 15);
    const disp1Resolved = new Date(disp1Created.getTime() + 12 * 60 * 60 * 1000); // +12 hours
    await prisma.dispute.create({
        data: {
            reporterId: customer1.id,
            reportedId: provider2.id,
            reason: 'Delayed Arrival',
            description: 'Plumber was supposed to arrive at 10 AM but showed up at 4 PM without warning.',
            status: DisputeStatus.RESOLVED,
            resolution: 'Official warning issued to plumber. Account warning logged.',
            createdAt: disp1Created,
            updatedAt: disp1Resolved
        }
    });

    // Resolved dispute 2: 6-hour resolution
    const disp2Created = new Date();
    disp2Created.setDate(today.getDate() - 10);
    const disp2Resolved = new Date(disp2Created.getTime() + 6 * 60 * 60 * 1000); // +6 hours
    await prisma.dispute.create({
        data: {
            reporterId: customer2.id,
            reportedId: owner2.id,
            reason: 'Damaged Equipment Spark Plug',
            description: 'Chainsaw engine refused to ignite on delivery. Discovered fouled spark plug.',
            status: DisputeStatus.RESOLVED,
            resolution: 'Merchant provided replacement plug. Compensation refund of LKR 1,000 processed.',
            createdAt: disp2Created,
            updatedAt: disp2Resolved
        }
    });

    // Active dispute 1: PENDING
    await prisma.dispute.create({
        data: {
            reporterId: customer1.id,
            reportedId: provider1.id,
            reason: 'Overcharged Bill Details',
            description: 'The electrician spent only 1 hour but billed for 3 hours of labour work.',
            status: DisputeStatus.PENDING,
            createdAt: getDateRel(-1)
        }
    });

    // Active dispute 2: REVIEWING
    await prisma.dispute.create({
        data: {
            reporterId: customer2.id,
            reportedId: owner1.id,
            reason: 'Ladder Feet Missing Rubber Grips',
            description: 'The ladder is unsafe to climb because the rubber grips at the feet are completely worn out/missing.',
            status: DisputeStatus.REVIEWING,
            createdAt: getDateRel(-2)
        }
    });

    // Active dispute 3: PENDING
    await prisma.dispute.create({
        data: {
            reporterId: customer2.id,
            reportedId: provider2.id,
            reason: 'Water Leaking after Pipe Installation',
            description: 'Plumber repaired the main pipeline joints yesterday, but it started leaking heavily again this morning.',
            status: DisputeStatus.PENDING,
            createdAt: getDateRel(0)
        }
    });

    // 11. Verification Documents & AI flag
    console.log('Seeding identity verification documents...');
    
    // provider1 docs
    await prisma.document.create({
        data: {
            userId: provider1.id,
            documentType: 'ID_CARD',
            documentUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=800',
            status: VerificationStatus.APPROVED,
            aiConfidence: 0.98,
            aiResult: { status: 'AI_PASSED', confidence: 0.98, reason: 'Face matches ID photo, name matches profile details.' }
        }
    });

    // provider1 has a pending NVQ certificate flagged by AI to test the verification dashboard!
    await prisma.document.create({
        data: {
            userId: provider1.id,
            documentType: 'CERTIFICATE',
            documentUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=800',
            status: VerificationStatus.PENDING,
            aiConfidence: 0.45,
            aiResult: { 
                status: 'AI_FLAGGED', 
                confidence: 0.45, 
                reason: 'Name on diploma certificate reads "Kamal Silva Perera", which does not strictly match user profile "Kamal Perera". Verify identity match.' 
            }
        }
    });

    // provider2 docs
    await prisma.document.create({
        data: {
            userId: provider2.id,
            documentType: 'ID_CARD',
            documentUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=800',
            status: VerificationStatus.APPROVED,
            aiConfidence: 0.95,
            aiResult: { status: 'AI_PASSED', confidence: 0.95, reason: 'ID card matches profile name Nimal Silva.' }
        }
    });

    // owner1 docs
    await prisma.document.create({
        data: {
            userId: owner1.id,
            documentType: 'BUSINESS_PERMIT',
            documentUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=800',
            status: VerificationStatus.APPROVED,
            aiConfidence: 0.96,
            aiResult: { status: 'AI_PASSED', confidence: 0.96, reason: 'BR registry number match Ravi Hardware.' }
        }
    });

    // owner2 docs
    await prisma.document.create({
        data: {
            userId: owner2.id,
            documentType: 'BUSINESS_PERMIT',
            documentUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=800',
            status: VerificationStatus.APPROVED,
            aiConfidence: 0.94,
            aiResult: { status: 'AI_PASSED', confidence: 0.94, reason: 'BR registry number match Gamage Tools.' }
        }
    });

    // 12. Seed Notifications
    console.log('Seeding notification alerts...');
    await prisma.notification.createMany({
        data: [
            { userId: provider1.id, title: 'New Booking Request', message: 'You have a new request for Electrician from Dilusha Liyanage.', type: 'BOOKING_REQUEST', isRead: false, linkId: null },
            { userId: provider1.id, title: 'Dispute Flagged on Account', message: 'Customer Rashmeen opened a dispute claiming: Overcharged Bill Details.', type: 'DISPUTE_OPENED', isRead: false, linkId: null },
            { userId: owner1.id, title: 'Dispute Flagged on Account', message: 'Customer Dilusha Liyanage opened a dispute claiming: Ladder Feet Missing Rubber Grips.', type: 'DISPUTE_OPENED', isRead: false, linkId: null },
            { userId: customer1.id, title: 'Service Booked Confirmed', message: 'Kamal Perera has confirmed your Electrician booking switch bypass project.', type: 'STATUS_UPDATE', isRead: true, linkId: null }
        ]
    });

    // Helpers to create historical records
    async function createHistoricalBooking(customerId, providerId, serviceType, date, amount) {
        return await prisma.booking.create({
            data: {
                customerId,
                providerId,
                serviceType,
                bookingDate: date,
                startTime: '10:00 AM',
                endTime: '12:00 PM',
                status: 'PAID',
                totalAmount: amount,
                address: 'Moratuwa/Panadura Client Address',
                latitude: 6.7730,
                longitude: 79.8816,
                arrivedAt: date,
                createdAt: date,
                updatedAt: date
            }
        });
    }

    async function createHistoricalRental(customerId, toolId, startDate, endDate, amount) {
        return await prisma.toolRental.create({
            data: {
                toolId,
                customerId,
                startDate,
                endDate,
                status: 'PAID',
                totalAmount: amount,
                pickupLocation: 'Hardware Store Location',
                pickupLatitude: 6.7730,
                pickupLongitude: 79.8816,
                isPaid: true,
                createdAt: startDate,
                updatedAt: endDate
            }
        });
    }

    console.log('--- DATABASE DATA POPULATION COMPLETED SUCCESSFULLY ---');
    console.log('Demographic Accounts:');
    console.log('  1. Customer 1 (Rashmeen):         customer1@example.com | password123');
    console.log('  2. Customer 2 (Dilusha):          customer2@example.com | password123');
    console.log('  3. Service Partner 1 (Kamal):     provider1@example.com | password123');
    console.log('  4. Service Partner 2 (Nimal):     provider2@example.com | password123');
    console.log('  5. Rental Partner 1 (Ravindra):   owner1@example.com    | password123');
    console.log('  6. Rental Partner 2 (Wasantha):   owner2@example.com    | password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
