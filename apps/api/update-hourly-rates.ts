import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating current Service Providers to have a default hourlyRate of 500...');

    // Use raw SQL because Prisma Client hasn't been generated in the running dev server yet
    const result = await prisma.$executeRawUnsafe(`
    UPDATE "ServiceProviderProfile" 
    SET "hourlyRate" = 500 
    WHERE "hourlyRate" IS NULL;
  `);

    console.log(`Successfully updated ${result} ServiceProviderProfile records.`);
}

main()
    .catch((e) => {
        console.error('Error updating records:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
