import { PrismaClient, VerificationStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'user2@buildmate.com' },
        include: { addresses: true }
    });

    if (!user) {
        process.stdout.write('User not found\n');
        return;
    }

    const addr = user.addresses.find(a => a.isDefault) || user.addresses[0];
    process.stdout.write(`User: ${user.fullName} at ${addr.latitude}, ${addr.longitude}\n`);

    const approvedCount = await prisma.serviceProviderProfile.count({
        where: { status: VerificationStatus.APPROVED }
    });
    process.stdout.write(`Total Approved Providers: ${approvedCount}\n`);

    const samples = await prisma.serviceProviderProfile.findMany({
        where: { status: VerificationStatus.APPROVED },
        take: 3
    });
    samples.forEach(s => {
        process.stdout.write(`Sample Approved - Hours: ${s.workingHoursStart} to ${s.workingHoursEnd}, Days: ${s.workingDays.join(',')}\n`);
    });

    const pending = await prisma.serviceProviderProfile.findMany({
        where: { status: VerificationStatus.PENDING },
        include: { user: true },
        take: 5
    });
    process.stdout.write(`Pending Sample Count: ${pending.length}\n`);
    pending.forEach(p => {
        process.stdout.write(`- PENDING: ${p.user.fullName} (${p.category})\n`);
    });

    await prisma.$disconnect();
}

main();
