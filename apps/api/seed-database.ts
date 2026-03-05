import { PrismaClient, Role, VerificationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const firstNames = ['Aruna', 'Bandara', 'Chaminda', 'Dinesh', 'Eranda', 'Fariq', 'Gihan', 'Harsha', 'Ishara', 'Jayantha', 'Kasun', 'Laksiri', 'Mahesh', 'Nalin', 'Oshada', 'Prasanna', 'Quasim', 'Rohan', 'Sampath', 'Thushara', 'Udaya', 'Vajira', 'Wasantha', 'Xavier', 'Yohan', 'Zakir', 'Anura', 'Bimal', 'Chathura', 'Damith', 'Eshan', 'Fazil', 'Gayan', 'Heshan', 'Indika', 'Janaka', 'Kavinda', 'Lahiru', 'Manoj', 'Nuwan', 'Osanda', 'Piyal', 'Ranjith', 'Saman', 'Tharindu', 'Upul', 'Vishwa', 'Waruna', 'Yasas', 'Ziyan'];

const lastNames = ['Perera', 'Silva', 'Fernando', 'Rodrigo', 'Jayawardena', 'Gunaratne', 'Herath', 'Ranasinghe', 'Liyanage', 'Wijesinghe', 'Rathnayake', 'Amarasinghe', 'Bandara', 'Cooray', 'Dassanayake', 'Edirisinghe', 'Goonetilleke', 'Hettiarachchi', 'Ilangakoon', 'Jayasuriya', 'Kariyawasam', 'Lokuge', 'Munasinghe', 'Nanayakkara', 'Obeyesekere', 'Pathirana', 'Rajapaksa', 'Senanayake', 'Tennakoon', 'Udugama', 'Vithanage', 'Wickramasinghe', 'Yapa', 'Zoysa', 'Alwis', 'Balasuriya', 'Chandrasiri', 'Dayaratne', 'Ekanayake', 'Fonseka', 'Gamage', 'Hevawitharana', 'Iriyagolla', 'Jayasinghe', 'Kulasinghe', 'Liyanaratchi', 'Mendis', 'Niriella', 'Omar', 'Premadasa'];

const serviceCategories = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Home Cleaner', 'AC Technician', 'Gardener', 'Interior Designer', 'Mason', 'Welder'];

const toolCategories = ['Power Tools', 'Ladders', 'Scaffolding', 'Garden Tools', 'Painting Equipment', 'Hand Tools', 'Cleaning Equipment', 'Safety Gear'];

const skillsMap: Record<string, string[]> = {
    'Electrician': ['House Wiring', 'DB Installation', 'Lighting', 'Safety Checks'],
    'Plumber': ['Leak Repair', 'Pipe Fitting', 'Bathroom Fitting', 'Water Heater Repair'],
    'Carpenter': ['Furniture Making', 'Door Repair', 'Roofing', 'Partitioning'],
    'Painter': ['Interior Painting', 'Exterior Painting', 'Wall Putty', 'Polishing'],
    'Home Cleaner': ['Deep Cleaning', 'Window Cleaning', 'Kitchen Cleaning', 'Post-Construction'],
    'AC Technician': ['AC Servicing', 'Gas Refilling', 'Installation', 'PCB Repair'],
    'Gardener': ['Landscaping', 'Lawn Mowing', 'Planting', 'Tree Pruning'],
    'Interior Designer': ['Space Planning', '3D Design', 'Decorating', 'Color Consult'],
    'Mason': ['Bricking', 'Plastering', 'Tiling', 'Stone Work'],
    'Welder': ['Iron Gates', 'Grills', 'Steel Furniture', 'Industrial Welding']
};

const workingDaysOptions = [['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], ['Everyday'], ['Weekend only']];

function getRandom(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomLocation() {
    // Center: Colombo (6.9271, 79.8612)
    const lat = 6.9271 + (Math.random() - 0.5) * 0.2; // +/- 0.1 deg (~11km)
    const lng = 79.8612 + (Math.random() - 0.5) * 0.2;
    return { lat, lng };
}

async function seed() {
    console.log('--- Database Seeding Started ---');
    const password = await bcrypt.hash('Password123', 10);

    // 1. Create 50 Service Providers
    console.log('Seeding 50 Service Providers...');
    for (let i = 1; i <= 50; i++) {
        const fName = getRandom(firstNames);
        const lName = getRandom(lastNames);
        const fullName = `${fName} ${lName}`;
        const email = `provider${i}@buildmate.com`;
        const phone = `077${(1000000 + i).toString().substring(1)}`;
        const category = getRandom(serviceCategories);
        const loc = getRandomLocation();

        await prisma.user.create({
            data: {
                email,
                password,
                fullName,
                phone,
                role: Role.SERVICE_PROVIDER,
                isEmailVerified: true,
                profileImage: `https://i.pravatar.cc/150?u=${email}`,
                serviceProvider: {
                    create: {
                        category,
                        yearsOfExperience: (Math.floor(Math.random() * 15) + 1).toString(),
                        skills: skillsMap[category] || ['General Repairs'],
                        status: i % 5 === 0 ? VerificationStatus.PENDING : VerificationStatus.APPROVED,
                        latitude: loc.lat,
                        longitude: loc.lng,
                        serviceRadius: 15,
                        formattedAddress: `${i * 10}, Galle Road, Colombo 0${(i % 9) + 1}`,
                        workingDays: getRandom(workingDaysOptions),
                        workingHoursStart: '08:00 AM',
                        workingHoursEnd: '06:00 PM'
                    }
                },
                documents: {
                    create: [
                        { documentType: 'ID_CARD', documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' },
                        { documentType: 'CERTIFICATE', documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' }
                    ]
                },
                addresses: {
                    create: {
                        addressLine1: `${i * 10}, Galle Road`,
                        city: 'Colombo',
                        latitude: loc.lat,
                        longitude: loc.lng,
                        isDefault: true
                    }
                }
            }
        });
    }

    // 2. Create 50 Rental Owners
    console.log('Seeding 50 Rental Owners...');
    for (let i = 1; i <= 50; i++) {
        const fName = getRandom(firstNames);
        const lName = getRandom(lastNames);
        const fullName = `${fName} ${lName}`;
        const email = `owner${i}@buildmate.com`;
        const phone = `071${(1000000 + i).toString().substring(1)}`;
        const businessName = `${lName} Tools & Rentals`;
        const loc = getRandomLocation();

        await prisma.user.create({
            data: {
                email,
                password,
                fullName,
                phone,
                role: Role.RENTAL_OWNER,
                isEmailVerified: true,
                profileImage: `https://i.pravatar.cc/150?u=${email}`,
                rentalOwner: {
                    create: {
                        businessName,
                        toolCategories: [getRandom(toolCategories), getRandom(toolCategories)],
                        yearsInBusiness: (Math.floor(Math.random() * 10) + 1).toString(),
                        status: i % 8 === 0 ? VerificationStatus.PENDING : VerificationStatus.APPROVED,
                        latitude: loc.lat,
                        longitude: loc.lng,
                        formattedAddress: `${i * 5}, Kandy Road, Kiribathgoda`
                    }
                },
                documents: {
                    create: [
                        { documentType: 'BUSINESS_REG', documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' }
                    ]
                },
                addresses: {
                    create: {
                        addressLine1: `${i * 5}, Kandy Road`,
                        city: 'Kiribathgoda',
                        latitude: loc.lat,
                        longitude: loc.lng,
                        isDefault: true
                    }
                }
            }
        });
    }

    // 3. Create 50 Household Users
    console.log('Seeding 50 Household Users...');
    for (let i = 1; i <= 50; i++) {
        const fName = getRandom(firstNames);
        const lName = getRandom(lastNames);
        const fullName = `${fName} ${lName}`;
        const email = `user${i}@buildmate.com`;
        const phone = `075${(1000000 + i).toString().substring(1)}`;
        const loc = getRandomLocation();

        await prisma.user.create({
            data: {
                email,
                password,
                fullName,
                phone,
                role: Role.HOUSEHOLD,
                isEmailVerified: true,
                profileImage: `https://i.pravatar.cc/150?u=${email}`,
                addresses: {
                    create: {
                        addressLine1: `${i * 2}, Flower Road`,
                        city: 'Colombo 07',
                        latitude: loc.lat,
                        longitude: loc.lng,
                        isDefault: true
                    }
                }
            }
        });
    }

    console.log('--- Seeding Successful! 150 Total Records Added ---');
    await prisma.$disconnect();
}

seed().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
