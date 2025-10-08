"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { AIVIAPPModal } from "@/components/aiviapp-modal";
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
import Sidebar from "./sidebar/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("inicio");
  const [isAIVIAPPModalOpen, setIsAIVIAPPModalOpen] = useState(false);

  useEffect(() => {
    const currentPath = pathname.split("/").pop() || "inicio";
    setActiveTab(currentPath);

    // Actualizar el título según la ruta
    const titles: { [key: string]: string } = {
      inicio: "Inicio",
      consultar: "Consultar",
      "mi-historia": "Mi Historia",
      pacientes: "Pacientes",
      chequeos: "Chequeos",
      informes: "Informes",
      alertas: "Alertas",
      pagos: "Pagos y Créditos",
      soporte: "Soporte",
      aiviapp: "AIVIAPP",
    };
  }, [pathname]);

  const handleNavigation = (path: string) => {
    if (path === "aiviapp") {
      setIsAIVIAPPModalOpen(true);
    } else {
      setActiveTab(path);
      router.push(`/${path}`);
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Inicio", icon: <Home className="w-5 h-5" /> },
    {
      id: "consult",
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
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          activeTab={activeTab}
          onNavigation={handleNavigation}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarComponent />
          <main className="flex-1 overflow-y-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
