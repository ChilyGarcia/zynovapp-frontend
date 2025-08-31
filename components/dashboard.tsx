"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Home,
  FileText,
  Users,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { CategoriesGrid } from "@/components/categories/categories-grid";
import FooterComponent from "./footer/footer-component";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [chatMessage, setChatMessage] = useState("");

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Handle message sending logic here
      setChatMessage("");
    }
  };

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
          <div className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              <SidebarItem
                icon={<Home className="w-5 h-5" />}
                label="Inicio"
                active={activeTab === "inicio"}
                onClick={() => setActiveTab("inicio")}
              />
              <SidebarItem
                icon={<MessageSquare className="w-5 h-5" />}
                label="Consultar"
                active={activeTab === "consultar"}
                onClick={() => setActiveTab("consultar")}
              />
              <SidebarItem
                icon={<FileText className="w-5 h-5" />}
                label="Mi Historia"
                active={activeTab === "mi-historia"}
                onClick={() => setActiveTab("mi-historia")}
              />
              <SidebarItem
                icon={<Users className="w-5 h-5" />}
                label="Pacientes"
                active={activeTab === "pacientes"}
                onClick={() => setActiveTab("pacientes")}
              />
              <SidebarItem
                icon={<Users className="w-5 h-5" />}
                label="Chequeos"
                active={activeTab === "chequeos"}
                onClick={() => setActiveTab("chequeos")}
              />
              <SidebarItem
                icon={<BarChart3 className="w-5 h-5" />}
                label="Informes"
                active={activeTab === "informes"}
                onClick={() => setActiveTab("informes")}
              />
              <SidebarItem
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Alertas"
                active={activeTab === "alertas"}
                onClick={() => setActiveTab("alertas")}
              />
              <SidebarItem
                icon={<CreditCard className="w-5 h-5" />}
                label="Pagos y Créditos"
                active={activeTab === "pagos"}
                onClick={() => setActiveTab("pagos")}
              />
              <SidebarItem
                icon={<HelpCircle className="w-5 h-5" />}
                label="Soporte"
                active={activeTab === "soporte"}
                onClick={() => setActiveTab("soporte")}
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 max-w-lg mx-8">
                <div className="relative">
                  <Input placeholder="Buscador" className="pr-10 pl-4 bg-gray-100 border-gray-200 rounded-full h-10" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                  <span className="text-sm font-medium">330 Créditos</span>
                  <span className="text-[10px] uppercase bg-white/20 px-2 py-0.5 rounded-full">Activos</span>
                </Button>

                {/* Notification Bell */}
                <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                  <span className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-indigo-500 opacity-20 rounded-full" />
                  <Bell className="w-5 h-5 relative" />
                  <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-white"></div>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/professional-woman-doctor.png" />
                    <AvatarFallback>ML</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      María López
                    </span>
                    <span className="text-xs text-gray-500">User</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Hola María Lopez,
                </h1>
                <p className="text-gray-600">¡Bienvenido de nuevo!</p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Categorias
                </h2>
                <CategoriesGrid />
              </div>

              {/* Quick Consultation and Right Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Quick Consultation */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <Card className="h-96">
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Consulta Rápida
                        </h3>
                        <div className="text-right">
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Nueva Consulta
                          </Button>
                          <p className="text-xs text-gray-500 mt-1">Gratuito</p>
                        </div>
                      </div>

                      {/* Historial Section */}
                      <div className="px-4 py-3 border-b bg-gray-50">
                        <div className="flex items-center gap-2 text-gray-500">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm">Historial</span>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="bg-gray-200 text-gray-900 rounded-2xl px-4 py-3 max-w-sm">
                            <p className="text-sm leading-relaxed">
                              Me duele la garganta desde hace dos días y tengo
                              fiebre y dificultad para tragar. ¿Qué me
                              recomiendas?
                            </p>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="text-gray-900 max-w-lg">
                            <p className="text-sm mb-3 leading-relaxed">
                              <strong>¡Hola!</strong> Podría tratarse de una
                              infección. En caso de tener dolor e inflamación
                              puedes tomar medicamentos anti-inflamatorios no
                              esteroideos, y recuerda verificar que estos no
                              contengan ningún componente que pueda resultar
                              alérgeno para ti.
                            </p>
                            <p className="text-sm mb-4 leading-relaxed">
                              Te recomiendo ver a un médico para una evaluación
                              completa. Mientras tanto, mantente hidratado y
                              evita alimentos irritantes.
                            </p>

                            <div className="flex items-center gap-3 mt-3">
                              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 6v4m-5 8h2.5a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002-2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L9 18v-4m-5-8h-2.5a2 2 0 00-2 2v8a2 2 0 002 2H10a2 2 0 002-2V8a2 2 0 00-2-2z"
                                  />
                                </svg>
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t bg-white">
                        <div className="flex gap-3">
                          <Input
                            placeholder="Cuéntame de tu caso en un único mensaje"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleSendMessage()
                            }
                            className="flex-1 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                          <Button
                            onClick={handleSendMessage}
                            size="sm"
                            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.414 0l4-4z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Banner Promocional: solo imagen dentro de la card */}
                  <Card className="overflow-hidden p-0">
                    <CardContent className="p-0">
                      <div
                        className="w-full h-56 sm:h-64 md:h-72 bg-center bg-cover"
                        style={{
                          backgroundImage: "url('/images/promotional.png')",
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Analytics and Statistics Widget */}
                <div className="space-y-6">
                  <Card className="rounded-2xl border border-purple-100 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">
                          Análisis y Estadísticas
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Evolución del estado de salud
                      </p>

                      {/* Chart Area */}
                      <div className="relative h-40 bg-gray-50 rounded-xl mb-4 border border-gray-100">
                        {/* Y-axis labels */}
                        <div className="absolute left-2 top-0 h-full flex flex-col justify-between text-[11px] text-gray-500 py-4">
                          <span>Óptimo</span>
                          <span>Medio</span>
                          <span>Alto</span>
                          <span>Bajo</span>
                          <span>Crítico</span>
                        </div>

                        {/* Chart SVG */}
                        <div className="ml-12 h-full relative">
                          <svg
                            className="w-full h-full"
                            viewBox="0 0 280 120"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <linearGradient
                                id="healthGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#10B981"
                                  stopOpacity="0.3"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#10B981"
                                  stopOpacity="0.1"
                                />
                              </linearGradient>
                              <linearGradient
                                id="lineGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#F59E0B" />
                                <stop offset="50%" stopColor="#84CC16" />
                                <stop offset="100%" stopColor="#10B981" />
                              </linearGradient>
                            </defs>
                            {/* Area under curve */}
                            <path
                              d="M 20 80 Q 80 60 140 50 T 260 30 L 260 100 L 20 100 Z"
                              fill="url(#healthGradient)"
                            />
                            {/* Trend line */}
                            <path
                              d="M 20 80 Q 80 60 140 50 T 260 30"
                              fill="none"
                              stroke="url(#lineGradient)"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            {/* baseline grid */}
                            <g stroke="#E5E7EB" strokeWidth="1">
                              <line x1="20" y1="20" x2="260" y2="20" />
                              <line x1="20" y1="40" x2="260" y2="40" />
                              <line x1="20" y1="60" x2="260" y2="60" />
                              <line x1="20" y1="80" x2="260" y2="80" />
                              <line x1="20" y1="100" x2="260" y2="100" />
                            </g>
                          </svg>
                        </div>

                        {/* X-axis labels */}
                        <div className="absolute bottom-2 left-12 right-4 flex justify-between text-xs text-gray-500">
                          <span>30 jun</span>
                          <span>10 jul</span>
                          <span>30 jul</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 text-center mb-4">
                        Tiempo (tratamiento)
                      </p>

                      {/* Indicators */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="text-xs font-medium text-gray-700">
                              Patrón detectado
                            </p>
                            <p className="text-xs text-gray-500">
                              Caída cada lunes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="text-xs font-medium text-gray-700">
                              Sugerencia
                            </p>
                            <p className="text-xs text-gray-500">
                              Aumenta la hidratación, patrón de fatiga detectado
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Ver más button */}
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-4 py-1"
                        >
                          Ver más
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alerts and Control Widget */}
                  <Card className="rounded-2xl border border-purple-100 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <h3 className="font-semibold text-gray-900">
                            Alertas y Control
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-600">Próxima sesión</span>
                          <span className="text-gray-500">vie, 22 ago</span>
                        </div>
                      </div>

                      {/* Calendar */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">
                            Agosto 2025
                          </h4>
                          <div className="flex gap-1">
                            <ChevronLeft className="w-4 h-4 text-gray-400 cursor-pointer" />
                            <ChevronRight className="w-4 h-4 text-gray-400 cursor-pointer" />
                          </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-xs">
                          {/* Days of week */}
                          {[
                            "dom",
                            "lun",
                            "mar",
                            "mie",
                            "jue",
                            "vie",
                            "sáb",
                          ].map((day) => (
                            <div
                              key={day}
                              className="text-center text-gray-500 font-medium py-1"
                            >
                              {day}
                            </div>
                          ))}

                          {/* Previous month days */}
                          <div className="text-center py-1 text-gray-300">
                            27
                          </div>
                          <div className="text-center py-1 text-gray-300">
                            28
                          </div>
                          <div className="text-center py-1 text-gray-300">
                            29
                          </div>
                          <div className="text-center py-1 text-gray-300">
                            30
                          </div>
                          <div className="text-center py-1 text-gray-300">
                            31
                          </div>

                          {/* Current month days */}
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            01
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            02
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            03
                          </div>
                          <div className="text-center py-1 bg-purple-600 text-white rounded-lg cursor-pointer shadow-sm">
                            04
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            05
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            06
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            07
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            08
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            09
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            10
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            11
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            12
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            13
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            14
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            15
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            16
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            17
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            18
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            19
                          </div>
                          <div className="text-center py-1 bg-purple-600 text-white rounded-lg cursor-pointer shadow-sm">
                            20
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            21
                          </div>
                          <div className="text-center py-1 bg-purple-600 text-white rounded-lg cursor-pointer shadow-sm">
                            22
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            23
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            24
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            25
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            26
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            27
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            28
                          </div>
                          <div className="text-center py-1 bg-purple-600 text-white rounded-lg cursor-pointer shadow-sm">
                            29
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            30
                          </div>
                          <div className="text-center py-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded">
                            31
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification Widget */}
                  <Card className="rounded-2xl border border-purple-100 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">
                            Notificación
                          </h3>
                        </div>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1"
                        >
                          Ver todas
                        </Button>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              Estado de Salud
                            </h4>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">
                                Actualizado
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed mb-2">
                            Tu último chequeo muestra una condición estable.
                            Recuerda programar tu próxima cita de control.
                          </p>
                          <p className="text-xs text-gray-400">Hace 3 días</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <FooterComponent />
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
        active
          ? "bg-purple-100 text-purple-700 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
