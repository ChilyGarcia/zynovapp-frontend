"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  FlaskConical,
  Users,
  Clock,
  AlertTriangle,
  Info,
  ThermometerSun,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FooterComponent from "./footer/footer-component";
import NavbarComponent from "./navbar/navbar-component";
import SidebarComponent from "./sidebar/sidebar-component";

const metrics = [
  {
    label: "Órdenes Hoy",
    value: "24",
    trend: "+12%",
    positive: true,
    icon: ClipboardList,
    iconClass: "bg-violet-100 text-violet-600",
  },
  {
    label: "Muestras Activas",
    value: "87",
    trend: "+5%",
    positive: true,
    icon: FlaskConical,
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    label: "Pacientes",
    value: "1.234",
    trend: "+3%",
    positive: true,
    icon: Users,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Pendientes",
    value: "12",
    trend: "-8%",
    positive: false,
    icon: Clock,
    iconClass: "bg-orange-100 text-orange-600",
  },
] as const;

const recentOrders = [
  {
    id: "ORD-2025-00142",
    patient: "María López",
    test: "Hemograma",
    status: "En Proceso",
  },
  {
    id: "ORD-2025-00138",
    patient: "Carlos Ruiz",
    test: "Perfil lipídico",
    status: "Validado",
  },
  {
    id: "ORD-2025-00129",
    patient: "Ana Martínez",
    test: "Glucosa en ayunas",
    status: "Entregado",
  },
  {
    id: "ORD-2025-00151",
    patient: "Luis Fernández",
    test: "Urocultivo",
    status: "Muestra Tomada",
  },
  {
    id: "ORD-2025-00147",
    patient: "Elena Sánchez",
    test: "TSH y T4 libre",
    status: "Registrado",
  },
] as const;

const statusStyles: Record<string, string> = {
  "En Proceso": "bg-red-50 text-red-700 border border-red-100",
  Validado: "bg-sky-50 text-sky-700 border border-sky-100",
  Entregado: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  "Muestra Tomada": "bg-amber-50 text-amber-800 border border-amber-100",
  Registrado: "bg-indigo-50 text-indigo-700 border border-indigo-100",
};

const alerts = [
  {
    icon: AlertTriangle,
    text: "3 muestras próximas a vencer",
    wrapClass: "bg-amber-50 text-amber-900 border-amber-100",
    iconClass: "text-amber-600",
  },
  {
    icon: Info,
    text: "2 resultados pendientes de validación",
    wrapClass: "bg-sky-50 text-sky-900 border-sky-100",
    iconClass: "text-sky-600",
  },
  {
    icon: ThermometerSun,
    text: "Temperatura Rack A2 fuera de rango",
    wrapClass: "bg-red-50 text-red-900 border-red-100",
    iconClass: "text-red-600",
  },
] as const;

function formatLaboratoryDate(date: Date): string {
  const s = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function Dashboard() {
  const subtitle = formatLaboratoryDate(new Date());

  return (
    <div className="min-h-screen bg-[#eef0f4] flex flex-col">
      <div className="flex flex-1">
        <SidebarComponent />

        <div className="flex-1 flex flex-col min-w-0">
          <NavbarComponent />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <header>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Resumen general del laboratorio — {subtitle}
                </p>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {metrics.map((m) => {
                  const Icon = m.icon;
                  return (
                    <Card
                      key={m.label}
                      className="border-0 shadow-sm bg-white rounded-xl"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={cn(
                              "rounded-xl p-2.5 shrink-0",
                              m.iconClass
                            )}
                          >
                            <Icon className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-0.5 text-sm font-medium",
                              m.positive ? "text-emerald-600" : "text-red-600"
                            )}
                          >
                            {m.trend}
                            {m.positive ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                        <p className="text-3xl font-semibold text-gray-900 mt-4 tabular-nums">
                          {m.value}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{m.label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <Card className="lg:col-span-2 border-0 shadow-sm bg-white rounded-xl">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Órdenes Recientes
                      </h2>
                      <Link
                        href="/ordenes-medicas"
                        className="text-sm font-medium text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
                      >
                        Ver todas
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {recentOrders.map((row) => (
                        <li
                          key={row.id}
                          className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 font-mono">
                              {row.id}
                            </p>
                            <p className="font-semibold text-gray-900 mt-0.5">
                              {row.patient}
                            </p>
                            <p className="text-sm text-gray-600">{row.test}</p>
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start sm:self-center",
                              statusStyles[row.status] ??
                                "bg-gray-100 text-gray-700"
                            )}
                          >
                            {row.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white rounded-xl">
                  <CardContent className="p-0">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Alertas
                      </h2>
                    </div>
                    <div className="p-4 space-y-3">
                      {alerts.map((a) => {
                        const Icon = a.icon;
                        return (
                          <div
                            key={a.text}
                            className={cn(
                              "flex gap-3 rounded-lg border p-3 text-sm leading-snug",
                              a.wrapClass
                            )}
                          >
                            <Icon
                              className={cn("w-5 h-5 shrink-0 mt-0.5", a.iconClass)}
                              strokeWidth={2}
                            />
                            <span>{a.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>

      <FooterComponent />
    </div>
  );
}
