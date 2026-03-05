import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function update() {
    console.log('Updating test user address to Ambalantota...');

    // Update user1's address (most common test user)
    const user = await prisma.user.findFirst({
        where: { email: 'user1@buildmate.com' }
    });

    if (user) {
        await prisma.address.updateMany({
            where: { userId: user.id },
            data: {
                addressLine1: '58, Beragama Road',
                city: 'Ambalantota',
                latitude: 6.1235,
                longitude: 81.0264
            }
        });
        console.log('Successfully updated test user location!');
    } else {
        console.log('Test user not found.');
    }

    await prisma.$disconnect();
}

update();
