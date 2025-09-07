"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddClientPage() {
  const [form, setForm] = useState({
    name: "",
    contactNumber: "",
    membershipType: "",
    startDate: "",
    expirationDate: "",
    cardId: "", // ✅ new field
  })

  // 🔌 Connect to WebSocket for NFC
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:4000")

    socket.onopen = () => console.log("✅ WS connected (Add Client)")
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.uid) {
          console.log("📡 NFC UID received:", data.uid)
          setForm((prev) => ({ ...prev, cardId: data.uid })) // auto-fill cardId
        }
      } catch (err) {
        console.warn("❗ Non-JSON message:", event.data)
      }
    }

    return () => socket.close()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSelect = (value: string) => {
    setForm({ ...form, membershipType: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (data.success) {
        alert("✅ Client added successfully with NFC card")
        setForm({
          name: "",
          contactNumber: "",
          membershipType: "",
          startDate: "",
          expirationDate: "",
          cardId: "",
        })
      } else {
        alert("❌ " + (data.error || "Email must be unique"))
      }
    } catch (err) {
      alert("Failed to submit")
      console.error(err)
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Add New Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  type="number"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="0987654321"
                  required
                />
              </div>

              <div>
                <Label>Membership Type</Label>
                <Select onValueChange={handleSelect} value={form.membershipType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    name="expirationDate"
                    type="date"
                    value={form.expirationDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* ✅ NFC Card ID auto-filled */}
              <div>
                <Label htmlFor="cardId">NFC Card</Label>
                <Input
                  id="cardId"
                  name="cardId"
                  value={form.cardId}
                  readOnly
                  placeholder="Tap card to auto-fill"
                  
                />
              </div>

              <Button type="submit" className="w-full mt-4">
                Add Member
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
