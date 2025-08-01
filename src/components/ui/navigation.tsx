"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Sun,
  Moon,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/attendance", icon: CalendarDays },
  { label: "Add Client", href: "/client", icon: Users },
]

export default function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // 🛑 Prevents hydration mismatch entirely

  const isDark = theme === "dark"
  const toggleTheme = () => setTheme(isDark ? "light" : "dark")
  const handleLogout = async () => {
  await fetch("/api/logout", { method: "POST" })
  router.push("/") // Redirect to login or home page
}

  return (
    <>
      {/* Topbar */}
      <header className="hidden md:flex items-center justify-between bg-white dark:bg-zinc-900 shadow px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🏋️ Infinity Administrator</h1>
        <div className="flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition hover:bg-gray-100 dark:hover:bg-zinc-800",
                pathname.startsWith(item.href)
                  ? "bg-gray-200 dark:bg-zinc-700 font-semibold"
                  : "text-gray-600 dark:text-gray-300"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:text-red-600">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 shadow border-t dark:border-zinc-700 flex md:hidden justify-around py-2 z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center text-xs",
              pathname.startsWith(item.href)
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800"
            )}
          >
            <item.icon className="w-5 h-5 mb-0.5" />
            {item.label}
          </Link>
        ))}
        <button onClick={toggleTheme} className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300">
          {isDark ? <Sun className="w-5 h-5 mb-0.5" /> : <Moon className="w-5 h-5 mb-0.5" />}
          Mode
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center text-xs text-red-500 hover:text-red-600">
          <LogOut className="w-5 h-5 mb-0.5" />
          Logout
        </button>
      </nav>
    </>
  )
}
