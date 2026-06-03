import { PrismaClient, Role, VerificationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('--- FINAL ENHANCED SEEDING FOR AMBALANTOTA (With Reviews) ---');
    const passwordHash = await bcrypt.hash('password123', 10);

    // Ambalantota Area Coordinates
    const areaLocations = [
        { lat: 6.1246, lng: 81.0232, addr: 'Ambalantota Central, Hambantota Road' },
        { lat: 6.1310, lng: 81.0180, addr: 'Nonagama Junction, Junction Road' },
        { lat: 6.1180, lng: 81.0350, addr: 'Ridiyagama Road, Ambalantota' },
        { lat: 6.1400, lng: 81.0450, addr: 'Palla Junction, 12th km Post' },
        { lat: 6.1050, lng: 81.0120, addr: 'Hambantota Road Beach Area' },
        { lat: 6.1290, lng: 81.0300, addr: 'Ambalantota Municipal Grounds' }
    ];

    // 1. Create a Primary Reviewer (Household User)
    const reviewer = await prisma.user.upsert({
        where: { email: 'amb.reviewer@example.com' },
        update: {},
        create: {
            email: 'amb.reviewer@example.com',
            password: passwordHash,
            fullName: 'Lanka Perera (Ambalantota)',
            phone: '0719876543',
            role: Role.HOUSEHOLD,
            isEmailVerified: true,
            profileImage: 'https://randomuser.me/api/portraits/women/66.jpg'
        }
    });

    // 2. Pro Providers with high-quality ratings
    const proProviders = [
        { name: 'Gamini Rajapaksa', cat: 'Electrician', img: 'https://randomuser.me/api/portraits/men/15.jpg', rate: 750, rev: 'Gamini fixed our fuse box very quickly. Highly professional!' },
        { name: 'Nirosha Kumari', cat: 'Cleaning', img: 'https://randomuser.me/api/portraits/women/12.jpg', rate: 500, rev: 'Excellent cleaning service. My house was spotless.' },
        { name: 'Duminda Silva', cat: 'Plumber', img: 'https://randomuser.me/api/portraits/men/62.jpg', rate: 800, rev: 'Best plumber in Ambalantota. Arrived on time.' }
    ];

    console.log('Creating Service Providers with reviews...');
    for (let i = 0; i < proProviders.length; i++) {
        const p = proProviders[i];
        const loc = areaLocations[i % areaLocations.length];

        const provider = await prisma.user.upsert({
            where: { email: `amb.v3.sp${i}@example.com` },
            update: {},
            create: {
                email: `amb.v3.sp${i}@example.com`,
                password: passwordHash,
                fullName: p.name,
                phone: `077${4000000 + i}`,
                profileImage: p.img,
                role: Role.SERVICE_PROVIDER,
                isEmailVerified: true,
                serviceProvider: {
                    create: {
                        category: p.cat,
                        yearsOfExperience: '15',
                        skills: [`Pro ${p.cat}`, 'Fast Service', 'Expert'],
                        hourlyRate: p.rate,
                        status: VerificationStatus.APPROVED,
                        latitude: loc.lat,
                        longitude: loc.lng,
                        formattedAddress: loc.addr
                    }
                }
            }
        });

        // Add 2 reviews per provider
        await prisma.review.create({
            data: {
                reviewerId: reviewer.id,
                revieweeId: provider.id,
                rating: 5,
                comment: p.rev,
                likes: 3,
                images: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400']
            }
        });
        
        await prisma.review.create({
            data: {
                reviewerId: reviewer.id,
                revieweeId: provider.id,
                rating: 4,
                comment: "Very good service, will call again.",
                likes: 1
            }
        });
    }

    // 3. Rental Owners & Tool Reviews
    const proOwners = [
        { biz: 'Saman Power Tools', name: 'Saman Kumara', img: 'https://randomuser.me/api/portraits/men/45.jpg' },
        { biz: 'Ambalantota Hardware (V3)', name: 'Gamini Silva', img: 'https://randomuser.me/api/portraits/men/20.jpg' }
    ];

    console.log('Creating Rental Owners & Tools with reviews...');
    for (let i = 0; i < proOwners.length; i++) {
        const o = proOwners[i];
        const loc = areaLocations[(i + 3) % areaLocations.length];

        const ownerUser = await prisma.user.upsert({
            where: { email: `amb.v3.owner${i}@example.com` },
            update: {},
            create: {
                email: `amb.v3.owner${i}@example.com`,
                password: passwordHash,
                fullName: o.name,
                phone: `047${6000000 + i}`,
                profileImage: o.img,
                role: Role.RENTAL_OWNER,
                isEmailVerified: true,
                rentalOwner: {
                    create: {
                        businessName: o.biz,
                        toolCategories: ['Power Tools', 'Ladders'],
                        yearsInBusiness: '10',
                        status: VerificationStatus.APPROVED,
                        latitude: loc.lat,
                        longitude: loc.lng,
                        formattedAddress: loc.addr
                    }
                }
            },
            include: { rentalOwner: true }
        });

        if (!ownerUser.rentalOwner) continue;

        // Add 2 tools per owner
        const toolData = [
            { name: 'Bosch Power Drill', rate: 1000, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400' },
            { name: 'Makita Grinder', rate: 1200, img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400' }
        ];

        for (const t of toolData) {
            const tool = await prisma.tool.create({
                data: {
                    name: `${o.biz} ${t.name}`,
                    description: `Professional ${t.name} from ${o.biz}.`,
                    category: 'Power Tools',
                    dailyRate: t.rate,
                    ownerId: ownerUser.rentalOwner.id,
                    images: [t.img],
                    available: true,
                    status: 'AVAILABLE'
                }
            });

            // Add review for the tool (and the owner)
            await prisma.review.create({
                data: {
                    reviewerId: reviewer.id,
                    revieweeId: ownerUser.id,
                    rating: 5,
                    comment: `This ${t.name} worked perfectly. Highly recommended!`,
                    images: [t.img]
                }
            });
        }
    }

    console.log('\nSUCCESS! Seeding for Ambalantota with ratings is complete!');
    console.log('Login: amb.reviewer@example.com / password123 (to see given reviews)');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
