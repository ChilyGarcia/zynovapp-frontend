"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  ClipboardList,
  FlaskConical,
  Users,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
}

function SidebarItem({ icon, label, href, active = false }: SidebarItemProps) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer text-sm",
        active
          ? "bg-white/10 text-[#e9d5ff] font-medium shadow-sm ring-1 ring-white/10"
          : "text-[#c4b5fd]/90 hover:bg-white/5 hover:text-white"
      )}
    >
      <span className={cn("shrink-0", active && "text-[#f5f3ff]")}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

const navItems: { label: string; href: string; icon: typeof LayoutDashboard }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Órdenes Médicas", href: "/ordenes-medicas", icon: ClipboardList },
  { label: "Inventario Muestras", href: "/inventario-muestras", icon: FlaskConical },
  { label: "Pacientes", href: "/consultar", icon: Users },
  { label: "Reportes", href: "/reportes", icon: BarChart3 },
  { label: "Alertas", href: "/alertas", icon: Bell },
  { label: "Configuración", href: "/configuracion", icon: Settings },
]

function pathMatches(pathname: string, href: string) {
  if (href === "/admin/examenes") return pathname.startsWith("/admin/examenes")
  if (href === "/inventario-muestras")
    return pathname.startsWith("/inventario-muestras")
  return pathname === href
}

export default function SidebarComponent() {
  const pathname = usePathname()
  const { laboratoryLogo } = useAuth()

  return (
    <div className="w-64 shrink-0 bg-[#1e0f33] flex flex-col min-h-screen border-r border-violet-950/50">
      <div className="p-6 border-b border-violet-900/40">
        <div className="flex items-center justify-center">
          <img
            src="/icons/viannis.jpg"
            alt="Logo"
            className="h-20 w-auto object-contain max-w-full rounded-lg opacity-95"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/icons/zynovapp-icon.png"
              target.className = "h-8 w-auto"
            }}
          />
        </div>
      </div>

      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathMatches(pathname, item.href)

            return (
              <SidebarItem
                key={item.label}
                icon={<Icon className="w-5 h-5" strokeWidth={2} />}
                label={item.label}
                href={item.href}
                active={active}
              />
            )
          })}
        </nav>
      </div>

      {laboratoryLogo && (
        <div className="p-4 border-t border-violet-900/40">
          <div className="flex items-center justify-center p-3 rounded-xl bg-violet-950/50 ring-1 ring-violet-800/30">
            <img
              src={laboratoryLogo}
              alt="Logo del laboratorio"
              className="h-10 w-auto object-contain max-w-full"
              onError={(e) => {
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
