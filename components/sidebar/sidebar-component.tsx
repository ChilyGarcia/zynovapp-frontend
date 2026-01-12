"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { hexToRgba, darkenColor } from "@/lib/color-utils"
import {
  Home,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  CreditCard,
  HelpCircle,
  FlaskConical,
  Settings,
} from "lucide-react"

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href?: string
  active?: boolean
  onClick?: () => void
  activeColor?: string | null
}

function SidebarItem({ icon, label, href, active = false, onClick, activeColor }: SidebarItemProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }

  // Estilos inline para el color del laboratorio usando rgba correctamente
  const activeStyle = active && activeColor ? {
    backgroundColor: hexToRgba(activeColor, 0.15),
    color: activeColor,
  } : undefined

  // Clases base
  const baseClasses = "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer"
  const inactiveClasses = !active ? "text-gray-600 hover:bg-gray-50 hover:text-gray-900" : ""
  const activeClasses = active ? "font-medium" : ""

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${inactiveClasses} ${activeClasses}`}
      style={activeStyle}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  )
}

export default function SidebarComponent() {
  const pathname = usePathname()
  const { laboratoryColor, laboratoryLogo } = useAuth()

  // Color por defecto si no hay color del laboratorio
  const defaultColor = "#6366F1" // purple-500
  const activeColor = laboratoryColor || defaultColor

  return (
    <div className="w-64 bg-white/90 backdrop-blur-sm shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {laboratoryLogo ? (
            <img 
              src={laboratoryLogo} 
              alt="Logo del Laboratorio" 
              className="h-8 w-auto object-contain" 
              onError={(e) => {
                // Si falla la carga del logo, usar el logo por defecto
                const target = e.target as HTMLImageElement
                target.src = "/icons/zynovapp-icon.png"
              }}
            />
          ) : (
            <img src="/icons/zynovapp-icon.png" alt="Zynovapp" className="h-5 w-auto" />
          )}
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          <SidebarItem 
            icon={<Home className="w-5 h-5" />} 
            label="Inicio" 
            href="/dashboard"
            active={pathname === "/dashboard"}
            activeColor={activeColor}
          />
          <SidebarItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="Consultar" 
            href="/consultar"
            active={pathname === "/consultar"}
            activeColor={activeColor}
          />
          <SidebarItem 
            icon={<FlaskConical className="w-5 h-5" />} 
            label="Laboratorios" 
            href="/labs"
            active={pathname === "/labs"}
            activeColor={activeColor}
          />
          <SidebarItem 
            icon={<Settings className="w-5 h-5" />} 
            label="Configuración" 
            href="/admin/examenes"
            active={pathname === "/admin/examenes"}
            activeColor={activeColor}
          />
          <SidebarItem 
            icon={<FileText className="w-5 h-5" />} 
            label="Mi Historia" 
            href="/historia"
            active={pathname === "/historia"}
            activeColor={activeColor}
          />
          <SidebarItem 
            icon={<Users className="w-5 h-5" />} 
            label="Pacientes" 
            href="/pacientes"
            active={pathname === "/pacientes"}
            activeColor={activeColor}
          />
          <SidebarItem 
            icon={<Users className="w-5 h-5" />} 
            label="Chequeos" 
            href="/chequeos"
            active={pathname === "/chequeos"}
            activeColor={activeColor}
          />
          <SidebarItem 
            icon={<BarChart3 className="w-5 h-5" />} 
            label="Informes" 
            href="/informes"
            active={pathname === "/informes"}
            activeColor={activeColor}
          />
          <SidebarItem 
            icon={<AlertTriangle className="w-5 h-5" />} 
            label="Alertas" 
            href="/alertas"
            active={pathname === "/alertas"}
            activeColor={activeColor}
          />
          <SidebarItem 
            icon={<CreditCard className="w-5 h-5" />} 
            label="Pagos y Créditos" 
            href="/pagos"
            active={pathname === "/pagos"}
            activeColor={activeColor}
          />
          <SidebarItem 
            icon={<HelpCircle className="w-5 h-5" />} 
            label="Soporte" 
            href="/soporte"
            active={pathname === "/soporte"}
            activeColor={activeColor}
          />
        </nav>
      </div>

      {/* Logo del Laboratorio */}
      {laboratoryLogo && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-center p-3 rounded-lg bg-gray-50">
            <img 
              src={laboratoryLogo} 
              alt="Logo del Laboratorio" 
              className="h-12 w-auto object-contain max-w-full" 
              onError={(e) => {
                // Si falla la carga del logo, ocultar el contenedor
                const target = e.target as HTMLImageElement
                target.style.display = "none"
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}



