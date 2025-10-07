"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Printer } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/app-layout";

// Mock data - replace with actual API calls
const mockExams = [
  {
    id: "EX-001",
    date: "2025-10-05",
    type: "Hemograma Completo",
    status: "Completado",
    results: "Ver resultados",
    download: "PDF",
  },
  {
    id: "EX-002",
    date: "2025-10-01",
    type: "Perfil Lipídico",
    status: "Completado",
    results: "Ver resultados",
    download: "PDF",
  },
  {
    id: "EX-003",
    date: "2025-09-28",
    type: "Glicemia en Ayunas",
    status: "Completado",
    results: "Ver resultados",
    download: "PDF",
  },
  {
    id: "EX-004",
    date: "2025-10-05",
    type: "Hemograma Completo",
    status: "Completado",
    results: "Ver resultados",
    download: "PDF",
  },
  {
    id: "EX-005",
    date: "2025-10-01",
    type: "Perfil Lipídico",
    status: "Completado",
    results: "Ver resultados",
    download: "PDF",
  },
  {
    id: "EX-006",
    date: "2025-09-28",
    type: "Glicemia en Ayunas",
    status: "Completado",
    results: "Ver resultados",
    download: "PDF",
  },
];

export default function ConsultPage() {
  const [idNumber, setIdNumber] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (idNumber.trim()) {
      setSearchPerformed(true);
      // Here you would typically make an API call to fetch the exams
      console.log("Searching for ID:", idNumber);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Consultar Exámenes
          </h1>
          <p className="text-gray-600">
            Ingrese el número de cédula para buscar exámenes
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Ingrese número de cédula"
                  value={idNumber}
                  onChange={(e) => {
                    setIdNumber(e.target.value);
                    setSearchPerformed(false);
                  }}
                  className="h-12 text-base"
                />
              </div>
              <Button
                type="submit"
                className="bg-[#7C3AED] hover:bg-[#6D28D9] h-12 px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchPerformed && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Resultados de la búsqueda</CardTitle>
                  <CardDescription>
                    Exámenes para cédula: {idNumber}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID de Examen</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo de Examen</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Resultados</TableHead>
                    <TableHead>Descargar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.id}</TableCell>
                      <TableCell>{exam.date}</TableCell>
                      <TableCell>{exam.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-[#7C3AED]"
                        >
                          {exam.results}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4 text-[#7C3AED]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500">
                Mostrando {mockExams.length} de {mockExams.length} resultados
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
