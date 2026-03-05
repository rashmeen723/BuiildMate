import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findFirst({
        where: { email: 'user1@buildmate.com' }, // Assuming this is the test user
        include: { addresses: true }
    });
    console.log('User Addresses:', JSON.stringify(user?.addresses, null, 2));

    const providers = await prisma.serviceProviderProfile.findMany({
        take: 5
    });
    console.log('Sample Providers:', JSON.stringify(providers, null, 2));
    await prisma.$disconnect();
}

check();
