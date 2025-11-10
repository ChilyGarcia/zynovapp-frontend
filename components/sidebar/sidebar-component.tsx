"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href?: string
  active?: boolean
  onClick?: () => void
}

function SidebarItem({ icon, label, href, active = false, onClick }: SidebarItemProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
        active ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  )
}

export default function SidebarComponent() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white/90 backdrop-blur-sm shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src="/icons/zynovapp-icon.png" alt="Zynovapp" className="h-5 w-auto" />
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
          />
          <SidebarItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="Consultar" 
            href="/consultar"
            active={pathname === "/consultar"}
          />
          <SidebarItem 
            icon={<FlaskConical className="w-5 h-5" />} 
            label="Laboratorios" 
            href="/labs"
            active={pathname === "/labs"}
          />
          <SidebarItem 
            icon={<FileText className="w-5 h-5" />} 
            label="Mi Historia" 
            href="/historia"
            active={pathname === "/historia"}
          />
          <SidebarItem 
            icon={<Users className="w-5 h-5" />} 
            label="Pacientes" 
            href="/pacientes"
            active={pathname === "/pacientes"}
          />
          <SidebarItem 
            icon={<Users className="w-5 h-5" />} 
            label="Chequeos" 
            href="/chequeos"
            active={pathname === "/chequeos"}
          />
          <SidebarItem 
            icon={<BarChart3 className="w-5 h-5" />} 
            label="Informes" 
            href="/informes"
            active={pathname === "/informes"}
          />
          <SidebarItem 
            icon={<AlertTriangle className="w-5 h-5" />} 
            label="Alertas" 
            href="/alertas"
            active={pathname === "/alertas"}
          />
          <SidebarItem 
            icon={<CreditCard className="w-5 h-5" />} 
            label="Pagos y Créditos" 
            href="/pagos"
            active={pathname === "/pagos"}
          />
          <SidebarItem 
            icon={<HelpCircle className="w-5 h-5" />} 
            label="Soporte" 
            href="/soporte"
            active={pathname === "/soporte"}
          />
        </nav>
      </div>

      {/* AIVIAPP Button */}
      <div className="p-4">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
          AIVIAPP
        </Button>
      </div>
    </div>
  )
}

