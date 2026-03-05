import { PrismaClient, Role, VerificationStatus, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ambalantotaLat = 6.1235;
const ambalantotaLng = 81.0264;

// Professional Profile Images from Unsplash
const providerPhotos = [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop', // Professional man
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop', // Professional woman
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop', // Man in suit/workwear
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop', // Woman
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop', // Professional man
    'https://images.unsplash.com/photo-1567532939604-b6c5b0adccfc?w=400&h=400&fit=crop', // Woman
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', // Man
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop', // Woman
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', // Man
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop', // Woman
];

const serviceCategories = [
    { name: 'Electrician', icon: 'flash' },
    { name: 'Plumber', icon: 'water' },
    { name: 'Carpenter', icon: 'hammer' },
    { name: 'Painter', icon: 'color-palette' },
    { name: 'Home Cleaner', icon: 'leaf' },
    { name: 'AC Technician', icon: 'snow' },
    { name: 'Gardener', icon: 'flower' },
    { name: 'Mason', icon: 'business' }
];

function getRandomNearby() {
    const lat = ambalantotaLat + (Math.random() - 0.5) * 0.06;
    const lng = ambalantotaLng + (Math.random() - 0.5) * 0.06;
    return { lat, lng };
}

async function main() {
    console.log('--- Wiping Database ---');

    // High to low dependency deletion
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.document.deleteMany();
    await prisma.address.deleteMany();
    await prisma.serviceProviderProfile.deleteMany();
    await prisma.rentalOwnerProfile.deleteMany();
    await prisma.otp.deleteMany();
    await prisma.user.deleteMany();

    console.log('--- Database Wiped Successfully ---');

    const password = await bcrypt.hash('Password123', 10);

    // 1. Create a Default Admin
    await prisma.user.create({
        data: {
            email: 'admin@buildmate.com',
            password,
            fullName: 'BuildMate Admin',
            role: Role.ADMIN,
            isEmailVerified: true
        }
    });

    // 2. Create Common Household Users (Customers) in Ambalantota
    console.log('--- Seeding Household Users ---');
    const householdCoords = [
        { name: 'Rashmeen Kavindya', email: 'rashmeen@gmail.com', lat: 6.1230, lng: 81.0260 },
        { name: 'Sahan Perera', email: 'sahan@gmail.com', lat: 6.1250, lng: 81.0280 },
        { name: 'Nilmini Silva', email: 'nilmini@gmail.com', lat: 6.1210, lng: 81.0240 },
    ];

    for (const h of householdCoords) {
        await prisma.user.create({
            data: {
                email: h.email,
                password,
                fullName: h.name,
                role: Role.HOUSEHOLD,
                isEmailVerified: true,
                profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(h.name)}&background=random`,
                addresses: {
                    create: {
                        addressLine1: 'Ambalantota Road',
                        city: 'Ambalantota',
                        latitude: h.lat,
                        longitude: h.lng,
                        isDefault: true
                    }
                }
            }
        });
    }

    // 3. Create Service Providers in Ambalantota
    console.log('--- Seeding Service Providers ---');
    const firstNames = ['Wimal', 'Sunil', 'Kamal', 'Nimal', 'Jagath', 'Siri', 'Anura', 'Bandu', 'Chitra', 'Daya', 'Amara', 'Bimal'];
    const lastNames = ['Gunasekara', 'Jayasinghe', 'Nanayakkara', 'Amarasinghe', 'Wickrama', 'Kariyawasam', 'Liyanage', 'Perera'];

    for (let i = 0; i < 15; i++) {
        const fName = firstNames[i % firstNames.length];
        const lName = lastNames[i % lastNames.length];
        const fullName = `${fName} ${lName}`;
        const email = `pro_${i}@buildmate.com`;
        const cat = serviceCategories[i % serviceCategories.length];
        const loc = getRandomNearby();
        const photo = providerPhotos[i % providerPhotos.length];

        await prisma.user.create({
            data: {
                email,
                password,
                fullName,
                phone: `077${Math.floor(1000000 + Math.random() * 9000000)}`,
                role: Role.SERVICE_PROVIDER,
                isEmailVerified: true,
                profileImage: photo,
                serviceProvider: {
                    create: {
                        category: cat.name,
                        yearsOfExperience: (Math.floor(Math.random() * 15) + 3).toString(),
                        skills: [cat.name, 'Standard Service', 'Repair'],
                        hourlyRate: 500 + (Math.floor(Math.random() * 10) * 100),
                        status: VerificationStatus.APPROVED,
                        latitude: loc.lat,
                        longitude: loc.lng,
                        serviceRadius: 15,
                        formattedAddress: `Beragama Road, Ambalantota`,
                        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        workingHoursStart: '08:00 AM',
                        workingHoursEnd: '06:00 PM'
                    }
                },
                addresses: {
                    create: {
                        addressLine1: 'Service Station, Ambalantota',
                        city: 'Ambalantota',
                        latitude: loc.lat,
                        longitude: loc.lng,
                        isDefault: true
                    }
                }
            }
        });
    }

    // 4. Create Rental Owners
    console.log('--- Seeding Rental Owners ---');
    const rentalOwners = [
        { name: 'Ambalantota Tool Rentals', email: 'rentals@ambalantota.com' },
        { name: 'Southern Hardware & Tools', email: 'hardware@southern.com' }
    ];

    for (const r of rentalOwners) {
        const loc = getRandomNearby();
        await prisma.user.create({
            data: {
                email: r.email,
                password,
                fullName: r.name,
                role: Role.RENTAL_OWNER,
                isEmailVerified: true,
                profileImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=400&h=400&fit=crop',
                rentalOwner: {
                    create: {
                        businessName: r.name,
                        toolCategories: ['Power Tools', 'Ladders', 'Drills'],
                        yearsInBusiness: '5',
                        status: VerificationStatus.APPROVED,
                        latitude: loc.lat,
                        longitude: loc.lng,
                        formattedAddress: 'Main Street, Ambalantota'
                    }
                }
            }
        });
    }

    console.log('--- Database Seeding Completed Successfully ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
