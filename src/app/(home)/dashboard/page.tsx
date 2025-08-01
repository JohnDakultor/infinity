"use client"

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ["#22c55e", "#ef4444"]

interface Client {
  name: string
  email: string
  startDate: string
  expirationDate: string
  membershipType: string
}

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      const res = await fetch("/api/client")
      const data = await res.json()
      if (data.success) setClients(data.clients)
      setLoading(false)
    }
    fetchClients()
  }, [])

  const now = new Date()

  const totalMembers = clients.length
  const activeMembers = clients.filter(c => new Date(c.expirationDate) > now).length
  const expiredMembers = totalMembers - activeMembers

  const stats = [
    { label: "Total Members", value: totalMembers },
    { label: "Active Memberships", value: activeMembers },
    { label: "Expired Memberships", value: expiredMembers },
    { label: "Monthly Signups", value: getSignupsThisMonth(clients) },
  ]

  const membershipData = [
    { name: "Active", value: activeMembers },
    { name: "Expired", value: expiredMembers },
  ]

  const signupData = getMonthlySignups(clients)

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-white-800">Admin Dashboard</h1>
          <p className="text-white-600">Overview of gym membership data and analytics.</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Membership Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={membershipData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {membershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Monthly Signups</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={signupData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="signups" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Check-ins (static for now) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              <li className="py-2 flex justify-between">
                <span>Coming soon…</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// Utility: Get number of signups in the current month
function getSignupsThisMonth(clients: Client[]) {
  const now = new Date()
  return clients.filter(c => {
    const date = new Date(c.startDate)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
}

// Utility: Get signups per month (last 7 months)
function getMonthlySignups(clients: Client[]) {
  const months = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (6 - i))
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("default", { month: "short" }),
      count: 0,
    }
  })

  clients.forEach(c => {
    const d = new Date(c.startDate)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const month = months.find(m => m.key === key)
    if (month) month.count++
  })

  return months.map(m => ({
    month: m.label,
    signups: m.count,
  }))
}
