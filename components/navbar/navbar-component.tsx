"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
export default function NavbarComponent() {
  const { user, logout, laboratoryColor, laboratoryLogo } = useAuth()
  const router = useRouter()
  const [imageKey, setImageKey] = useState(Date.now())
  
  // Forzar actualización de la imagen cuando cambie el usuario
  useEffect(() => {
    setImageKey(Date.now())
  }, [user?.profile_picture_url, user?.updated_at])

  // Color por defecto si no hay color del laboratorio
  const defaultColor = "#5B4BDE" // purple-500
  const activeColor = laboratoryColor || defaultColor

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Función para obtener el rol en español
  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      patient: "Paciente",
      laboratory: "Laboratorio"
    }
    return roles[role] || role
  }

  // Función para cerrar sesión
  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // Función para ir a configuración
  const handleSettings = () => {
    router.push("/configuracion")
  }

  return (
    <>
      {" "}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Input
                placeholder="Buscador"
                className="pr-10 pl-4 bg-gray-100 border-gray-200 rounded-full h-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notification Bell */}
            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
              <span 
                className="absolute -inset-1 opacity-20 rounded-full"
                style={{
                  background: `linear-gradient(to top right, ${activeColor}, ${activeColor})`,
                }}
              />
              <Bell className="w-5 h-5 relative" />
              <div 
                className="absolute top-0 right-0 w-2 h-2 rounded-full ring-2 ring-white"
                style={{ backgroundColor: activeColor }}
              ></div>
            </button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                  <Avatar className="w-10 h-10 border-2" style={{ borderColor: activeColor + "40" }}>
                    {/* Prioridad: 1. Foto de perfil del usuario, 2. Logo del laboratorio (solo si es laboratorio), 3. Imagen por defecto */}
                    {user?.profile_picture_url ? (
                      <AvatarImage 
                        key={imageKey}
                        src={`${user.profile_picture_url}?t=${imageKey}`}
                        alt={user?.name || "Usuario"}
                        className="object-cover"
                        onError={(e) => {
                          // Si falla la carga, intentar con el logo del laboratorio o fallback
                          const target = e.target as HTMLImageElement
                          if (user?.role === "laboratory" && laboratoryLogo) {
                            target.src = `${laboratoryLogo}?t=${imageKey}`
                          } else {
                            target.src = "/professional-woman-doctor.png"
                          }
                        }}
                      />
                    ) : user?.role === "laboratory" && laboratoryLogo ? (
                      <AvatarImage 
                        key={imageKey}
                        src={`${laboratoryLogo}?t=${imageKey}`}
                        alt={user?.name || "Usuario"}
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/professional-woman-doctor.png"
                        }}
                      />
                    ) : (
                      <AvatarImage 
                        src="/professional-woman-doctor.png" 
                        alt={user?.name || "Usuario"}
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = ""
                        }}
                      />
                    )}
                    <AvatarFallback 
                      className="text-sm font-semibold"
                      style={{ 
                        backgroundColor: activeColor + "20",
                        color: activeColor 
                      }}
                    >
                      {user ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.role === "laboratory" && user?.laboratory?.name 
                        ? user.laboratory.name 
                        : user?.name || "Usuario"}
                    </span>
                    <span className="text-xs text-gray-500">{user ? getRoleLabel(user.role) : "User"}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
