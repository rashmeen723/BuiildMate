import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    console.log('--- CREDENTIALS ---');
    console.log('Household User: user@example.com / password123');
    console.log('Service Provider: provider1@example.com / password123');
    console.log('Rental Owner: owner1@example.com / password123');
    console.log('Admin: admin@buildmate.com / admin123 (if seeded)\n');

    // Ambalantota Approx: 6.1246, 81.0232
    const targetLat = 6.1246;
    const targetLng = 81.0232;
    const range = 0.5; // Roughly 50km

    console.log(`--- RECORDS NEAR AMBALANTOTA (Lat ${targetLat}, Lng ${targetLng}) ---`);
    
    const providers = await prisma.serviceProviderProfile.findMany({
        where: {
            latitude: { gte: targetLat - range, lte: targetLat + range },
            longitude: { gte: targetLng - range, lte: targetLng + range }
        },
        include: { user: true }
    });

    const owners = await prisma.rentalOwnerProfile.findMany({
        where: {
            latitude: { gte: targetLat - range, lte: targetLat + range },
            longitude: { gte: targetLng - range, lte: targetLng + range }
        },
        include: { user: true }
    });

    console.log(`Providers found: ${providers.length}`);
    providers.forEach(p => console.log(` - ${p.user.fullName} (${p.category}) @ ${p.formattedAddress}`));

    console.log(`Rental Owners found: ${owners.length}`);
    owners.forEach(o => console.log(` - ${o.businessName} @ ${o.formattedAddress}`));

    await prisma.$disconnect();
}

checkData();
