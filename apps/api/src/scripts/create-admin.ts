import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const email = "admin@buildmate.com";
    const password = "AdminPassword123!";
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const existing = await prisma.user.findUnique({
        where: { email }
    });
    
    if (existing) {
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                role: "ADMIN",
                fullName: "Rashmeen Admin",
                isEmailVerified: true
            }
        });
        console.log("Admin user updated successfully!");
    } else {
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName: "Rashmeen Admin",
                role: "ADMIN",
                isEmailVerified: true
            }
        });
        console.log("Admin user created successfully!");
    }
}

main()
    .catch((e) => {
        console.error("Error creating admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
