import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"

const prisma = new PrismaClient()

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const { membershipType, expirationDate, isFrozen } = body

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(membershipType && { membershipType }),
        ...(expirationDate && { expirationDate: new Date(expirationDate) }),
        ...(typeof isFrozen === "boolean" && { isFrozen }),
      },
    })

    return NextResponse.json({ success: true, client })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

