import Navigation from "@/components/ui/navigation"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const session = (await cookies()).get("auth")

  if (!session) return redirect("/")
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-100 text-gray-900 dark:bg-zinc-900 dark:text-gray-100 pb-16 md:pb-0">
        {children}
      </main>
    </>
  )
}
