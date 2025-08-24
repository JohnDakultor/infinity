import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // ✅ Group attendance per day
    const daily = await prisma.$queryRaw<
      { day: string; total: number }[]
    >`
      SELECT 
        DATE("checkIn") AS day,
        COUNT(DISTINCT "clientId")::int AS total
      FROM "Attendance"
      GROUP BY DATE("checkIn")
      ORDER BY day DESC
      LIMIT 7
    `

    // ✅ Group attendance per month
    const monthly = await prisma.$queryRaw<
      { month: string; total: number }[]
    >`
      SELECT 
        TO_CHAR("checkIn", 'YYYY-MM') AS month,
        COUNT(DISTINCT "clientId")::int AS total
      FROM "Attendance"
      GROUP BY TO_CHAR("checkIn", 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `

    return NextResponse.json({
      success: true,
      daily: daily.map(d => ({ date: d.day, count: d.total })),
      monthly: monthly.map(m => ({ month: m.month, count: m.total })),
    })
  } catch (err) {
    console.error("❌ Summary error:", err)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
