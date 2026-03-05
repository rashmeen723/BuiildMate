import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: {
            serviceProvider: true,
            rentalOwner: true
        }
    });

    console.log('Total Users:', users.length);
    users.forEach(u => {
        const role = u.serviceProvider ? 'Provider' : u.rentalOwner ? 'Rental Owner' : 'Household';
        const status = u.serviceProvider?.status || u.rentalOwner?.status || 'N/A';
        console.log(`- ${u.fullName} (${role}) | Status: ${status}`);
    });

    await prisma.$disconnect();
}

main();
