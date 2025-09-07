"use client"

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

const COLORS = ["#22c55e", "#ef4444"]

interface Client {
  id: string
  name: string
  contactNumber: string
  startDate: string
  expirationDate: string
  membershipType: string
  isFrozen?: boolean
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
    contactNumber: string
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
  const activeMembers = clients.filter((c) => new Date(c.expirationDate) > now).length
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
    if (filter === "active") return clients.filter((c) => new Date(c.expirationDate) > now)
    if (filter === "expired") return clients.filter((c) => new Date(c.expirationDate) <= now)
    if (filter === "monthly") {
      const month = new Date()
      return clients.filter((c) => {
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
                      <p className="font-medium">
                        {log.client.name} ({log.client.contactNumber})
                      </p>
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
                {stats.find((s) => s.key === filter)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredClients.length === 0 ? (
                <p className="text-gray-500 text-sm">No members found.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {filteredClients.map((c, i) => (
                    <ClientRow key={i} client={c} now={now} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

function ClientRow({ client, now }: { client: Client; now: Date }) {
  const [open, setOpen] = useState(false)
  const [localClient, setLocalClient] = useState(client)
  const isExpired = new Date(client.expirationDate) <= now

  const toggleFreeze = async () => {
    try {
      const res = await fetch(`/api/client/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFrozen: !localClient.isFrozen }),
      })
      const data = await res.json()
      if (data.success) {
        setLocalClient({ ...localClient, isFrozen: data.client.isFrozen })
      } else {
        alert("Error: " + data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong.")
    }
  }

  return (
    <li className="py-2">
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
        onClick={() => setOpen(!open)}
      >
        <div>
          <p className="font-medium">
            {localClient.name} ({localClient.contactNumber})
          </p>
          <p className="text-gray-500 text-xs">
            Start: {new Date(localClient.startDate).toLocaleDateString()}
          </p>
          <p
            className={`text-xs ${
              isExpired ? "text-red-500 font-semibold" : "text-gray-500"
            }`}
          >
            Expired: {new Date(localClient.expirationDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{localClient.membershipType}</span>
          {isExpired && <RenewDialog client={localClient} />}
        </div>
      </div>

      {/* Expanded details for active members */}
      <AnimatePresence>
        {open && !isExpired && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 pl-4 border-l border-gray-200 space-y-2 overflow-hidden"
          >
            <p className="text-xs text-gray-500">
              Status: {localClient.isFrozen ? "❄️ Frozen" : "✅ Active"}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={toggleFreeze}
            >
              {localClient.isFrozen ? "Unfreeze" : "Freeze"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

// Utility: Get number of signups in the current month
function getSignupsThisMonth(clients: Client[]) {
  const now = new Date()
  return clients.filter((c) => {
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

  clients.forEach((c) => {
    const d = new Date(c.startDate)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const month = months.find((m) => m.key === key)
    if (month) month.count++
  })

  return months.map((m) => ({
    month: m.label,
    signups: m.count,
  }))
}

function RenewDialog({ client }: { client: Client }) {
  const [expirationDate, setExpirationDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [membershipType, setMembershipType] = useState(client.membershipType)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/client/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expirationDate, membershipType }),
      })

      const data = await res.json()
      if (data.success) {
        alert("Membership renewed successfully!")
      } else {
        alert("Failed to renew membership: " + data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs">
          Renew
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renew Membership</DialogTitle>
          <DialogDescription>
            Update the membership for <strong>{client.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            New Expiration Date:
            <input
              type="date"
              className="border rounded w-full p-1 text-sm mt-1"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Membership Type:
            <input
              type="text"
              className="border rounded w-full p-1 text-sm mt-1"
              value={membershipType}
              onChange={(e) => setMembershipType(e.target.value)}
            />
          </label>

          <DialogFooter>
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
