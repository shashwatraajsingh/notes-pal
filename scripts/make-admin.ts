/**
 * Script to make a user admin
 * Run with: npx tsx scripts/make-admin.ts <email>
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAdmin() {
    const email = process.argv[2];

    if (!email) {
        // If no email provided, list all users
        console.log("Usage: npx tsx scripts/make-admin.ts <email>");
        console.log("\n📋 Current users in database:\n");

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        if (users.length === 0) {
            console.log("No users found. Please login to the app first!");
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email}`);
                console.log(`   Name: ${user.name || "N/A"}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   ID: ${user.id}`);
                console.log("");
            });
        }

        await prisma.$disconnect();
        return;
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: "ADMIN" },
        });

        console.log(`✅ Successfully made ${user.email} an ADMIN!`);
        console.log(`   Name: ${user.name}`);
        console.log(`   ID: ${user.id}`);
        console.log("\n🎉 You can now access /studio");
    } catch (error: any) {
        if (error.code === "P2025") {
            console.error(`❌ User with email "${email}" not found.`);
            console.log("\nMake sure you've logged in to the app at least once.");
        } else {
            console.error("Error:", error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

makeAdmin();
