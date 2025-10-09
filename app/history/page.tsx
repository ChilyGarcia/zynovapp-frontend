"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Download,
  Clock,
  Calendar,
  FileText,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";

type Exam = {
  id: string;
  date: string;
  specialty:
    | "neumonologia"
    | "dermatologia"
    | "cardiologia"
    | "gastroenterologia"
    | "neurologia";
  status: "completado" | "pendiente" | "en_proceso";
  type: string;
  doctor: string;
  details?: string;
};

const specialties = [
  { id: "all", name: "Todas las especialidades" },
  { id: "neumonologia", name: "Neumonología" },
  { id: "dermatologia", name: "Dermatología" },
  { id: "cardiologia", name: "Cardiología" },
  { id: "gastroenterologia", name: "Gastroenterología" },
  { id: "neurologia", name: "Neurología" },
];

const statusColors = {
  completado: "bg-green-100 text-green-800",
  pendiente: "bg-yellow-100 text-yellow-800",
  en_proceso: "bg-blue-100 text-blue-800",
};

// Datos del paciente actual

const mockExams: Exam[] = [
  {
    id: "EX-001",
    date: "2025-10-05",
    specialty: "neumonologia",
    status: "completado",
    type: "Radiografía de tórax",
    doctor: "Dra. Ana García",
    details: "Radiografía PA y lateral de tórax. Sin hallazgos patológicos.",
  },
  {
    id: "EX-002",
    date: "2025-09-28",
    specialty: "dermatologia",
    status: "pendiente",
    type: "Biopsia de piel",
    doctor: "Dr. Carlos Méndez",
    details: "Biopsia de lesión en brazo derecho. Resultados pendientes.",
  },
  {
    id: "EX-003",
    date: "2025-09-20",
    specialty: "cardiologia",
    status: "completado",
    type: "Electrocardiograma",
    doctor: "Dra. Laura Torres",
    details: "Ritmo sinusal normal. Sin alteraciones significativas.",
  },
  {
    id: "EX-004",
    date: "2025-09-15",
    specialty: "neumonologia",
    status: "completado",
    type: "Espirometría",
    doctor: "Dr. Javier López",
    details: "Prueba de función pulmonar dentro de parámetros normales.",
  },
  {
    id: "EX-005",
    date: "2025-09-10",
    specialty: "gastroenterologia",
    status: "pendiente",
    type: "Endoscopia",
    doctor: "Dra. Sofía Ramírez",
    details: "Endoscopia digestiva alta programada.",
  },
  {
    id: "EX-006",
    date: "2025-08-25",
    specialty: "neurologia",
    status: "completado",
    type: "Resonancia Magnética",
    doctor: "Dr. Roberto Jiménez",
    details: "Resonancia magnética cerebral sin hallazgos patológicos.",
  },
];

export default function HistoryPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExams = mockExams.filter((exam) => {
    const matchesSpecialty =
      selectedSpecialty === "all" || exam.specialty === selectedSpecialty;
    const matchesSearch =
      exam.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.details &&
        exam.details.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSpecialty && matchesSearch;
  });

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      completado: "Completado",
      pendiente: "Pendiente",
      en_proceso: "En Proceso",
    };
    return statusMap[status] || status;
  };

  const getSpecialtyName = (specialty: string) => {
    const found = specialties.find((s) => s.id === specialty);
    return found ? found.name : specialty;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Exams Section */}
        <div className="space-y-6">
          {/* Header and Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Historial de Exámenes
              </h2>
              <p className="text-gray-600">
                Visualiza y gestiona todos los exámenes médicos
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className=" w-full">
                <input
                  type="text"
                  placeholder="Buscar exámenes..."
                  className="w-full pr-10 pl-4 bg-white border border-gray-200 rounded-full h-9 sm:h-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className=" w-full">
                <select
                  className="w-full pr-10 pl-4 bg-white border border-gray-200 rounded-full h-9 sm:h-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none shadow-sm"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Exams List */}
          {filteredExams.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No se encontraron exámenes
              </h3>
              <p className="mt-1 text-gray-500">
                No hay exámenes que coincidan con tu búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredExams.map((exam) => (
                <Card
                  key={exam.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{exam.type}</CardTitle>
                        <p className="text-sm text-gray-600">ID: {exam.id}</p>
                      </div>
                      <Badge className={statusColors[exam.status]}>
                        {getStatusText(exam.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                          {new Date(exam.date).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg
                          className="h-4 w-4 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span>{getSpecialtyName(exam.specialty)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg
                          className="h-4 w-4 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="truncate">{exam.doctor}</span>
                      </div>
                    </div>
                    {exam.details && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p className="line-clamp-2">{exam.details}</p>
                      </div>
                    )}
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        Realizado el:{" "}
                        {new Date(exam.date).toLocaleDateString("es-ES")}
                      </span>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none justify-center gap-1"
                        >
                          <Clock className="h-4 w-4" />
                          <span>Detalles</span>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 sm:flex-none justify-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>PDF</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
