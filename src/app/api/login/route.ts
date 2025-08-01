import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  (await cookies()).set("auth", "authenticated", { httpOnly: true });

  return NextResponse.json({ message: "Logged in" });
}
