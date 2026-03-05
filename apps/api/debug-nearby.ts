import { PrismaClient, VerificationStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'user2@buildmate.com' },
        include: { addresses: true }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    const addr = user.addresses.find(a => a.isDefault) || user.addresses[0];
    console.log(`User: ${user.fullName} | Location: ${addr.latitude}, ${addr.longitude}`);

    const approvedProviders = await prisma.serviceProviderProfile.count({
        where: { status: VerificationStatus.APPROVED }
    });
    console.log(`Total Approved Providers: ${approvedProviders}`);

    const pendingProviders = await prisma.serviceProviderProfile.findMany({
        where: { status: VerificationStatus.PENDING },
        include: { user: true }
    });
    console.log(`Pending Providers: ${pendingProviders.length}`);
    pendingProviders.forEach(p => console.log(`- ${p.user.fullName} (${p.category}) [ID: ${p.userId}]`));

    await prisma.$disconnect();
}

main();
