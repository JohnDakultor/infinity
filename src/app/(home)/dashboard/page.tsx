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

interface AttendanceDay {
  date: string
  count: number
}

interface AttendanceMonth {
  month: string
  count: number
}

interface AttendanceRecord {
  client: {
    name: string
    email: string
    membershipType: string
  }
  checkIn: string
}

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [attendanceDaily, setAttendanceDaily] = useState<AttendanceDay[]>([])
  const [attendanceMonthly, setAttendanceMonthly] = useState<AttendanceMonth[]>([])
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const resClients = await fetch("/api/client")
      const clientData = await resClients.json()
      if (clientData.success) setClients(clientData.clients)

      const resAttendance = await fetch("/api/attendance/summary")
      const attendanceData = await resAttendance.json()
      if (attendanceData.success) {
        setAttendanceDaily(attendanceData.daily)
        setAttendanceMonthly(attendanceData.monthly)
      }

      const resLogs = await fetch("/api/attendance")
      const logsData = await resLogs.json()
      if (logsData.success) {
        // ✅ Filter logs to only include today
        const today = new Date()
        const todayLogs = logsData.logs.filter((log: AttendanceRecord) => {
          const logDate = new Date(log.checkIn)
          return (
            logDate.getDate() === today.getDate() &&
            logDate.getMonth() === today.getMonth() &&
            logDate.getFullYear() === today.getFullYear()
          )
        })
        setAttendanceLogs(todayLogs)
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const now = new Date()

  const totalMembers = clients.length
  const activeMembers = clients.filter(c => new Date(c.expirationDate) > now).length
  const expiredMembers = totalMembers - activeMembers

  const stats = [
    { label: "Total Members", value: totalMembers, key: "all" },
    { label: "Active Memberships", value: activeMembers, key: "active" },
    { label: "Expired Memberships", value: expiredMembers, key: "expired" },
    { label: "Monthly Signups", value: getSignupsThisMonth(clients), key: "monthly" },
  ]

  const membershipData = [
    { name: "Active", value: activeMembers },
    { name: "Expired", value: expiredMembers },
  ]

  const signupData = getMonthlySignups(clients)

  const filteredClients = (() => {
    if (!filter) return []
    if (filter === "all") return clients
    if (filter === "active") return clients.filter(c => new Date(c.expirationDate) > now)
    if (filter === "expired") return clients.filter(c => new Date(c.expirationDate) <= now)
    if (filter === "monthly") {
      const month = new Date()
      return clients.filter(c => {
        const start = new Date(c.startDate)
        return start.getMonth() === month.getMonth() && start.getFullYear() === month.getFullYear()
      })
    }
    return []
  })()

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-white-800">Admin Dashboard</h1>
          <p className="text-white-600">Overview of gym membership & attendance data.</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setFilter(stat.key)}
            >
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
          {/* Membership Pie */}
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

          {/* Signups Bar */}
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

          {/* Daily Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Daily Attendance (last 7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={attendanceDaily}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Monthly Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={attendanceMonthly}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Logs (Today Only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Attendance Logs (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">No attendance logs for today.</p>
            ) : (
              <ul className="divide-y text-sm">
                {attendanceLogs.map((log, i) => (
                  <li key={i} className="py-2 flex flex-col sm:flex-row sm:justify-between">
                    <div>
                      <p className="font-medium">{log.client.name} ({log.client.email})</p>
                      <p className="text-gray-500 text-xs">
                        Membership: {log.client.membershipType}
                      </p>
                    </div>
                    <span className="text-gray-400">
                      {new Date(log.checkIn).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Filtered Member List */}
        {filter && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                {stats.find(s => s.key === filter)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredClients.length === 0 ? (
                <p className="text-gray-500 text-sm">No members found.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {filteredClients.map((c, i) => {
                    const isExpired = new Date(c.expirationDate) <= now
                    return (
                      <li key={i} className="py-2 flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <p className="font-medium">{c.name} ({c.email})</p>
                          <p className="text-gray-500 text-xs">
                            Start: {new Date(c.startDate).toLocaleDateString()}
                          </p>
                          <p
                            className={`text-xs ${
                              isExpired ? "text-red-500 font-semibold" : "text-gray-500"
                            }`}
                          >
                            Expired: {new Date(c.expirationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-gray-400">{c.membershipType}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
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
