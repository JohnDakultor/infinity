// scripts/nfc-reader.ts
import { NFC, Reader, Card } from 'nfc-pcsc'

import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()
const nfc = new NFC()

nfc.on('reader', (reader: Reader) => {
  console.log(`📶 NFC Reader connected: ${reader.reader.name}`)

  reader.on('card', async (card: Card) => {
    const uid = card.uid
    console.log(`💳 Card detected: ${uid}`)

    try {
      const client = await prisma.client.findUnique({
        where: { cardId: uid },
      })

      if (!client) {
        console.log('❌ Unknown card, no client found.')
        return
      }

      const latest = await prisma.attendance.findFirst({
        where: { clientId: client.id },
        orderBy: { checkIn: 'desc' },
      })

      const now = new Date()

      if (latest && !latest.checkOut) {
        await prisma.attendance.update({
          where: { id: latest.id },
          data: { checkOut: now },
        })
        console.log(`👋 Checked out: ${client.name}`)
      } else {
        await prisma.attendance.create({
          data: {
            clientId: client.id,
            checkIn: now,
          },
        })
        console.log(`✅ Checked in: ${client.name}`)
      }
    } catch (err) {
      console.error('🔥 Error handling card:', err)
    }
  })

  reader.on('error', (err: any) => {
    console.error(`❗ Reader error:`, err)
  })

  reader.on('end', () => {
    console.log(`🔌 Reader disconnected: ${reader.reader.name}`)
  })
})

nfc.on('error', (err: any) => {
  console.error('❗ NFC error:', err)
})
