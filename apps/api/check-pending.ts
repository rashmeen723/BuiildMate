import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const providers = await prisma.serviceProviderProfile.findMany({
        where: { status: 'PENDING' },
        include: { user: true }
    });
    const owners = await prisma.rentalOwnerProfile.findMany({
        where: { status: 'PENDING' },
        include: { user: true }
    });

    console.log('Pending Providers:', providers.length);
    providers.forEach(p => console.log(`- ${p.user.fullName} (${p.category})`));

    console.log('Pending Rental Owners:', owners.length);
    owners.forEach(o => console.log(`- ${o.user.fullName} (${o.businessName})`));

    await prisma.$disconnect();
}

main();
