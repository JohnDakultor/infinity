"use client"

import { useEffect, useState } from "react"

interface MemberData {
  uid?: string
  name: string
  membershipType: string
  startDate: string
  expirationDate: string
  lastVisit: string
}

export default function NFCLive() {
  const [member, setMember] = useState<MemberData | null>(null)

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:4000")

    socket.onopen = () => console.log("✅ WebSocket connected")

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("📡 WebSocket received:", data, typeof data.uid)

        setMember(data)
      } catch (err) {
        console.warn("❗ Non-JSON message received:", event.data)
      }
    }

    socket.onerror = (event) => {
      console.error("❌ WebSocket error", event)
    }

    socket.onclose = () => console.warn("⚠️ WebSocket disconnected")

    return () => socket.close()
  }, [])

  return (
    <div className="p-4">
      {member ? (
  <div className="bg-green-100 p-4 rounded shadow dark:bg-green-300 text-black">
    <p>🆔 UID: {member.uid ?? "Unknown"}</p>
    {member.name && <p>👤 Name: {member.name}</p>}
    {member.membershipType && <p>🎟️ Membership: {member.membershipType}</p>}
    {member.startDate && <p>📅 Start: {member.startDate}</p>}
    {member.expirationDate && <p>📆 Expiry: {member.expirationDate}</p>}
    {member.lastVisit && <p>🕒 Last Visit: {member.lastVisit}</p>}
  </div>
) : (
  <p className="text-gray-500">Waiting for NFC scan...</p>
)}

      {/* DEBUG BLOCK - REMOVE THIS IN PRODUCTION */}
      <pre className="mt-4 bg-black text-green-400 p-2 text-xs overflow-x-auto rounded">
        {JSON.stringify(member, null, 2)}
      </pre>
    </div>
  )
}
