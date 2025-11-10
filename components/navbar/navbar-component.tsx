"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const { user, logout } = useAuth()
  const router = useRouter()

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

  // Función para ir a configuración (placeholder por ahora)
  const handleSettings = () => {
    // TODO: Implementar página de configuración
    console.log("Ir a configuración")
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

          {/* Center Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button className="bg-[#5B4BDE] hover:opacity-90 text-white rounded-full h-10 px-6 shadow-sm">
              Filtro
            </Button>
            {/* Credits Button */}
            <Button className="bg-gradient-to-r from-[#6A00F4] via-[#9B5DE5] to-[#F15BB5] hover:opacity-90 text-white rounded-full h-10 px-4 flex items-center gap-2 shadow-sm">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
              <span className="text-sm font-medium">330 Créditos</span>
              <span className="text-[10px] uppercase bg-white/20 px-2 py-0.5 rounded-full">
                Activos
              </span>
            </Button>

            {/* Notification Bell */}
            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
              <span className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-indigo-500 opacity-20 rounded-full" />
              <Bell className="w-5 h-5 relative" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-white"></div>
            </button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/professional-woman-doctor.png" />
                    <AvatarFallback>{user ? getInitials(user.name) : "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name || "Usuario"}
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
