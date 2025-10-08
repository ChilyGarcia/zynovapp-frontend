import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CreditsDropdown from "./credits-dropdown";
import NotificationsDropdown from "@/components/notifications-dropdown";
import UserDropdown from "./user-dropdown";

export default function NavbarComponent() {
  return (
    <>
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
            <CreditsDropdown credits={330} status="Activos" />

            {/* Notification Dropdown */}
            <NotificationsDropdown />

            {/* User Profile Dropdown */}
            <UserDropdown
              userName="María López"
              userRole="User"
              userImage="/professional-woman-doctor.png"
            />
          </div>
        </div>
      </header>
    </>
  );
}
