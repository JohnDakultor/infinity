import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json()

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 })
    }

    const client = await prisma.client.findUnique({
      where: { cardId: uid },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const attendance = await prisma.attendance.create({
      data: {
        clientId: client.id,
        checkIn: new Date(),
      },
    })

    return NextResponse.json({
      name: client.name,
      membershipType: client.membershipType,
      startDate: client.startDate,
      expirationDate: client.expirationDate,
      lastVisit: attendance.checkIn,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const logs = await prisma.attendance.findMany({
      orderBy: { checkIn: "desc" },
      take: 20, // latest 20 logs
      include: {
        client: { select: { name: true, contactNumber: true, membershipType: true } }
      }
    })

    return NextResponse.json({ success: true, logs })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Failed to fetch attendance logs" }, { status: 500 })
  }
}
