// src/app/api/client/route.ts
import { PrismaClient } from "@/generated/prisma"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, membershipType, startDate, expirationDate } = body

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        membershipType,
        startDate: new Date(startDate),
        expirationDate: new Date(expirationDate),
      },
    })

    return NextResponse.json({ success: true, client })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const clients = await prisma.client.findMany()
    return NextResponse.json({ success: true, clients })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
