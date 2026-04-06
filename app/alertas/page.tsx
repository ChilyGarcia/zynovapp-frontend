"use client"

import NavbarComponent from "@/components/navbar/navbar-component"
import FooterComponent from "@/components/footer/footer-component"
import SidebarComponent from "@/components/sidebar/sidebar-component"

export default function AlertasPage() {
  return (
    <div className="min-h-screen bg-[#eef0f4] flex flex-col">
      <div className="flex flex-1">
        <SidebarComponent />
        <div className="flex-1 flex flex-col min-w-0">
          <NavbarComponent />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900">Alertas</h1>
              <p className="text-gray-600 mt-2">
                Esta sección estará disponible próximamente.
              </p>
            </div>
          </main>
        </div>
      </div>
      <FooterComponent />
    </div>
  )
}
