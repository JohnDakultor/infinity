import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  const email = "infinity@gmail.com";
  const password = "admin123";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json({ message: "User already exists" }, { status: 200 });
  }

  const hashed = await hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
    },
  });

  return NextResponse.json({ message: "Seeded admin user" });
}
