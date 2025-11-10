"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import NavbarComponent from "@/components/navbar/navbar-component"
import FooterComponent from "@/components/footer/footer-component"
import SidebarComponent from "@/components/sidebar/sidebar-component"
import { useAuth } from "@/contexts/auth-context"
import { API_ENDPOINTS } from "@/lib/api-config"
import { getAuthToken } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import type { Exam, ExamDetail, PatientExamsResponse, ExamDetailResponse, ExamResult } from "@/lib/types"
import {
  Home,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  CreditCard,
  HelpCircle,
  Loader2,
  AlertCircle,
  FileSearch,
  Calendar,
  Building2,
  X,
} from "lucide-react"

export default function ConsultarPage() {
  const { user } = useAuth()
  
  // Estados
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para el detalle
  const [selectedExam, setSelectedExam] = useState<ExamDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Estados para búsqueda (rol laboratory)
  const [searchDocument, setSearchDocument] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Cargar exámenes del paciente (solo si es paciente)
  useEffect(() => {
    // Si es laboratorio, no cargar automáticamente
    if (user?.role === "laboratory") {
      setIsLoading(false)
      return
    }

    const fetchExams = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = getAuthToken()
        if (!token) {
          throw new Error("No hay token de autenticación")
        }
        
        const response = await fetchWithAuth(API_ENDPOINTS.patientExams, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        
        if (!response.ok) {
          throw new Error("Error al cargar los exámenes")
        }
        
        const data: PatientExamsResponse = await response.json()
        
        if (data.success && data.data.data) {
          setExams(data.data.data)
        } else {
          throw new Error("Respuesta inválida del servidor")
        }
      } catch (err) {
        console.error("Error al cargar exámenes:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === "patient") {
      fetchExams()
    }
  }, [user])

  // Función de búsqueda para laboratorios (placeholder hasta que me des el endpoint)
  const handleSearchExams = useCallback(async () => {
    if (!searchDocument.trim()) return
    
    setIsSearching(true)
    setError(null)
    setHasSearched(true)
    
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No hay token de autenticación")
      }
      
      // TODO: Implementar cuando me des el endpoint
      // const response = await fetchWithAuth(`${API_ENDPOINTS.searchExams}?document=${searchDocument}`, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // })
      
      // Por ahora, simular búsqueda vacía
      console.log("Buscando exámenes para documento:", searchDocument)
      setExams([])
      
    } catch (err) {
      console.error("Error al buscar exámenes:", err)
      setError(err instanceof Error ? err.message : "Error en la búsqueda")
    } finally {
      setIsSearching(false)
    }
  }, [searchDocument])

  // Cargar detalle del examen
  const loadExamDetail = useCallback(async (examId: number) => {
    try {
      setIsLoadingDetail(true)
      
      const token = getAuthToken()
      if (!token) {
        throw new Error("No hay token de autenticación")
      }
      
      const response = await fetchWithAuth(API_ENDPOINTS.examDetail(examId), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        throw new Error("Error al cargar el detalle del examen")
      }
      
      const data: ExamDetailResponse = await response.json()
      
      if (data.success && data.data) {
        setSelectedExam(data.data)
        setShowDetailModal(true)
      } else {
        throw new Error("Respuesta inválida del servidor")
      }
    } catch (err) {
      console.error("Error al cargar detalle:", err)
      alert(err instanceof Error ? err.message : "Error al cargar el detalle")
    } finally {
      setIsLoadingDetail(false)
    }
  }, [])

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Obtener etiqueta del estado
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'pending':
        return 'Pendiente'
      case 'processing':
        return 'Procesando'
      default:
        return status
    }
  }

  // Obtener color del resultado
  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'low':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'critical':
        return 'bg-red-100 text-red-900 border-red-300'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <SidebarComponent />

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <NavbarComponent />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Consultar Exámenes</h1>
                <p className="text-gray-600">
                  {user?.role === "laboratory" 
                    ? "Busca y revisa los exámenes de laboratorio de tus pacientes."
                    : "Revisa tus exámenes de laboratorio realizados."}
                </p>
              </div>

              {/* Banner informativo según el rol */}
              {user && user.role === "patient" && (
                <div className="mb-6 rounded-xl border p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <FileSearch className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">
                        Tus Exámenes de Laboratorio
                      </h3>
                      <p className="text-sm text-blue-700">
                        Aquí puedes consultar todos los exámenes de laboratorio que te han realizado. Haz clic en cualquier examen para ver los resultados detallados.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {user && user.role === "laboratory" && (
                <div className="mb-6 rounded-xl border p-4 bg-green-50 border-green-200">
                  <div className="flex items-start gap-3">
                    <FileSearch className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-green-900 mb-1">
                        Búsqueda de Exámenes por Paciente
                      </h3>
                      <p className="text-sm text-green-700">
                        Busca los exámenes de un paciente ingresando su número de documento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Buscador para laboratorios */}
              {user && user.role === "laboratory" && (
                <Card className="rounded-2xl border border-purple-100 shadow-sm mb-6">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Exámenes por Documento</h2>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          placeholder="Ingrese el número de documento del paciente"
                          value={searchDocument}
                          onChange={(e) => setSearchDocument(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSearchExams()
                            }
                          }}
                          className="h-11"
                        />
                      </div>
                      <Button
                        onClick={handleSearchExams}
                        disabled={!searchDocument.trim() || isSearching}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                      >
                        {isSearching ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Buscando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <FileSearch className="w-4 h-4" />
                            Buscar
                          </span>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lista de exámenes */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <span className="ml-3 text-gray-600">Cargando exámenes...</span>
                </div>
              ) : error ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Error al cargar exámenes</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              ) : exams.length === 0 ? (
                <Card className="rounded-2xl border border-purple-100 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <FileSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    {user?.role === "laboratory" ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {hasSearched ? "No se encontraron exámenes" : "Busca exámenes de un paciente"}
                        </h3>
                        <p className="text-gray-600">
                          {hasSearched 
                            ? `No se encontraron exámenes para el documento: ${searchDocument}`
                            : "Ingresa el número de documento del paciente para buscar sus exámenes."}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay exámenes registrados</h3>
                        <p className="text-gray-600">Aún no tienes exámenes de laboratorio en el sistema.</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {exams.map((exam) => (
                    <Card key={exam.id} className="rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {exam.exam_type.name}
                                </h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <span className="font-medium text-gray-700">Código:</span>
                                    {exam.exam_type.code}
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium text-gray-700">Fecha del examen:</span>
                                    {formatDate(exam.exam_date)}
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Building2 className="w-4 h-4" />
                                    <span className="font-medium text-gray-700">Laboratorio:</span>
                                    {exam.laboratory.name}
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <span className="font-medium text-gray-700">N° de Orden:</span>
                                    <span className="font-mono text-xs">{exam.order_number}</span>
                                  </div>
                                  {exam.patient_notes && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                      <p className="text-xs text-gray-500 mb-1">Notas del paciente:</p>
                                      <p className="text-sm text-gray-700">{exam.patient_notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(exam.status)}`}>
                                  {getStatusLabel(exam.status)}
                                </span>
                                <Button
                                  onClick={() => loadExamDetail(exam.id)}
                                  disabled={isLoadingDetail}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  {isLoadingDetail ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Ver Detalle"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <FooterComponent />

      {/* Modal de detalle del examen */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedExam && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedExam.exam_type.name}</DialogTitle>
                <DialogDescription>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><span className="font-medium">Código:</span> {selectedExam.exam_type.code}</div>
                    <div><span className="font-medium">Fecha:</span> {formatDate(selectedExam.exam_date)}</div>
                    <div><span className="font-medium">Laboratorio:</span> {selectedExam.laboratory.name}</div>
                    <div><span className="font-medium">Estado:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedExam.status)}`}>{getStatusLabel(selectedExam.status)}</span></div>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados del Examen</h3>
                
                {selectedExam.results && selectedExam.results.length > 0 ? (
                  <div className="space-y-3">
                    {selectedExam.results.map((result) => (
                      <div key={result.id} className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">{result.parameter_name}</h4>
                              {result.parameter_code && (
                                <span className="text-xs text-gray-500">({result.parameter_code})</span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Valor:</span>
                                <span className="ml-2 font-semibold text-gray-900">{result.value} {result.unit}</span>
                              </div>
                              
                              {(result.reference_min || result.reference_max || result.reference_text) && (
                                <div>
                                  <span className="text-gray-600">Referencia:</span>
                                  <span className="ml-2 text-gray-700">
                                    {result.reference_min && result.reference_max 
                                      ? `${result.reference_min} - ${result.reference_max} ${result.unit}`
                                      : result.reference_max 
                                      ? `< ${result.reference_max} ${result.unit}`
                                      : result.reference_min
                                      ? `> ${result.reference_min} ${result.unit}`
                                      : result.reference_text}
                                  </span>
                                </div>
                              )}
                            </div>

                            {result.notes && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                {result.notes}
                              </div>
                            )}
                          </div>

                          <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getResultStatusColor(result.status)}`}>
                            {result.status === 'normal' ? 'Normal' : result.status === 'high' ? 'Alto' : result.status === 'low' ? 'Bajo' : 'Crítico'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay resultados disponibles para este examen.</p>
                  </div>
                )}

                {selectedExam.patient_notes && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notas del Paciente:</h4>
                    <p className="text-sm text-gray-600">{selectedExam.patient_notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

