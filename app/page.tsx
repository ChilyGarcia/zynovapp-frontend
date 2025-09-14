"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  const router = useRouter()

  const handleLogin = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3F00A8] via-[#5B4BDE] to-[#5AA0FF] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-white">
          <img src="/icons/zynovapp-icon-login.png" alt="Zynovapp" className="h-8 w-auto" />
        </div>
      </div>

      {/* Login Form */}
      <LoginForm onLogin={handleLogin} />
    </div>
  )
}
