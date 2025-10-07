"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import NavbarComponent from "./navbar/navbar-component";

interface AppLayoutProps {
  children: React.ReactNode;
}

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        active
          ? "bg-purple-50 text-purple-700"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </button>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(
    pathname.split("/").pop() || "inicio"
  );

  const handleNavigation = (path: string) => {
    setActiveTab(path);
    router.push(`/${path}`);
  };

  const menuItems = [
    { id: "inicio", label: "Inicio", icon: <Home className="w-5 h-5" /> },
    {
      id: "consultar",
      label: "Consultar",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: "mi-historia",
      label: "Mi Historia",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "pacientes",
      label: "Pacientes",
      icon: <Users className="w-5 h-5" />,
    },
    { id: "chequeos", label: "Chequeos", icon: <Users className="w-5 h-5" /> },
    {
      id: "informes",
      label: "Informes",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "alertas",
      label: "Alertas",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      id: "pagos",
      label: "Pagos y Créditos",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "soporte",
      label: "Soporte",
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white/90 backdrop-blur-sm shadow-sm border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <img
                src="/icons/zynovapp-icon.png"
                alt="Zynovapp"
                className="h-5 w-auto"
              />
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="space-y-1 px-3">
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.id}
                  onClick={() => handleNavigation(item.id)}
                />
              ))}
            </nav>
          </div>

          {/* AIVIAPP Button */}
          <div className="p-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
              AIVIAPP
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarComponent />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
