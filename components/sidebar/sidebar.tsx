'use client';

import { Button } from "@/components/ui/button";
import { AIVIAPPModal } from "@/components/aiviapp-modal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SidebarItem from "@/components/sidebar/sidebar-item";

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  activeTab: string;
  onNavigation: (id: string) => void;
}

export default function Sidebar({ menuItems, activeTab, onNavigation }: SidebarProps) {
  const [isAIVIAPPModalOpen, setIsAIVIAPPModalOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (id: string) => {
    if (id === 'aiviapp') {
      setIsAIVIAPPModalOpen(true);
    } else {
      onNavigation(id);
    }
  };

  return (
    <div className="w-64 bg-white/90 backdrop-blur-sm shadow-sm border-r border-gray-200 flex flex-col">
      <div className="py-6 border-b border-gray-100 flex justify-center">
        <div className="w-full px-8">
          <img
            src="/icons/zynovapp-icon.png"
            alt="Zynovapp"
            className="h-8 w-auto mx-auto object-contain"
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
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
          onClick={() => handleNavigation("aiviapp")}
        >
          AIVIAPP
        </Button>
      </div>

      {/* AIVIAPP Modal */}
      <AIVIAPPModal
        isOpen={isAIVIAPPModalOpen}
        onClose={() => setIsAIVIAPPModalOpen(false)}
      />
    </div>
  );
}
