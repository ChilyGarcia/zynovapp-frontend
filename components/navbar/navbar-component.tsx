import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import CreditsDropdown from "./credits-dropdown";
import NotificationsDropdown from "@/components/notifications-dropdown";
import UserDropdown from "./user-dropdown";

interface NavbarComponentProps {
  onMenuClick?: () => void;
}

export default function NavbarComponent({ onMenuClick }: NavbarComponentProps) {
  return (
    <>
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between w-full">
          {/* Left Section - Menu Button and Logo */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Section - Search Bar */}
          <div className="flex-1 max-w-2xl mx-1 sm:mx-2 md:mx-4 lg:mx-6">
            <div className="relative w-full">
              <Input
                placeholder="Buscar..."
                className="w-full pr-10 pl-4 bg-gray-100 border-gray-200 rounded-full h-9 sm:h-10 text-sm sm:text-base"
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

          {/* Right Section - Buttons and Dropdowns */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Filtro Button - Hidden on mobile */}
            <div className="hidden sm:block">
              <Button className="bg-[#5B4BDE] hover:opacity-90 text-white rounded-full h-9 sm:h-10 px-3 sm:px-4 md:px-6 text-sm sm:text-base shadow-sm">
                Filtro
              </Button>
            </div>

            {/* Credits Dropdown - Hidden on mobile */}
            <div className="hidden sm:block">
              <CreditsDropdown credits={330} status="Activos" />
            </div>

            {/* Notification Dropdown */}
            <div className="ml-1 sm:ml-0">
              <NotificationsDropdown />
            </div>

            {/* User Profile Dropdown */}
            <div className="ml-1 sm:ml-0">
              <UserDropdown
                userName="María López"
                userRole="User"
                userImage="/professional-woman-doctor.png"
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
