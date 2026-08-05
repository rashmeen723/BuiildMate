import { PrismaClient, Role, VerificationStatus, Badge, BookingStatus, DisputeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Sri Lankan location coordinates
const locations = [
    { city: 'Colombo Central', lat: 6.9271, lng: 79.8612, address: 'Galle Face Green, Colombo 03' },
    { city: 'Dehiwala', lat: 6.8511, lng: 79.8732, address: 'Dehiwala Junction, Galle Road, Dehiwala' },
    { city: 'Moratuwa Central', lat: 6.7730, lng: 79.8816, address: 'Moratuwa Town, Moratuwa' },
    { city: 'Panadura Town', lat: 6.7118, lng: 79.9071, address: 'Panadura Bus Stand, Panadura' },
    { city: 'Ratmalana', lat: 6.8172, lng: 79.8824, address: 'Ratmalana Airport Road, Ratmalana' },
    { city: 'Mount Lavinia', lat: 6.8290, lng: 79.8662, address: 'Mount Lavinia Hotel Road, Mount Lavinia' },
    { city: 'Piliyandala', lat: 6.7972, lng: 79.9234, address: 'Piliyandala Clock Tower, Piliyandala' },
    { city: 'Kottawa', lat: 6.8412, lng: 79.9634, address: 'Kottawa Highlevel Road, Kottawa' },
    { city: 'Malabe', lat: 6.9026, lng: 79.9614, address: 'Malabe Junction, Kaduwela Road, Malabe' },
    { city: 'Battaramulla', lat: 6.8989, lng: 79.9223, address: 'Diyatha Uyana, Battaramulla' },
    { city: 'Nugegoda', lat: 6.8649, lng: 79.8976, address: 'Nugegoda Supermarket, Nugegoda' },
    { city: 'Kotte', lat: 6.9016, lng: 79.9077, address: 'Parliament Road, Sri Jayawardenepura Kotte' },
    { city: 'Maharagama', lat: 6.8488, lng: 79.9265, address: 'Maharagama Central, Maharagama' },
    { city: 'Gampaha', lat: 7.0897, lng: 80.0145, address: 'Gampaha Railway Station Road, Gampaha' },
    { city: 'Negombo', lat: 7.2089, lng: 79.8356, address: 'Negombo Beach Road, Negombo' },
    { city: 'Kurunegala', lat: 7.4863, lng: 80.3647, address: 'Kurunegala Bus Stand, Kurunegala' },
    { city: 'Kandy', lat: 7.2906, lng: 80.6337, address: 'Kandy Lake Round, Kandy' },
    { city: 'Galle Fort', lat: 6.0535, lng: 80.2210, address: 'Galle Fort Walkway, Galle' },
    { city: 'Matara Beach', lat: 5.9549, lng: 80.5550, address: 'Matara Beach Road, Matara' },
    { city: 'Kalutara', lat: 6.5854, lng: 79.9607, address: 'Kalutara Bodhiya Road, Kalutara' },
];

const sriLankanMaleFirstNames = [
    'Kamal', 'Nimal', 'Sunil', 'Ruwan', 'Saman', 'Ravi', 'Wasantha', 'Chanaka', 'Priyantha', 'Pathum', 
    'Roshan', 'Dinesh', 'Kasun', 'Nuwan', 'Chinthaka', 'Mahesh', 'Asanka', 'Tharindu', 'Sajith', 'Dimuthu', 
    'Duminda', 'Dilshan', 'Kanishka', 'Lahiru', 'Gayan', 'Sandun', 'Chaminda', 'Bandula', 'Prasad', 'Upul'
];

const sriLankanFemaleFirstNames = [
    'Nilmini', 'Sanduni', 'Dilhani', 'Priyanki', 'Chathurika', 'Hansini', 'Kavindi', 'Amanda', 'Shenali', 
    'Nadeesha', 'Harshani', 'Danushi', 'Oshadi', 'Menaka', 'Piyumi', 'Shashika', 'Ishara', 'Madushani', 'Gayani', 'Inoka'
];

const sriLankanLastNames = [
    'Perera', 'Silva', 'Fernando', 'Rodrigo', 'Wijesinghe', 'Alwis', 'Cooray', 'Dias', 'Jayawardena', 
    'Rajapakse', 'Senanayake', 'Gunawardena', 'Siriwardena', 'Wickramasinghe', 'Liyanage', 'Herath', 
    'Ranasinghe', 'Rathnayake', 'Bandara', 'Karunaratne'
];

const serviceCategories = [
    { name: 'Electrician', skills: ['House Wiring', 'DB Box Repair', 'Short Circuit Fix', 'Switch Installation', 'Generator Setup'] },
    { name: 'Plumber', skills: ['Leak Detection', 'Pipe Repair', 'Tap Installation', 'Drain Unclogging', 'Bathroom Fitting'] },
    { name: 'Carpenter', skills: ['Cabinet Repair', 'Door Hanging', 'Roof Woodwork', 'Furniture Polishing', 'Timber Assembly'] },
    { name: 'Painter', skills: ['Interior Wall Paint', 'Exterior Weathercoat', 'Wood Polishing', 'Waterproofing', 'Texture finish'] },
    { name: 'AC Technician', skills: ['AC Full Service', 'AC Installation', 'Gas Charging', 'Compressor Replacement', 'Filter Cleaning'] },
    { name: 'Mason', skills: ['Tiling', 'Plastering', 'Brick Laying', 'Concreting', 'Wall Breaking'] },
    { name: 'Welder', skills: ['Gate Hinge Weld', 'Steel fabrication', 'Window Grill repair', 'Fence Welding'] },
    { name: 'Gardener', skills: ['Lawn Mowing', 'Pruning & Trimming', 'Soil Treatment', 'Pest Spraying', 'Garden Cleaning'] },
    { name: 'House Cleaner', skills: ['Deep Cleans', 'Bathroom Sanitizing', 'Kitchen Degreasing', 'Sofa/Carpet Clean', 'Post-Build Cleans'] },
    { name: 'Pest Control', skills: ['Fumigation', 'Termite Protection', 'Cockroach gel application', 'Rodent Baiting'] }
];

const toolsPool = [
    { name: 'DeWalt Impact Drill 20V', category: 'Power Tools', rate: 1000, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400' },
    { name: 'Makita Angle Grinder 4.5"', category: 'Power Tools', rate: 800, img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400' },
    { name: 'Bosch Circular Saw 1400W', category: 'Power Tools', rate: 1200, img: 'https://images.unsplash.com/photo-1546948630-1149ea60dc86?w=400' },
    { name: 'Ingco Rotary Hammer Drill', category: 'Power Tools', rate: 1300, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400' },
    { name: '10ft Heavy Duty Aluminum Ladder', category: 'Ladders', rate: 450, img: 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=400' },
    { name: '20ft Extension Ladder', category: 'Ladders', rate: 650, img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400' },
    { name: 'Portable Cement Mixer 180L', category: 'Construction', rate: 2800, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400' },
    { name: 'Honda Self-Propelled Lawnmower', category: 'Gardening', rate: 1600, img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400' },
    { name: 'Stihl Professional Chainsaw', category: 'Gardening', rate: 1800, img: 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?w=400' },
    { name: 'Karcher High Pressure Washer', category: 'Cleaning', rate: 1200, img: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400' },
    { name: 'Industrial Wet & Dry Vacuum', category: 'Cleaning', rate: 900, img: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400' },
    { name: 'Steel Scaffolding H-Frame Set', category: 'Scaffolding', rate: 1500, img: 'https://images.unsplash.com/photo-1627989396347-1af6bf6ebac9?w=400' },
    { name: 'Laser Level 3D Green Beam', category: 'Hand Tools', rate: 600, img: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400' },
    { name: 'Heavy Duty Wheelbarrow', category: 'Hand Tools', rate: 300, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400' },
];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(gender: 'male' | 'female'): string {
    const firstList = gender === 'male' ? sriLankanMaleFirstNames : sriLankanFemaleFirstNames;
    const first = getRandomItem(firstList);
    const last = getRandomItem(sriLankanLastNames);
    return `${first} ${last}`;
}

async function main() {
    console.log('Clearing existing database records...');

    // Clear records in dependency order
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

    console.log('Database cleared. Starting seeding...');

    // Use a single pre-calculated bcrypt hash for password123 to speed up seed significantly
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Admins (3 users)
    console.log('Seeding Admins...');
    const admins = [
        { email: 'admin1@buildmate.lk', fullName: 'Roshan Wickramasinghe' },
        { email: 'admin2@buildmate.lk', fullName: 'Nilmini Perera' },
        { email: 'admin3@buildmate.lk', fullName: 'Pathum Fernando' }
    ];
    for (const admin of admins) {
        await prisma.user.create({
            data: {
                email: admin.email,
                password: passwordHash,
                fullName: admin.fullName,
                phone: `0777${Math.floor(1000000 + Math.random() * 9000000)}`,
                role: Role.ADMIN,
                isEmailVerified: true
            }
        });
    }

    // 2. Create Household Users (300 users)
    console.log('Seeding 300 Household Customers...');
    const householdUsers: any[] = [];
    for (let i = 1; i <= 300; i++) {
        const loc = getRandomItem(locations);
        const gender = i % 2 === 0 ? 'male' : 'female';
        const user = await prisma.user.create({
            data: {
                email: `user${i}@example.com`,
                password: passwordHash,
                fullName: generateName(gender as any),
                phone: `070${String(i).padStart(7, '0')}`,
                profileImage: `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${(i % 95) + 1}.jpg`,
                role: Role.HOUSEHOLD,
                isEmailVerified: true,
                addresses: {
                    create: {
                        addressLine1: `${Math.floor(10 + Math.random() * 90)}, ${loc.address.split(',')[0]}`,
                        city: loc.city.replace(' Central', '').replace(' Town', '').replace(' Fort', '').replace(' Beach', ''),
                        latitude: loc.lat + (Math.random() - 0.5) * 0.015,
                        longitude: loc.lng + (Math.random() - 0.5) * 0.015,
                        isDefault: true
                    }
                }
            },
            include: {
                addresses: true
            }
        });
        householdUsers.push(user);
    }

    // 3. Create Service Providers (150 users)
    console.log('Seeding 150 Service Providers...');
    const providers: any[] = [];
    // Exactly 2 AI-flagged providers (indices 2, 3), others approved
    const verificationStatuses = [
        VerificationStatus.APPROVED,   // Index 0 (provider1 demo account)
        VerificationStatus.APPROVED,   // Index 1 (Set to approved to remove pending)
        VerificationStatus.AI_FLAGGED, // Index 2 (AI Flagged #1)
        VerificationStatus.AI_FLAGGED, // Index 3 (AI Flagged #2)
        ...Array(146).fill(VerificationStatus.APPROVED)
    ];

    for (let i = 1; i <= 150; i++) {
        let categoryDetails = getRandomItem(serviceCategories);
        const loc = getRandomItem(locations);
        let status = verificationStatuses[i - 1] || VerificationStatus.APPROVED;
        const gender = i % 2 === 0 ? 'male' : 'female';

        // Override details for demo providers to ensure exact data
        if (i === 1) {
            categoryDetails = serviceCategories.find(c => c.name === 'Electrician')!;
            status = VerificationStatus.APPROVED;
        } else if (i === 4) {
            categoryDetails = serviceCategories.find(c => c.name === 'Painter')!;
            status = VerificationStatus.APPROVED;
        }

        // Category-specific hourly rates in Sri Lanka
        let hourlyRate = 1000;
        if (categoryDetails.name === 'Painter') {
            hourlyRate = 600 + Math.floor(Math.random() * 3) * 100; // 600 - 800 LKR
        } else if (categoryDetails.name === 'House Cleaner') {
            hourlyRate = 500 + Math.floor(Math.random() * 3) * 100; // 500 - 700 LKR
        } else if (categoryDetails.name === 'Gardener') {
            hourlyRate = 550 + Math.floor(Math.random() * 3) * 100; // 550 - 750 LKR
        } else if (categoryDetails.name === 'Pest Control') {
            hourlyRate = 700 + Math.floor(Math.random() * 3) * 100; // 700 - 900 LKR
        } else {
            hourlyRate = 800 + Math.floor(Math.random() * 6) * 100; // 800 - 1300 LKR
        }

        const user = await prisma.user.create({
            data: {
                email: `provider${i}@example.com`,
                password: passwordHash,
                fullName: generateName(gender as any),
                phone: `077${String(i).padStart(7, '0')}`,
                profileImage: `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${(i % 95) + 1}.jpg`,
                role: Role.SERVICE_PROVIDER,
                isEmailVerified: true,
                badges: status === VerificationStatus.APPROVED 
                    ? [Badge.IDENTITY_VERIFIED, Badge.ADDRESS_VERIFIED, Badge.EXPERIENCED] 
                    : [],
                trustScore: status === VerificationStatus.APPROVED ? 4.5 + Math.random() * 0.5 : 5.0,
                serviceProvider: {
                    create: {
                        category: categoryDetails.name,
                        yearsOfExperience: `${Math.floor(2 + Math.random() * 15)}`,
                        skills: [
                            `${categoryDetails.name} Expert`, 
                            ...categoryDetails.skills.slice(0, 3)
                        ],
                        hourlyRate: hourlyRate,
                        status: status,
                        latitude: loc.lat + (Math.random() - 0.5) * 0.012,
                        longitude: loc.lng + (Math.random() - 0.5) * 0.012,
                        formattedAddress: `${Math.floor(10 + Math.random() * 190)}, ${loc.address}`,
                        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        workingHoursStart: '08:00 AM',
                        workingHoursEnd: '05:00 PM',
                        nvqLevel: i % 3 === 0 ? 'NVQ Level 4' : null,
                        isCertified: i % 3 === 0
                    }
                }
            },
            include: {
                serviceProvider: true
            }
        });

        // Seed verification documents for providers
        await prisma.document.create({
            data: {
                documentType: 'UTILITY_BILL',
                documentUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600',
                userId: user.id,
                status: status === VerificationStatus.APPROVED ? VerificationStatus.APPROVED : status
            }
        });

        if (user.serviceProvider?.isCertified) {
            await prisma.document.create({
                data: {
                    documentType: 'CERTIFICATE',
                    documentUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=600',
                    userId: user.id,
                    status: VerificationStatus.APPROVED // Certificates bypass AI and are approved
                }
            });
        }

        providers.push(user);
    }

    // 4. Create Rental Owners (50 users)
    console.log('Seeding 50 Rental Owners & Tools...');
    const rentalOwners: any[] = [];
    // All rental owners approved to keep list clean
    const ownerVerificationStatuses = Array(50).fill(VerificationStatus.APPROVED);

    const hardwareNames = ['Lanka', 'Ravi', 'Moratuwa', 'Galle', 'Apex', 'Pro-Rent', 'BuildStore', 'Dynamic', 'Pioneer', 'Metro'];
    const hardwareSufix = ['Hardware', 'Tool Renters', 'Equipments', 'Machineries', 'Builders Depot'];

    for (let i = 1; i <= 50; i++) {
        const loc = getRandomItem(locations);
        const status = ownerVerificationStatuses[i - 1] || VerificationStatus.APPROVED;
        const gender = i % 2 === 0 ? 'male' : 'female';
        const businessName = `${getRandomItem(hardwareNames)} ${getRandomItem(hardwareSufix)} (Pvt) Ltd`;

        const user = await prisma.user.create({
            data: {
                email: `owner${i}@example.com`,
                password: passwordHash,
                fullName: generateName(gender as any),
                phone: `071${String(i).padStart(7, '0')}`,
                profileImage: `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${(i % 95) + 1}.jpg`,
                role: Role.RENTAL_OWNER,
                isEmailVerified: true,
                badges: status === VerificationStatus.APPROVED ? [Badge.BUSINESS_VERIFIED, Badge.IDENTITY_VERIFIED] : [],
                trustScore: status === VerificationStatus.APPROVED ? 4.6 + Math.random() * 0.4 : 5.0,
                rentalOwner: {
                    create: {
                        businessName: businessName,
                        toolCategories: ['Power Tools', 'Ladders', 'Safety Gear', 'Construction'],
                        yearsInBusiness: `${Math.floor(3 + Math.random() * 12)}`,
                        status: status,
                        latitude: loc.lat + (Math.random() - 0.5) * 0.012,
                        longitude: loc.lng + (Math.random() - 0.5) * 0.012,
                        formattedAddress: `${Math.floor(5 + Math.random() * 150)}, ${loc.address}`,
                        brNumber: `PV-${Math.floor(10000 + Math.random() * 90000)}`,
                        isBusinessVerified: status === VerificationStatus.APPROVED
                    }
                }
            },
            include: {
                rentalOwner: true
            }
        });

        // Seed verification document
        await prisma.document.create({
            data: {
                documentType: 'BUSINESS_PERMIT',
                documentUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600',
                userId: user.id,
                status: status === VerificationStatus.APPROVED ? VerificationStatus.APPROVED : status
            }
        });

        rentalOwners.push(user);
    }

    // 5. Seeding Tools for Approved Owners (~200 tools in total)
    console.log('Seeding Tools...');
    const allTools: any[] = [];
    const approvedOwners = rentalOwners.filter(o => o.rentalOwner?.status === VerificationStatus.APPROVED);

    for (const owner of approvedOwners) {
        let numberOfTools = 3 + Math.floor(Math.random() * 3); // 3 to 5 tools per owner
        let selectedTools: any[] = [];
        
        const isDemoOwner = owner.email === 'owner1@example.com';
        if (isDemoOwner) {
            selectedTools = [
                toolsPool.find(t => t.name.includes('DeWalt Impact Drill'))!,
                toolsPool.find(t => t.name.includes('Makita Angle Grinder'))!,
                toolsPool.find(t => t.name.includes('Steel Scaffolding'))!,
                toolsPool.find(t => t.name.includes('10ft Heavy Duty Aluminum Ladder'))!
            ];
            numberOfTools = selectedTools.length;
        } else {
            // Pick random tools ensuring unique items per owner
            while (selectedTools.length < numberOfTools) {
                const toolItem = getRandomItem(toolsPool);
                if (!selectedTools.find(t => t.name === toolItem.name)) {
                    selectedTools.push(toolItem);
                }
            }
        }

        for (const toolInfo of selectedTools) {
            const tool = await prisma.tool.create({
                data: {
                    name: toolInfo.name,
                    description: `High-quality ${toolInfo.name} available for daily rental. Ideal for local contractors or domestic tasks. Professionally serviced and checked before every rental.`,
                    category: toolInfo.category,
                    dailyRate: toolInfo.rate,
                    ownerId: owner.rentalOwner.id,
                    images: [toolInfo.img],
                    status: 'AVAILABLE',
                    available: true
                }
            });
            allTools.push(tool);
        }
    }

    // 6. Create Service Bookings History (~400 bookings)
    console.log('Seeding ~400 Bookings...');
    const bookingStatuses = [
        ...Array(260).fill(BookingStatus.COMPLETED),
        ...Array(60).fill(BookingStatus.PAID),
        ...Array(40).fill(BookingStatus.CANCELLED),
        ...Array(20).fill(BookingStatus.CONFIRMED),
        ...Array(20).fill(BookingStatus.PENDING)
    ];

    const descriptionMap: Record<string, string> = {
        'Electrician': 'DB Board short circuit repair and installing two ceiling fans in the dining hall.',
        'Plumber': 'Leaking PVC pipe line replacement behind the master bedroom bathroom and kitchen clog clear.',
        'Carpenter': 'Repairing hinges of wooden wardrobe doors and fitting new locks on the front main gate.',
        'Painter': 'Wall prep and painting of one room including paint scraper work and weather sealing.',
        'AC Technician': 'Loud noise inside blower and gas leakage check. Needs general high pressure service.',
        'Mason': 'Laying tiles in a small utility room (approx 10x12 sq ft) and wall plastering.',
        'Welder': 'Welding support brackets on metal staircase and fixing iron fence gate latch.',
        'Gardener': 'Mowing front lawn, pruning overgrown rose bushes and cleaning yard garden wastes.',
        'House Cleaner': 'Full vacuuming, window wash, floor mop, and deep cleaning kitchen cabinet grease.',
        'Pest Control': 'Treatment of termite infestation detected in floorboard panels.'
    };

    const activeProviders = providers.filter(p => p.serviceProvider?.status === VerificationStatus.APPROVED);

    for (let i = 1; i <= 400; i++) {
        const customer = getRandomItem(householdUsers);
        const provider = getRandomItem(activeProviders);
        const category = provider.serviceProvider.category;
        const status = bookingStatuses[i - 1] || BookingStatus.COMPLETED;

        // Spread dates: past 60 days to next 7 days
        const daysOffset = Math.floor(Math.random() * 67) - 60;
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + daysOffset);

        const hours = 1 + Math.floor(Math.random() * 4);
        const hourlyRate = provider.serviceProvider.hourlyRate || 500;
        const baseAmount = hourlyRate * hours;
        const platformFee = baseAmount * 0.1; // 10% platform fee
        const totalAmount = baseAmount + platformFee;

        await prisma.booking.create({
            data: {
                id: `bk-${i}-${Math.floor(1000 + Math.random() * 9000)}`,
                customerId: customer.id,
                providerId: provider.id,
                serviceType: category,
                bookingDate: bookingDate,
                startTime: '09:00 AM',
                endTime: `${String(9 + hours).padStart(2, '0')}:00 AM`,
                status: status,
                baseAmount: baseAmount,
                platformFee: platformFee,
                totalAmount: totalAmount,
                address: customer.addresses[0]?.addressLine1 || 'Main Street, Colombo',
                latitude: customer.addresses[0]?.latitude,
                longitude: customer.addresses[0]?.longitude,
                description: descriptionMap[category] || 'General service requirements.',
                createdAt: new Date(bookingDate.getTime() - 24 * 3600 * 1000) // created day before
            }
        });
    }

    // 7. Seeding Tool Rentals (~200 rentals)
    console.log('Seeding ~200 Tool Rentals...');
    const rentalStatuses = [
        ...Array(130).fill(BookingStatus.COMPLETED),
        ...Array(40).fill(BookingStatus.PAID),
        ...Array(15).fill(BookingStatus.CANCELLED),
        ...Array(15).fill(BookingStatus.CONFIRMED)
    ];

    for (let i = 1; i <= 200; i++) {
        const customer = getRandomItem(householdUsers);
        const tool = getRandomItem(allTools);
        const status = rentalStatuses[i - 1] || BookingStatus.COMPLETED;

        const daysOffset = Math.floor(Math.random() * 65) - 60;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + daysOffset);
        
        const durationDays = 1 + Math.floor(Math.random() * 4);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + durationDays);

        const baseCost = tool.dailyRate * durationDays;
        const platformFee = baseCost * 0.07; // 7% platform fee for tools
        const totalAmount = baseCost + platformFee;

        await prisma.toolRental.create({
            data: {
                id: `rn-${i}-${Math.floor(1000 + Math.random() * 9000)}`,
                toolId: tool.id,
                customerId: customer.id,
                startDate: startDate,
                endDate: endDate,
                status: status,
                totalAmount: totalAmount,
                platformFee: platformFee,
                paymentMethod: 'CASH',
                isPaid: status === BookingStatus.PAID || status === BookingStatus.COMPLETED,
                createdAt: new Date(startDate.getTime() - 24 * 3600 * 1000)
            }
        });
    }

    // 8. Seeding Reviews for Completed Bookings and Rentals (~350 reviews)
    console.log('Seeding Reviews & Comments...');
    const commentsList = [
        'Excellent work! Very punctual and highly professional.',
        'Did the job perfectly, took care of everything. Highly recommended.',
        'Punctual and resolved the issue quickly. Excellent value.',
        'Fairly good work, but arrived 15 minutes late due to traffic.',
        'Very polite and cleaned up the area after finishing the task.',
        'Reasonable price and very knowledgeable professional.',
        'Very happy with the service, will book again!',
        'The tool was in perfect condition and worked flawlessy. Excellent hardware owner.',
        'Clean work. Highly technical and completed fast.',
        'Highly recommended! Resolved a problem that others failed to fix.'
    ];

    const negativeComments = [
        'Charged slightly more than originally quoted. Work was average.',
        'Arrived very late and did not bring all the required tools.',
        'Average service quality. Could have paid more attention to detail.'
    ];

    const repliesList = [
        'Thank you so much for the feedback! Happy to help anytime.',
        'Thanks for booking my service. Glad you are satisfied!',
        'Appreciate your review. It was a pleasure working for you.',
        'Thanks for the feedback. I apologize for the delay due to city road closures!'
    ];

    const completedBookings = await prisma.booking.findMany({
        where: { status: { in: [BookingStatus.COMPLETED, BookingStatus.PAID] } },
        include: { provider: true }
    });

    const completedRentals = await prisma.toolRental.findMany({
        where: { status: { in: [BookingStatus.COMPLETED, BookingStatus.PAID] } },
        include: { tool: { include: { owner: { include: { user: true } } } } }
    });

    // Create reviews for bookings (about 250 reviews)
    for (let i = 0; i < Math.min(completedBookings.length, 250); i++) {
        const booking = completedBookings[i];
        const isHappy = Math.random() > 0.1; // 90% positive
        const rating = isHappy ? 4 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2);
        const comment = isHappy ? getRandomItem(commentsList) : getRandomItem(negativeComments);
        const reply = Math.random() > 0.4 ? getRandomItem(repliesList) : null;

        await prisma.review.create({
            data: {
                reviewerId: booking.customerId,
                revieweeId: booking.providerId,
                bookingId: booking.id,
                rating: rating,
                comment: comment,
                reply: reply
            }
        });
    }

    // Create reviews for rentals (about 100 reviews)
    for (let i = 0; i < Math.min(completedRentals.length, 100); i++) {
        const rental = completedRentals[i];
        const rating = 4 + Math.floor(Math.random() * 2); // Mostly positive for tools
        const comment = `Tool: ${rental.tool.name}. ` + getRandomItem(commentsList);
        const reply = Math.random() > 0.5 ? 'Thank you! Glad the tool helped complete your project.' : null;

        await prisma.review.create({
            data: {
                reviewerId: rental.customerId,
                revieweeId: rental.tool.owner.userId,
                rentalId: rental.id,
                rating: rating,
                comment: comment,
                reply: reply
            }
        });
    }

    // 9. Seeding Disputes & Penalties (~25 disputes)
    console.log('Seeding 25 Disputes...');
    const completedBookingsForDisputes = completedBookings.slice(250, 275);
    const disputeReasons = [
        'Provider caused property damage',
        'Incomplete service rendered but full charge demanded',
        'Provider did not show up but marked job complete',
        'Overcharged baseline fee significantly'
    ];

    const disputeDetails = [
        'The plumber broke the plastic sink trap connector while fixing the faucet and left without installing a replacement.',
        'Only painted half the wall and claimed the rest requires additional payment not agreed on.',
        'Technician marked AC service as completed on the app, but he never arrived at my house.',
        'Charged an extra 4,000 LKR claiming materials cost, but refused to provide a valid hardware store receipt.'
    ];

    for (let i = 0; i < Math.min(completedBookingsForDisputes.length, 25); i++) {
        const booking = completedBookingsForDisputes[i];
        const status = i % 2 === 0 ? DisputeStatus.RESOLVED : DisputeStatus.PENDING;
        const resolution = status === DisputeStatus.RESOLVED 
            ? 'Reviewed by support. Booking refunded. Plumber penalized.' 
            : null;

        await prisma.dispute.create({
            data: {
                reporterId: booking.customerId,
                reportedId: booking.providerId,
                bookingId: booking.id,
                reason: disputeReasons[i % disputeReasons.length],
                description: disputeDetails[i % disputeDetails.length],
                status: status,
                resolution: resolution
            }
        });
    }

    // 9.5 Seeding Explicit Demo Accounts & Relations for Presentation
    console.log('Seeding explicit demo relations for presentation...');

    const demoCust1 = await prisma.user.findUnique({ where: { email: 'user1@example.com' }, include: { addresses: true } });
    const demoCust2 = await prisma.user.findUnique({ where: { email: 'user2@example.com' }, include: { addresses: true } });
    const demoProv1 = await prisma.user.findUnique({ where: { email: 'provider1@example.com' } });
    const demoProv2 = await prisma.user.findUnique({ where: { email: 'provider4@example.com' } });
    const demoOwn = await prisma.user.findUnique({ where: { email: 'owner1@example.com' }, include: { rentalOwner: true } });

    if (demoCust1 && demoCust2 && demoProv1 && demoProv2 && demoOwn) {
        // Clear previous bookings, rentals, and reviews that might reference these users
        await prisma.review.deleteMany({
            where: {
                OR: [
                    { reviewerId: demoCust1.id },
                    { reviewerId: demoCust2.id },
                    { revieweeId: demoProv1.id },
                    { revieweeId: demoProv2.id },
                    { revieweeId: demoOwn.id }
                ]
            }
        });

        await prisma.booking.deleteMany({
            where: {
                OR: [
                    { providerId: demoProv1.id },
                    { providerId: demoProv2.id }
                ]
            }
        });

        const ownerTools = await prisma.tool.findMany({ where: { ownerId: demoOwn.rentalOwner!.id } });
        const ownerToolIds = ownerTools.map(t => t.id);

        await prisma.toolRental.deleteMany({
            where: {
                toolId: { in: ownerToolIds }
            }
        });

        // Helper dates
        const dateToday = new Date();
        const dateYesterday = new Date(); dateYesterday.setDate(dateToday.getDate() - 1);
        const dateTwoDaysAgo = new Date(); dateTwoDaysAgo.setDate(dateToday.getDate() - 2);
        const dateThreeDaysAgo = new Date(); dateThreeDaysAgo.setDate(dateToday.getDate() - 3);
        const dateFiveDaysAgo = new Date(); dateFiveDaysAgo.setDate(dateToday.getDate() - 5);
        const dateSevenDaysAgo = new Date(); dateSevenDaysAgo.setDate(dateToday.getDate() - 7);
        const dateTomorrow = new Date(); dateTomorrow.setDate(dateToday.getDate() + 1);
        const dateDayAfterTomorrow = new Date(); dateDayAfterTomorrow.setDate(dateToday.getDate() + 2);

        // --- Seeding provider1 (Kamal Perera - Electrician) ---
        // 2 Ongoing Bookings (today)
        const b1_1 = await prisma.booking.create({
            data: {
                id: 'demo-b-1',
                customerId: demoCust1.id,
                providerId: demoProv1.id,
                serviceType: 'Electrician',
                bookingDate: dateToday,
                startTime: '10:00 AM',
                endTime: '12:00 PM',
                status: BookingStatus.IN_PROGRESS,
                baseAmount: 2000,
                platformFee: 200,
                totalAmount: 2200,
                address: demoCust1.addresses?.[0]?.addressLine1 || '12, Galle Road, Colombo',
                latitude: 6.9271,
                longitude: 79.8612,
                description: 'Short circuit check in the kitchen area. Needs urgent attention.',
            }
        });

        const b1_2 = await prisma.booking.create({
            data: {
                id: 'demo-b-2',
                customerId: demoCust2.id,
                providerId: demoProv1.id,
                serviceType: 'Electrician',
                bookingDate: dateToday,
                startTime: '02:00 PM',
                endTime: '04:00 PM',
                status: BookingStatus.CONFIRMED,
                baseAmount: 2000,
                platformFee: 200,
                totalAmount: 2200,
                address: '45, Kandy Road, Kiribathgoda',
                latitude: 6.9271,
                longitude: 79.8612,
                description: 'Installing three new LED panel lights in the living room.',
            }
        });

        // 2 Completed Bookings (past)
        const b1_3 = await prisma.booking.create({
            data: {
                id: 'demo-b-3',
                customerId: demoCust1.id,
                providerId: demoProv1.id,
                serviceType: 'Electrician',
                bookingDate: dateYesterday,
                startTime: '09:00 AM',
                endTime: '11:00 AM',
                status: BookingStatus.PAID,
                baseAmount: 2000,
                platformFee: 200,
                totalAmount: 2200,
                address: demoCust1.addresses?.[0]?.addressLine1 || '12, Galle Road, Colombo',
                latitude: 6.9271,
                longitude: 79.8612,
                description: 'Ceiling fan regulator wiring change.',
            }
        });

        await prisma.review.create({
            data: {
                id: 'demo-r-1',
                reviewerId: demoCust1.id,
                revieweeId: demoProv1.id,
                bookingId: b1_3.id,
                rating: 5,
                comment: 'Kamal did an amazing job fixing the short circuit in our DB board. Very professional and polite!',
                reply: 'Thank you for the review! Happy to help.'
            }
        });

        const b1_4 = await prisma.booking.create({
            data: {
                id: 'demo-b-4',
                customerId: demoCust2.id,
                providerId: demoProv1.id,
                serviceType: 'Electrician',
                bookingDate: dateTwoDaysAgo,
                startTime: '01:00 PM',
                endTime: '03:00 PM',
                status: BookingStatus.COMPLETED,
                baseAmount: 2000,
                platformFee: 200,
                totalAmount: 2200,
                address: '45, Kandy Road, Kiribathgoda',
                latitude: 6.9271,
                longitude: 79.8612,
                description: 'Replaced kitchen plug socket.',
            }
        });

        await prisma.review.create({
            data: {
                id: 'demo-r-2',
                reviewerId: demoCust2.id,
                revieweeId: demoProv1.id,
                bookingId: b1_4.id,
                rating: 5,
                comment: 'Excellent fan installation service. Quick and neat.',
                reply: 'Glad you liked the service!'
            }
        });

        // 3 Booking Requests (pending)
        await prisma.booking.createMany({
            data: [
                {
                    id: 'demo-b-5',
                    customerId: demoCust1.id,
                    providerId: demoProv1.id,
                    serviceType: 'Electrician',
                    bookingDate: dateTomorrow,
                    startTime: '09:00 AM',
                    endTime: '11:00 AM',
                    status: BookingStatus.PENDING,
                    baseAmount: 2000,
                    platformFee: 200,
                    totalAmount: 2200,
                    address: demoCust1.addresses?.[0]?.addressLine1 || '12, Galle Road, Colombo',
                    latitude: 6.9271,
                    longitude: 79.8612,
                    description: 'New refrigerator point wiring installation.'
                },
                {
                    id: 'demo-b-6',
                    customerId: demoCust2.id,
                    providerId: demoProv1.id,
                    serviceType: 'Electrician',
                    bookingDate: dateTomorrow,
                    startTime: '11:00 AM',
                    endTime: '01:00 PM',
                    status: BookingStatus.PENDING,
                    baseAmount: 2000,
                    platformFee: 200,
                    totalAmount: 2200,
                    address: '45, Kandy Road, Kiribathgoda',
                    latitude: 6.9271,
                    longitude: 79.8612,
                    description: 'A/C outdoor unit power point wiring.'
                },
                {
                    id: 'demo-b-7',
                    customerId: demoCust1.id,
                    providerId: demoProv1.id,
                    serviceType: 'Electrician',
                    bookingDate: dateDayAfterTomorrow,
                    startTime: '03:00 PM',
                    endTime: '05:00 PM',
                    status: BookingStatus.PENDING,
                    baseAmount: 2000,
                    platformFee: 200,
                    totalAmount: 2200,
                    address: demoCust1.addresses?.[0]?.addressLine1 || '12, Galle Road, Colombo',
                    latitude: 6.9271,
                    longitude: 79.8612,
                    description: 'Checking main circuit breaker trips.'
                }
            ]
        });

        // --- Seeding provider2 (Sunil Silva - Painter) ---
        // 2 Ongoing Bookings (today)
        await prisma.booking.create({
            data: {
                id: 'demo-b-8',
                customerId: demoCust2.id,
                providerId: demoProv2.id,
                serviceType: 'Painter',
                bookingDate: dateToday,
                startTime: '09:00 AM',
                endTime: '12:00 PM',
                status: BookingStatus.IN_PROGRESS,
                baseAmount: 1800,
                platformFee: 180,
                totalAmount: 1980,
                address: '45, Kandy Road, Kiribathgoda',
                latitude: 6.9271,
                longitude: 79.8612,
                description: 'Wall scraper cleaning and putty application on damaged plaster.',
            }
        });

        await prisma.booking.create({
            data: {
                id: 'demo-b-9',
                customerId: demoCust1.id,
                providerId: demoProv2.id,
                serviceType: 'Painter',
                bookingDate: dateToday,
                startTime: '01:00 PM',
                endTime: '04:00 PM',
                status: BookingStatus.CONFIRMED,
                baseAmount: 1800,
                platformFee: 180,
                totalAmount: 1980,
                address: demoCust1.addresses?.[0]?.addressLine1 || '12, Galle Road, Colombo',
                latitude: 6.9271,
                longitude: 79.8612,
                description: 'Applying primary coat to single bedroom wall.',
            }
        });

        // 2 Completed Bookings (past)
        const b2_3 = await prisma.booking.create({
            data: {
                id: 'demo-b-10',
                customerId: demoCust2.id,
                providerId: demoProv2.id,
                serviceType: 'Painter',
                bookingDate: dateYesterday,
                startTime: '09:00 AM',
                endTime: '12:00 PM',
                status: BookingStatus.PAID,
                baseAmount: 1800,
                platformFee: 180,
                totalAmount: 1980,
                address: '45, Kandy Road, Kiribathgoda',
                latitude: 6.9271,
                longitude: 79.8612,
                description: 'Bedroom accent wall color painting.',
            }
        });

        await prisma.review.create({
            data: {
                id: 'demo-r-3',
                reviewerId: demoCust2.id,
                revieweeId: demoProv2.id,
                bookingId: b2_3.id,
                rating: 5,
                comment: 'Sunil painted our bedroom wall beautifully. Perfect finish and very affordable price!',
                reply: 'Thank you for choosing my service!'
            }
        });

        const b2_4 = await prisma.booking.create({
            data: {
                id: 'demo-b-11',
                customerId: demoCust1.id,
                providerId: demoProv2.id,
                serviceType: 'Painter',
                bookingDate: dateTwoDaysAgo,
                startTime: '01:00 PM',
                endTime: '04:00 PM',
                status: BookingStatus.COMPLETED,
                baseAmount: 1800,
                platformFee: 180,
                totalAmount: 1980,
                address: demoCust1.addresses?.[0]?.addressLine1 || '12, Galle Road, Colombo',
                latitude: 6.9271,
                longitude: 79.8612,
                description: 'Pre-painting sander work.',
            }
        });

        await prisma.review.create({
            data: {
                id: 'demo-r-4',
                reviewerId: demoCust1.id,
                revieweeId: demoProv2.id,
                bookingId: b2_4.id,
                rating: 4,
                comment: 'Wall prep was very thorough. Good job.',
                reply: 'Thanks for the feedback!'
            }
        });

        // 3 Booking Requests (pending)
        await prisma.booking.createMany({
            data: [
                {
                    id: 'demo-b-12',
                    customerId: demoCust2.id,
                    providerId: demoProv2.id,
                    serviceType: 'Painter',
                    bookingDate: dateTomorrow,
                    startTime: '09:00 AM',
                    endTime: '12:00 PM',
                    status: BookingStatus.PENDING,
                    baseAmount: 1800,
                    platformFee: 180,
                    totalAmount: 1980,
                    address: '45, Kandy Road, Kiribathgoda',
                    latitude: 6.9271,
                    longitude: 79.8612,
                    description: 'Balcony wall weatherseal paint application.'
                },
                {
                    id: 'demo-b-13',
                    customerId: demoCust1.id,
                    providerId: demoProv2.id,
                    serviceType: 'Painter',
                    bookingDate: dateTomorrow,
                    startTime: '02:00 PM',
                    endTime: '05:00 PM',
                    status: BookingStatus.PENDING,
                    baseAmount: 1800,
                    platformFee: 180,
                    totalAmount: 1980,
                    address: demoCust1.addresses?.[0]?.addressLine1 || '12, Galle Road, Colombo',
                    latitude: 6.9271,
                    longitude: 79.8612,
                    description: 'Gate wooden door varnish painting.'
                },
                {
                    id: 'demo-b-14',
                    customerId: demoCust2.id,
                    providerId: demoProv2.id,
                    serviceType: 'Painter',
                    bookingDate: dateDayAfterTomorrow,
                    startTime: '10:00 AM',
                    endTime: '01:00 PM',
                    status: BookingStatus.PENDING,
                    baseAmount: 1800,
                    platformFee: 180,
                    totalAmount: 1980,
                    address: '45, Kandy Road, Kiribathgoda',
                    latitude: 6.9271,
                    longitude: 79.8612,
                    description: 'Living room base coat application.'
                }
            ]
        });

        // --- Seeding owner1 (Ravi Hardware) rentals ---
        const tDrill = ownerTools.find(t => t.name.includes('Drill')) || ownerTools[0];
        const tGrinder = ownerTools.find(t => t.name.includes('Grinder')) || ownerTools[1] || ownerTools[0];
        const tScaffold = ownerTools.find(t => t.name.includes('Scaffolding')) || ownerTools[2] || ownerTools[0];
        const tLadder = ownerTools.find(t => t.name.includes('Ladder')) || ownerTools[3] || ownerTools[0];

        // 2 Ongoing Rentals
        await prisma.toolRental.create({
            data: {
                id: 'demo-rn-1',
                toolId: tDrill.id,
                customerId: demoCust1.id,
                startDate: dateTwoDaysAgo,
                endDate: dateTomorrow,
                status: BookingStatus.IN_PROGRESS,
                totalAmount: tDrill.dailyRate * 4,
                platformFee: tDrill.dailyRate * 4 * 0.07,
                paymentMethod: 'CASH',
                isPaid: false,
                pickupLocation: demoOwn.rentalOwner!.formattedAddress || 'Moratuwa, Colombo',
                pickupLatitude: demoOwn.rentalOwner!.latitude,
                pickupLongitude: demoOwn.rentalOwner!.longitude
            }
        });

        await prisma.toolRental.create({
            data: {
                id: 'demo-rn-2',
                toolId: tGrinder.id,
                customerId: demoCust2.id,
                startDate: dateToday,
                endDate: dateDayAfterTomorrow,
                status: BookingStatus.CONFIRMED,
                totalAmount: tGrinder.dailyRate * 3,
                platformFee: tGrinder.dailyRate * 3 * 0.07,
                paymentMethod: 'CASH',
                isPaid: false,
                pickupLocation: demoOwn.rentalOwner!.formattedAddress || 'Moratuwa, Colombo',
                pickupLatitude: demoOwn.rentalOwner!.latitude,
                pickupLongitude: demoOwn.rentalOwner!.longitude
            }
        });

        // 2 Completed Rentals
        const rn3 = await prisma.toolRental.create({
            data: {
                id: 'demo-rn-3',
                toolId: tScaffold.id,
                customerId: demoCust1.id,
                startDate: dateFiveDaysAgo,
                endDate: dateYesterday,
                status: BookingStatus.PAID,
                totalAmount: tScaffold.dailyRate * 4,
                platformFee: tScaffold.dailyRate * 4 * 0.07,
                paymentMethod: 'CASH',
                isPaid: true,
                pickupLocation: demoOwn.rentalOwner!.formattedAddress || 'Moratuwa, Colombo',
                pickupLatitude: demoOwn.rentalOwner!.latitude,
                pickupLongitude: demoOwn.rentalOwner!.longitude
            }
        });

        await prisma.review.create({
            data: {
                id: 'demo-r-5',
                reviewerId: demoCust1.id,
                revieweeId: demoOwn.id,
                rentalId: rn3.id,
                rating: 5,
                comment: 'Scaffolding was in excellent sturdy condition. Ravi was very easy to deal with.',
                reply: 'Appreciate your business!'
            }
        });

        const rn4 = await prisma.toolRental.create({
            data: {
                id: 'demo-rn-4',
                toolId: tLadder.id,
                customerId: demoCust2.id,
                startDate: dateSevenDaysAgo,
                endDate: dateFiveDaysAgo,
                status: BookingStatus.COMPLETED,
                totalAmount: tLadder.dailyRate * 2,
                platformFee: tLadder.dailyRate * 2 * 0.07,
                paymentMethod: 'CASH',
                isPaid: true,
                pickupLocation: demoOwn.rentalOwner!.formattedAddress || 'Moratuwa, Colombo',
                pickupLatitude: demoOwn.rentalOwner!.latitude,
                pickupLongitude: demoOwn.rentalOwner!.longitude
            }
        });

        await prisma.review.create({
            data: {
                id: 'demo-r-6',
                reviewerId: demoCust2.id,
                revieweeId: demoOwn.id,
                rentalId: rn4.id,
                rating: 5,
                comment: 'Very clean ladder, light and easy to carry. Highly recommended.',
                reply: 'Thank you! Feel free to rent again.'
            }
        });

        // 3 Pending Rental Requests
        await prisma.toolRental.createMany({
            data: [
                {
                    id: 'demo-rn-5',
                    toolId: tScaffold.id,
                    customerId: demoCust1.id,
                    startDate: dateTomorrow,
                    endDate: dateDayAfterTomorrow,
                    status: BookingStatus.PENDING,
                    totalAmount: tScaffold.dailyRate * 2,
                    platformFee: tScaffold.dailyRate * 2 * 0.07,
                    paymentMethod: 'CASH',
                    isPaid: false,
                    pickupLocation: demoOwn.rentalOwner!.formattedAddress || 'Moratuwa, Colombo',
                    pickupLatitude: demoOwn.rentalOwner!.latitude,
                    pickupLongitude: demoOwn.rentalOwner!.longitude
                },
                {
                    id: 'demo-rn-6',
                    toolId: tGrinder.id,
                    customerId: demoCust2.id,
                    startDate: dateTomorrow,
                    endDate: dateDayAfterTomorrow,
                    status: BookingStatus.PENDING,
                    totalAmount: tGrinder.dailyRate * 2,
                    platformFee: tGrinder.dailyRate * 2 * 0.07,
                    paymentMethod: 'CASH',
                    isPaid: false,
                    pickupLocation: demoOwn.rentalOwner!.formattedAddress || 'Moratuwa, Colombo',
                    pickupLatitude: demoOwn.rentalOwner!.latitude,
                    pickupLongitude: demoOwn.rentalOwner!.longitude
                },
                {
                    id: 'demo-rn-7',
                    toolId: tDrill.id,
                    customerId: demoCust1.id,
                    startDate: dateDayAfterTomorrow,
                    endDate: new Date(dateDayAfterTomorrow.getTime() + 2 * 24 * 3600 * 1000),
                    status: BookingStatus.PENDING,
                    totalAmount: tDrill.dailyRate * 2,
                    platformFee: tDrill.dailyRate * 2 * 0.07,
                    paymentMethod: 'CASH',
                    isPaid: false,
                    pickupLocation: demoOwn.rentalOwner!.formattedAddress || 'Moratuwa, Colombo',
                    pickupLatitude: demoOwn.rentalOwner!.latitude,
                    pickupLongitude: demoOwn.rentalOwner!.longitude
                }
            ]
        });
    }

    // 10. Recalculate Weighted Trust Scores for all service providers and rental owners
    console.log('Recalculating and updating User Weighted Trust Scores in database...');
    const allProvidersAndOwners = await prisma.user.findMany({
        where: { role: { in: [Role.SERVICE_PROVIDER, Role.RENTAL_OWNER] } }
    });

    for (const user of allProvidersAndOwners) {
        // 1. Get all reviews received
        const reviews = await prisma.review.findMany({
            where: { revieweeId: user.id },
            select: { rating: true }
        });
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 5.0;

        // 2. Count resolved disputes where this user was the reported party
        const disputeCount = await prisma.dispute.count({
            where: { reportedId: user.id, status: 'RESOLVED' }
        });

        // 3. Count bookings
        const totalBookings = await prisma.booking.count({
            where: { providerId: user.id, status: { in: [BookingStatus.COMPLETED, BookingStatus.PAID, BookingStatus.CANCELLED] } }
        });
        const completedBookings = await prisma.booking.count({
            where: { providerId: user.id, status: { in: [BookingStatus.COMPLETED, BookingStatus.PAID] } }
        });

        // 4. Count rentals
        const totalRentals = await prisma.toolRental.count({
            where: { tool: { owner: { userId: user.id } }, status: { in: [BookingStatus.COMPLETED, BookingStatus.PAID, BookingStatus.CANCELLED] } }
        });
        const completedRentals = await prisma.toolRental.count({
            where: { tool: { owner: { userId: user.id } }, status: { in: [BookingStatus.COMPLETED, BookingStatus.PAID] } }
        });

        const totalTransactions = totalBookings + totalRentals;
        const completedTransactions = completedBookings + completedRentals;

        let completionRate = 1.0;
        if (totalTransactions > 0) {
            completionRate = completedTransactions / totalTransactions;
        }

        // Trust Score = (Avg Rating * 0.6) + (Completion Rate * 5 * 0.3) - (Disputes * 0.5)
        let score = (avgRating * 0.6) + (completionRate * 5 * 0.3) - (disputeCount * 0.5);
        score = Math.max(1.0, Math.min(5.0, score));

        // If provider is suspended or has very low score, simulate suspension in DB
        const lowScore = score < 2.0;

        await prisma.user.update({
            where: { id: user.id },
            data: { 
                trustScore: parseFloat(score.toFixed(1)),
                isSuspended: lowScore ? true : user.isSuspended,
                suspensionReason: lowScore ? 'Weighted trust score fell below threshold limit (2.0)' : user.suspensionReason
            }
        });
    }

    // 11. Seeding Notifications for Test Users
    console.log('Seeding Notification records...');
    const testUser1 = await prisma.user.findFirst({ where: { email: 'user1@example.com' } });
    const testProvider1 = await prisma.user.findFirst({ where: { email: 'provider1@example.com' } });
    const testOwner1 = await prisma.user.findFirst({ where: { email: 'owner1@example.com' } });

    if (testUser1) {
        await prisma.notification.createMany({
            data: [
                {
                    userId: testUser1.id,
                    title: 'Verification Approved! 🎉',
                    message: 'Your documents have been verified and approved automatically by our AI system. You are now fully verified on BuildMate.',
                    type: 'STATUS_UPDATE',
                    isRead: false
                },
                {
                    userId: testUser1.id,
                    title: 'Booking Confirmed!',
                    message: 'Your service booking for Electrician has been confirmed.',
                    type: 'STATUS_UPDATE',
                    isRead: false
                },
                {
                    userId: testUser1.id,
                    title: 'Rental Request Accepted',
                    message: 'Owner has approved your rental request for DeWalt Impact Drill.',
                    type: 'RENTAL_UPDATE',
                    isRead: true
                }
            ]
        });
    }

    if (testProvider1) {
        await prisma.notification.createMany({
            data: [
                {
                    userId: testProvider1.id,
                    title: 'New Booking Request',
                    message: 'You have a new booking request for Electrician.',
                    type: 'BOOKING_REQUEST',
                    isRead: false
                },
                {
                    userId: testProvider1.id,
                    title: 'New Review Received',
                    message: 'Someone left you a 5.0-star review: "Excellent work! Very punctual and highly professional."',
                    type: 'REVIEW_RECEIVED',
                    isRead: false
                },
                {
                    userId: testProvider1.id,
                    title: 'Payout Confirmed',
                    message: 'LKR 4,500 has been transferred to your account for your completed service.',
                    type: 'PAYOUT_CONFIRMED',
                    isRead: true
                }
            ]
        });
    }

    if (testOwner1) {
        await prisma.notification.createMany({
            data: [
                {
                    userId: testOwner1.id,
                    title: 'New Rental Request',
                    message: 'You have a new rental request for Makita Angle Grinder.',
                    type: 'RENTAL_REQUEST',
                    isRead: false
                },
                {
                    userId: testOwner1.id,
                    title: 'Tool Returned',
                    message: 'DeWalt Impact Drill has been marked returned. Please verify condition checklist.',
                    type: 'RENTAL_UPDATE',
                    isRead: false
                }
            ]
        });
    }

    console.log('Seed completed successfully!');
    console.log('--- Account Credentials Summary ---');
    console.log('Admins: admin1@buildmate.lk / password123');
    console.log('Households: user1@example.com to user300@example.com (password: password123)');
    console.log('Providers: provider1@example.com to provider150@example.com (password: password123)');
    console.log('Rental Owners: owner1@example.com to owner50@example.com (password: password123)');
    console.log('-----------------------------------');
}

main()
    .catch((e) => {
        console.error('Error running database seeder:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
