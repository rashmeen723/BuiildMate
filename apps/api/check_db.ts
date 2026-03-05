import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const bookings = await prisma.booking.findMany();
    console.log('Bookings:', bookings);

    const users = await prisma.user.findMany({ select: { id: true, fullName: true, role: true } });
    console.log('Users:', users);

    const providers = await prisma.serviceProviderProfile.findMany();
    console.log('Providers:', providers);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
