/**
 * Admin User Seed Script
 *
 * Usage:
 *   npx tsx prisma/seed-admin.ts +237XXXXXXXXX
 *
 * This script promotes an existing user to ADMIN role by phone number.
 * If the user doesn't exist, it creates a new admin user with default password "admin123".
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const phone = process.argv[2];

  if (!phone) {
    console.error("Usage: npx tsx prisma/seed-admin.ts +237XXXXXXXXX");
    process.exit(1);
  }

  // Normalize phone
  const cleaned = phone.replace(/\D/g, "");
  const normalized = cleaned.startsWith("237")
    ? `+${cleaned}`
    : `+237${cleaned}`;

  console.log(`Looking for user with phone: ${normalized}`);

  const existing = await prisma.user.findUnique({
    where: { phone: normalized },
  });

  if (existing) {
    if (existing.role === "ADMIN" || existing.role === "SUPER_ADMIN") {
      console.log(`User ${normalized} is already ${existing.role}.`);
      return;
    }

    await prisma.user.update({
      where: { phone: normalized },
      data: { role: "ADMIN" },
    });

    console.log(
      `Promoted ${existing.firstName} ${existing.lastName} (${normalized}) to ADMIN.`
    );
  } else {
    const passwordHash = await bcrypt.hash("admin123", 12);

    const user = await prisma.user.create({
      data: {
        phone: normalized,
        passwordHash,
        firstName: "Admin",
        lastName: "Alpha-Drivers",
        role: "ADMIN",
        isVerified: true,
        isActive: true,
      },
    });

    console.log(
      `Created new admin user: ${user.firstName} ${user.lastName} (${normalized})`
    );
    console.log(`Default password: admin123 — change it immediately!`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
