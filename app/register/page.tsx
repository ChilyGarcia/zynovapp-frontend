"use client"

import { useRouter } from "next/navigation"
import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  const router = useRouter()

  const handleRegister = () => {
    // Handle successful registration
    // You can add your registration logic here
    console.log("Registration successful")
    router.push("/dashboard")
  }

  const handleLoginClick = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3F00A8] via-[#5B4BDE] to-[#5AA0FF] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-white">
          <img src="/icons/zynovapp-icon-login.png" alt="Zynovapp" className="h-8 w-auto" />
        </div>
      </div>

      {/* Register Form */}
      <RegisterForm 
        onRegister={handleRegister}
        onLoginClick={handleLoginClick}
      />
    </div>
  )
}
