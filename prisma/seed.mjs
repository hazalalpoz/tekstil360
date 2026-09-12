import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@tekstil360.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: "Platform Admin",
      role: "ADMIN",
    },
  });
  console.log("Admin created:", email, "password: admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
