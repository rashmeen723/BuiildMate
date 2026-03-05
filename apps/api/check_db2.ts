import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const bookings = await prisma.booking.findMany();
    const users = await prisma.user.findMany({ select: { id: true, fullName: true, role: true } });
    const providers = await prisma.serviceProviderProfile.findMany();

    const data = JSON.stringify({ bookings, users, providers }, null, 2);
    fs.writeFileSync('db_data.json', data);
    console.log('Data written to db_data.json');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
