"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import NavbarComponent from "@/components/navbar/navbar-component"
import FooterComponent from "@/components/footer/footer-component"
import SidebarComponent from "@/components/sidebar/sidebar-component"
import { useAuth } from "@/contexts/auth-context"
import { API_ENDPOINTS } from "@/lib/api-config"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import type { ExamType, ExamTypesResponse } from "@/lib/types"
import { getExamFields, type ExamField } from "@/lib/exam-fields"

// Tipos para Exam Templates
interface MeasurementUnit {
  id: number
  name: string
  symbol: string
  description?: string
}

interface ExamTemplateQuestion {
  id: number
  exam_template_id: number
  parameter_name: string
  parameter_code: string | null
  description: string | null
  unit_type_id: number
  unit: string | null
  reference_min: string | null
  reference_max: string | null
  reference_text: string | null
  notes_placeholder: string | null
  order: number
  is_required: boolean
  created_at: string
  updated_at: string
  unit_type: MeasurementUnit
}

interface ExamTemplate {
  id: number
  laboratory_id: number | null
  organization_id: number
  name: string
  description: string | null
  exam_type_id: number
  is_active: boolean
  created_at: string
  updated_at: string
  exam_type: ExamType
  questions: ExamTemplateQuestion[]
}

interface ExamTemplatesResponse {
  success: boolean
  data: ExamTemplate[]
}
import {
  Home,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  CreditCard,
  HelpCircle,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react"

export default function LabsPage() {
  const { user } = useAuth()
  // Modo: "analisis" (flujo actual) o "registro" (nuevo flujo)
  const [mode, setMode] = useState<"analisis" | "registro">("registro")

  // Estado para modo análisis (flujo existente)
  const [step, setStep] = useState(1)
  const [selectedExam, setSelectedExam] = useState<number | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Estado para modo registro (nuevo flujo)
  const [regStep, setRegStep] = useState(1)
  const [regSelectedTemplate, setRegSelectedTemplate] = useState<number | null>(null)
  const [regValues, setRegValues] = useState<Record<string, string>>({})
  const [showRegSuccess, setShowRegSuccess] = useState(false)
  
  // Estados para plantillas de examen
  const [examTemplates, setExamTemplates] = useState<ExamTemplate[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  
  // Datos del paciente para el registro
  const [patientData, setPatientData] = useState({
    patient_document: "",
    patient_first_name: "",
    patient_last_name: "",
    document_type: "CC",
    exam_date: "",
    patient_notes: "",
  })
  
  // Estados para el envío
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Estado para los tipos de exámenes desde el API
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [examError, setExamError] = useState<string | null>(null)

  // Cargar tipos de exámenes desde el API (para modo análisis)
  useEffect(() => {
    const fetchExamTypes = async () => {
      try {
        setIsLoadingExams(true)
        setExamError(null)
        const response = await fetch(API_ENDPOINTS.examTypes)
        
        if (!response.ok) {
          throw new Error("Error al cargar los tipos de exámenes")
        }
        
        const data: ExamTypesResponse = await response.json()
        
        if (data.success && data.data) {
          setExamTypes(data.data)
        } else {
          throw new Error("Respuesta inválida del servidor")
        }
      } catch (error) {
        console.error("Error al cargar tipos de exámenes:", error)
        setExamError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setIsLoadingExams(false)
      }
    }

    fetchExamTypes()
  }, [])

  // Cargar plantillas de examen desde el API (para modo registro)
  useEffect(() => {
    const fetchExamTemplates = async () => {
      try {
        setIsLoadingTemplates(true)
        setTemplatesError(null)
        const response = await fetchWithAuth(API_ENDPOINTS.examTemplates)
        
        if (!response.ok) {
          throw new Error("Error al cargar las plantillas de exámenes")
        }
        
        const data: ExamTemplatesResponse = await response.json()
        
        if (data.success && data.data) {
          setExamTemplates(data.data)
        } else {
          throw new Error("Respuesta inválida del servidor")
        }
      } catch (error) {
        console.error("Error al cargar plantillas de exámenes:", error)
        setTemplatesError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setIsLoadingTemplates(false)
      }
    }

    fetchExamTemplates()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(f ? URL.createObjectURL(f) : null)
  }, [previewUrl])

  const goNext = useCallback(() => {
    if (step === 1 && !selectedExam) return
    if (step === 2 && !file) return
    setStep((s) => Math.min(3, s + 1))
  }, [step, selectedExam, file])

  const goBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1))
  }, [])

  // Registro: navegación
  const regNext = useCallback(() => {
    if (regStep === 2 && !regSelectedTemplate) return
    setRegStep((s) => Math.min(3, s + 1))
  }, [regStep, regSelectedTemplate])

  const regBack = useCallback(() => {
    setRegStep((s) => Math.max(1, s - 1))
  }, [])

  // Resetear estados al cambiar el modo
  useEffect(() => {
    if (mode === "analisis") {
      setStep(1)
      setSelectedExam(null)
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } else {
      setRegStep(1)
      setRegSelectedTemplate(null)
      setRegValues({})
      setPatientData({
        patient_document: "",
        patient_first_name: "",
        patient_last_name: "",
        document_type: "CC",
        exam_date: "",
        patient_notes: "",
      })
    }
  }, [mode])
  
  // Función para enviar el registro al API
  const handleSaveExam = async () => {
    if (!regSelectedTemplate) return
    
    setSaveError(null)
    setIsSaving(true)
    
    try {
      // Obtener la plantilla seleccionada
      const selectedTemplate = examTemplates.find(t => t.id === regSelectedTemplate)
      if (!selectedTemplate) {
        throw new Error("Plantilla no encontrada")
      }
      
      // Construir el array de resultados desde regValues usando las preguntas de la plantilla
      const sortedQuestions = [...selectedTemplate.questions].sort((a, b) => a.order - b.order)
      const results = sortedQuestions
        .map((question, index) => {
          const value = regValues[`${index}_value`]
          if (!value && question.is_required) {
            throw new Error(`El campo "${question.parameter_name}" es requerido`)
          }
          if (!value) return null // Solo incluir si tiene valor
          
          return {
            parameter_name: question.parameter_name,
            parameter_code: question.parameter_code || undefined,
            value: value,
            unit: question.unit_type.symbol,
            reference_min: question.reference_min || undefined,
            reference_max: question.reference_max || undefined,
            reference_text: question.reference_text || undefined,
            status: "normal", // Por defecto, se puede calcular según referencias
            notes: regValues[`${index}_notes`] || undefined,
          }
        })
        .filter(Boolean) // Remover nulos
      
      // Convertir fecha de formato datetime-local a formato del API
      const examDate = patientData.exam_date.replace('T', ' ') + ':00'
      
      // Construir el payload
      const payload = {
        patient_document: patientData.patient_document,
        patient_first_name: patientData.patient_first_name,
        patient_last_name: patientData.patient_last_name,
        patient_email: "", // Se genera automáticamente en el backend
        document_type: patientData.document_type,
        exam_type_id: selectedTemplate.exam_type_id,
        exam_date: examDate,
        patient_notes: patientData.patient_notes || undefined,
        results: results,
      }
      
      // Obtener el token
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No hay token de autenticación")
      }
      
      // Enviar al API
      const response = await fetchWithAuth(API_ENDPOINTS.laboratoryExams, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Error al guardar el examen")
      }
      
      // Éxito
      setShowRegSuccess(true)
      setRegStep(1)
      setRegSelectedTemplate(null)
      setRegValues({})
      setPatientData({
        patient_document: "",
        patient_first_name: "",
        patient_last_name: "",
        document_type: "CC",
        exam_date: "",
        patient_notes: "",
      })
    } catch (error) {
      console.error("Error al guardar examen:", error)
      setSaveError(error instanceof Error ? error.message : "Error al guardar el examen")
    } finally {
      setIsSaving(false)
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
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Análisis de Laboratorios</h1>
                <p className="text-gray-600">Selecciona el flujo: Análisis (actual) o Registro (nuevo).</p>
              </div>

              {/* Banner informativo según el rol del usuario */}
              {user && (
                <div className={`mb-6 rounded-xl border p-4 ${
                  user.role === "patient" 
                    ? "bg-blue-50 border-blue-200" 
                    : "bg-green-50 border-green-200"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      {user.role === "patient" && (
                        <>
                          <h3 className="text-sm font-semibold text-blue-900 mb-1">
                            Vista de Paciente
                          </h3>
                          <p className="text-sm text-blue-700">
                            Como paciente, puedes analizar tus exámenes de laboratorio subiendo archivos o viendo resultados anteriores.
                          </p>
                        </>
                      )}
                      {user.role === "laboratory" && (
                        <>
                          <h3 className="text-sm font-semibold text-green-900 mb-1">
                            Vista de Laboratorio
                          </h3>
                          <p className="text-sm text-green-700">
                            Como laboratorio, puedes registrar resultados de exámenes manualmente usando el flujo de "Registro de laboratorio".
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Selector de modo */}
              <Tabs value={mode} onValueChange={(v) => setMode(v as "analisis" | "registro")} className="mb-6">
                <TabsList>
                  <TabsTrigger value="analisis">Análisis (actual)</TabsTrigger>
                  <TabsTrigger value="registro">Registro de laboratorio</TabsTrigger>
                </TabsList>

                {/* Modo Análisis: flujo existente, intacto */}
                <TabsContent value="analisis" className="mt-4">
              <div className="mb-6">
                    <Stepper step={step} labels={["Examen", "Archivo", "Resultados"]} />
              </div>

              {step === 1 && (
                <Card className="rounded-2xl border border-purple-100 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Selecciona el tipo de examen</h2>
                        
                        {isLoadingExams ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <span className="ml-3 text-gray-600">Cargando tipos de exámenes...</span>
                          </div>
                        ) : examError ? (
                          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-red-900">Error al cargar exámenes</p>
                              <p className="text-sm text-red-700">{examError}</p>
                            </div>
                          </div>
                        ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {examTypes.map((ex) => (
                        <button
                          key={ex.id}
                          onClick={() => setSelectedExam(ex.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            selectedExam === ex.id
                              ? "border-purple-500 bg-purple-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                                <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">{ex.name}</span>
                            {selectedExam === ex.id ? (
                                      <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                    )}
                                  </div>
                                  {ex.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2">{ex.description}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                        )}

                    <div className="mt-6 flex justify-end gap-3">
                      <Button variant="outline" disabled>
                        Atrás
                      </Button>
                          <Button onClick={goNext} disabled={!selectedExam || isLoadingExams} className="bg-purple-600 hover:bg-purple-700 text-white">
                        Siguiente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card className="rounded-2xl border border-purple-100 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Sube el archivo del examen</h2>
                    <p className="text-sm text-gray-600 mb-4">Acepta imágenes o PDF. Arrastra y suelta, o haz clic para seleccionar.</p>

                    <label
                      htmlFor="labs-file"
                      className="group block rounded-2xl border-2 border-dashed border-purple-200 bg-gradient-to-b from-white to-purple-50/50 hover:from-white hover:to-purple-100 transition-colors p-8 cursor-pointer"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-800 font-medium">Arrastra tu archivo aquí</p>
                        <p className="text-xs text-gray-500">o haz clic para buscar en tu dispositivo</p>
                      </div>
                      <Input id="labs-file" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                    </label>

                    {file && (
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                            </div>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Listo</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewUrl && file && file.type.startsWith("image/") && (
                      <div className="mt-4">
                        <img src={previewUrl} alt="Vista previa" className="max-h-64 rounded-xl border border-gray-200 shadow-sm" />
                      </div>
                    )}

                    <div className="mt-6 flex justify-between gap-3">
                      <Button variant="outline" onClick={goBack}>
                        Atrás
                      </Button>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => { setFile(null); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }}}>
                          Limpiar
                        </Button>
                        <Button onClick={goNext} disabled={!file} className="bg-purple-600 hover:bg-purple-700 text-white">
                          Analizar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card className="rounded-2xl border border-purple-100 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Resultados simulados</h2>
                    <p className="text-sm text-gray-600 mb-6">
                          Examen seleccionado: <span className="font-medium text-gray-900">{labelForExam(selectedExam, examTypes)}</span>
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Parámetros principales</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {mockResults(selectedExam, examTypes).map((r) => (
                            <div key={r.name} className="rounded-lg border border-gray-100 p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{r.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${r.flag === "alto" ? "bg-red-50 text-red-600" : r.flag === "bajo" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>
                                  {r.flag}
                                </span>
                              </div>
                              <div className="mt-1">
                                <span className="text-sm font-medium text-gray-900">{r.value}</span>
                                <span className="text-xs text-gray-500 ml-2">Ref: {r.ref}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Conclusión</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                              {mockConclusion(selectedExam, examTypes)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between gap-3">
                      <Button variant="outline" onClick={goBack}>
                        Atrás
                      </Button>
                      <Button className="bg-gray-900 hover:bg-black text-white" onClick={() => { setStep(1); setSelectedExam(null); setFile(null); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) } }}>
                        Nuevo análisis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
                </TabsContent>

                {/* Modo Registro: nuevo flujo */}
                <TabsContent value="registro" className="mt-4">
                  <div className="mb-6">
                    <Stepper step={regStep} labels={["Paciente", "Examen", "Resultados"]} />
                  </div>

                  {regStep === 1 && (
                    <Card className="rounded-2xl border border-purple-100 shadow-sm">
                      <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Datos del Paciente</h2>
                        <p className="text-sm text-gray-600 mb-6">Completa la información del paciente para el examen de laboratorio.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Documento */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Número de Documento *</label>
                            <Input
                              placeholder="Ej: 1091352289"
                              value={patientData.patient_document}
                              onChange={(e) => setPatientData({ ...patientData, patient_document: e.target.value })}
                            />
                          </div>

                          {/* Tipo de Documento */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Tipo de Documento *</label>
                            <select
                              value={patientData.document_type}
                              onChange={(e) => setPatientData({ ...patientData, document_type: e.target.value })}
                              className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm"
                            >
                              <option value="CC">Cédula de Ciudadanía (CC)</option>
                              <option value="TI">Tarjeta de Identidad (TI)</option>
                              <option value="CE">Cédula de Extranjería (CE)</option>
                              <option value="PP">Pasaporte (PP)</option>
                              <option value="RC">Registro Civil (RC)</option>
                            </select>
                          </div>

                          {/* Nombre */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nombre *</label>
                            <Input
                              placeholder="Ej: Juan"
                              value={patientData.patient_first_name}
                              onChange={(e) => setPatientData({ ...patientData, patient_first_name: e.target.value })}
                            />
                          </div>

                          {/* Apellido */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Apellido *</label>
                            <Input
                              placeholder="Ej: Pérez García"
                              value={patientData.patient_last_name}
                              onChange={(e) => setPatientData({ ...patientData, patient_last_name: e.target.value })}
                            />
                          </div>

                          {/* Fecha del Examen */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Fecha y Hora del Examen *</label>
                            <Input
                              type="datetime-local"
                              value={patientData.exam_date}
                              onChange={(e) => setPatientData({ ...patientData, exam_date: e.target.value })}
                            />
                          </div>

                          {/* Notas del Paciente */}
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Notas del Paciente (Opcional)</label>
                            <Input
                              placeholder="Ej: Paciente en ayunas de 8 horas"
                              value={patientData.patient_notes}
                              onChange={(e) => setPatientData({ ...patientData, patient_notes: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                          <Button variant="outline" disabled>
                            Atrás
                          </Button>
                          <Button
                            onClick={regNext}
                            disabled={
                              !patientData.patient_document ||
                              !patientData.patient_first_name ||
                              !patientData.patient_last_name ||
                              !patientData.exam_date
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Siguiente
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {regStep === 2 && (
                    <Card className="rounded-2xl border border-purple-100 shadow-sm">
                      <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Selecciona la plantilla de examen</h2>
                        
                        {isLoadingTemplates ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <span className="ml-3 text-gray-600">Cargando plantillas de exámenes...</span>
                          </div>
                        ) : templatesError ? (
                          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-red-900">Error al cargar plantillas</p>
                              <p className="text-sm text-red-700">{templatesError}</p>
                            </div>
                          </div>
                        ) : examTemplates.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <p>No hay plantillas de exámenes disponibles</p>
                            <p className="text-sm mt-2">Contacta al administrador para crear plantillas</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {examTemplates
                              .filter(template => template.is_active)
                              .map((template) => (
                              <button
                                key={template.id}
                                onClick={() => setRegSelectedTemplate(template.id)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${
                                  regSelectedTemplate === template.id
                                    ? "border-purple-500 bg-purple-50 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">{template.name}</span>
                                    {regSelectedTemplate === template.id ? (
                                      <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                    )}
                                  </div>
                                  {template.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500">
                                      Tipo: <span className="font-medium">{template.exam_type.name}</span>
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Preguntas: <span className="font-medium">{template.questions.length}</span>
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 flex justify-between gap-3">
                          <Button variant="outline" onClick={regBack}>
                            Atrás
                          </Button>
                          <Button onClick={regNext} disabled={!regSelectedTemplate || isLoadingTemplates} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Siguiente
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {regStep === 3 && (
                    <Card className="rounded-2xl border border-purple-100 shadow-sm">
                      <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Campos del examen</h2>
                        {regSelectedTemplate && (() => {
                          const selectedTemplate = examTemplates.find(t => t.id === regSelectedTemplate)
                          if (!selectedTemplate) return null
                          return (
                            <p className="text-sm text-gray-600 mb-6">
                              Plantilla: <span className="font-medium text-gray-900">{selectedTemplate.name}</span>
                              {selectedTemplate.exam_type && (
                                <span className="ml-2 text-gray-500">({selectedTemplate.exam_type.name})</span>
                              )}
                            </p>
                          )
                        })()}

                        {regSelectedTemplate && (() => {
                          const selectedTemplate = examTemplates.find(t => t.id === regSelectedTemplate)
                          if (!selectedTemplate) return null
                          
                          const sortedQuestions = [...selectedTemplate.questions].sort((a, b) => a.order - b.order)
                          
                          if (sortedQuestions.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <p>No hay preguntas definidas para esta plantilla.</p>
                              </div>
                            )
                          }
                          
                          return (
                            <div className="space-y-6">
                              {sortedQuestions.map((question, index) => (
                                <div key={question.id} className="rounded-lg border border-gray-200 bg-white p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Nombre del parámetro y valor */}
                                    <div className="md:col-span-2 space-y-3">
                                      <div className="flex items-start gap-2">
                                        <div className="flex-1">
                                          <label className="text-sm font-medium text-gray-900 block mb-1">
                                            {question.parameter_name}
                                            {question.is_required && (
                                              <span className="ml-2 text-xs text-red-600">*</span>
                                            )}
                                            {question.parameter_code && (
                                              <span className="ml-2 text-xs text-gray-500">({question.parameter_code})</span>
                                            )}
                                          </label>
                                          {question.description && (
                                            <p className="text-xs text-gray-500 mb-2">{question.description}</p>
                                          )}
                                          <Input
                                            placeholder={question.notes_placeholder || "Ingrese el valor"}
                                            value={regValues[`${index}_value`] ?? ""}
                                            onChange={(e) => setRegValues((prev) => ({ ...prev, [`${index}_value`]: e.target.value }))}
                                            className="w-full"
                                            required={question.is_required}
                                          />
                                        </div>
                                        <div className="w-24">
                                          <label className="text-xs text-gray-600 block mb-1">Unidad</label>
                                          <Input
                                            value={question.unit_type.symbol}
                                            disabled
                                            className="bg-gray-50 text-sm"
                                          />
                                        </div>
                                      </div>

                                      {/* Notas opcionales */}
                                      <div>
                                        <label className="text-xs text-gray-600 block mb-1">Notas (opcional)</label>
                                        <Input
                                          placeholder="Observaciones adicionales"
                                          value={regValues[`${index}_notes`] ?? ""}
                                          onChange={(e) => setRegValues((prev) => ({ ...prev, [`${index}_notes`]: e.target.value }))}
                                          className="w-full"
                                        />
                                      </div>
                                    </div>

                                    {/* Referencias */}
                                    <div className="space-y-2">
                                      <label className="text-xs font-medium text-gray-700 block">Valores de referencia</label>
                                      {question.reference_min && question.reference_max ? (
                                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                          <div>Mínimo: <span className="font-medium">{question.reference_min} {question.unit_type.symbol}</span></div>
                                          <div>Máximo: <span className="font-medium">{question.reference_max} {question.unit_type.symbol}</span></div>
                                        </div>
                                      ) : question.reference_max ? (
                                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                          Máximo: <span className="font-medium">{question.reference_max} {question.unit_type.symbol}</span>
                                        </div>
                                      ) : question.reference_min ? (
                                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                          Mínimo: <span className="font-medium">{question.reference_min} {question.unit_type.symbol}</span>
                                        </div>
                                      ) : question.reference_text ? (
                                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                          {question.reference_text}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-500 italic">Sin referencia</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        })()}

                        {/* Error de guardado */}
                        {saveError && (
                          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-red-900">Error al guardar</p>
                              <p className="text-sm text-red-700">{saveError}</p>
                            </div>
                          </div>
                        )}

                        <div className="mt-6 flex justify-between gap-3">
                          <Button variant="outline" onClick={regBack} disabled={isSaving}>
                            Atrás
                          </Button>
                          <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setRegValues({})} disabled={isSaving}>
                              Limpiar
                            </Button>
                            <Button
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              disabled={!regSelectedTemplate || isSaving}
                              onClick={handleSaveExam}
                            >
                              {isSaving ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Guardando...
                                </span>
                              ) : (
                                "Guardar registro"
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Modal de confirmación de registro */}
                  <Dialog open={showRegSuccess} onOpenChange={setShowRegSuccess}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>¡Registro guardado!</DialogTitle>
                        <DialogDescription>
                          Se registró todo correctamente. Puedes comenzar un nuevo registro cuando quieras.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setShowRegSuccess(false)}>
                          Listo
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <FooterComponent />
    </div>
  )
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

function SidebarItem({ icon, label, active = false, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
        active ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  )
}

function Stepper({ step, labels }: { step: number; labels: [string, string, string] }) {
  const state1: StepState = step > 1 ? "done" : step === 1 ? "active" : "todo"
  const state2: StepState = step > 2 ? "done" : step === 2 ? "active" : "todo"
  const state3: StepState = step === 3 ? "active" : step > 3 ? "done" : "todo"

  return (
    <div className="w-fit mx-auto">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <StepCircle index={1} state={state1} />
        <Connector active={step >= 2} />
        <StepCircle index={2} state={state2} />
        <Connector active={step >= 3} />
        <StepCircle index={3} state={state3} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-8 justify-items-center w-full">
        <StepLabel text={labels[0]} state={state1} />
        <StepLabel text={labels[1]} state={state2} />
        <StepLabel text={labels[2]} state={state3} />
      </div>
    </div>
  )
}

type StepState = "todo" | "active" | "done"

function StepCircle({ index, state }: { index: number; state: StepState }) {
  const circleClass =
    state === "done"
      ? "bg-green-600 text-white"
      : state === "active"
      ? "bg-purple-600 text-white"
      : "bg-gray-200 text-gray-600"

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${circleClass}`}>
      {state === "done" ? <Check className="w-5 h-5" /> : index}
    </div>
  )
}

function StepLabel({ text, state }: { text: string; state: StepState }) {
  return (
    <div className={`text-xs sm:text-sm font-medium whitespace-nowrap ${state !== "todo" ? "text-gray-900" : "text-gray-500"}`}>
      {text}
    </div>
  )
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className={`h-0.5 w-16 sm:w-24 md:w-32 rounded ${active ? "bg-purple-400" : "bg-gray-300"}`} />
  )
}

function labelForExam(selected: number | null, examTypes: ExamType[]) {
  if (!selected) return "—"
  return examTypes.find((e) => e.id === selected)?.name ?? "—"
}

function getExamCategory(selected: number | null, examTypes: ExamType[]): string | null {
  if (!selected) return null
  return examTypes.find((e) => e.id === selected)?.category ?? null
}

function mockResults(selected: number | null, examTypes: ExamType[]): { name: string; value: string; ref: string; flag: "normal" | "alto" | "bajo" }[] {
  const category = getExamCategory(selected, examTypes)
  
  switch (category) {
    case "hemograma":
      return [
        { name: "Hemoglobina", value: "13.8 g/dL", ref: "12 - 16", flag: "normal" },
        { name: "Hematocrito", value: "41%", ref: "36 - 46", flag: "normal" },
        { name: "Leucocitos", value: "11.2 x10^3/µL", ref: "4.0 - 11.0", flag: "alto" },
        { name: "Plaquetas", value: "150 x10^3/µL", ref: "150 - 450", flag: "normal" },
      ]
    case "bioquimico":
      return [
        { name: "Glucosa", value: "112 mg/dL", ref: "70 - 100", flag: "alto" },
        { name: "Creatinina", value: "0.9 mg/dL", ref: "0.6 - 1.1", flag: "normal" },
        { name: "Colesterol total", value: "182 mg/dL", ref: "< 200", flag: "normal" },
        { name: "Triglicéridos", value: "170 mg/dL", ref: "< 150", flag: "alto" },
      ]
    case "electrolitos":
      return [
        { name: "Sodio", value: "138 mmol/L", ref: "135 - 145", flag: "normal" },
        { name: "Potasio", value: "3.4 mmol/L", ref: "3.5 - 5.1", flag: "bajo" },
        { name: "Cloro", value: "104 mmol/L", ref: "98 - 107", flag: "normal" },
      ]
    case "marcadores_tumorales":
      return [
        { name: "CEA", value: "3.1 ng/mL", ref: "< 5.0", flag: "normal" },
        { name: "CA-125", value: "36 U/mL", ref: "< 35", flag: "alto" },
      ]
    case "coagulacion":
      return [
        { name: "TP (INR)", value: "1.2", ref: "0.8 - 1.2", flag: "normal" },
        { name: "TTPa", value: "36 s", ref: "25 - 35", flag: "alto" },
      ]
    case "inmunologia":
      return [
        { name: "PCR", value: "7 mg/L", ref: "< 5", flag: "alto" },
        { name: "IgG", value: "980 mg/dL", ref: "700 - 1600", flag: "normal" },
      ]
    default:
      return [
        { name: "Parámetro A", value: "—", ref: "—", flag: "normal" },
        { name: "Parámetro B", value: "—", ref: "—", flag: "normal" },
      ]
  }
}

function mockConclusion(selected: number | null, examTypes: ExamType[]): string {
  const category = getExamCategory(selected, examTypes)
  
  switch (category) {
    case "hemograma":
      return "Leve leucocitosis que podría sugerir proceso infeccioso o inflamatorio agudo. Correlacionar con clínica."
    case "bioquimico":
      return "Alteración leve del metabolismo de carbohidratos y lípidos. Sugerido control dietario y repetición en 3 meses."
    case "electrolitos":
      return "Hipopotasemia leve. Considerar reposición y evaluación de pérdidas gastrointestinales o renales."
    case "marcadores_tumorales":
      return "Ligero aumento de CA-125. El resultado debe interpretarse con estudios de imagen y evaluación ginecológica."
    case "coagulacion":
      return "Tiempo de TTPa discretamente prolongado; evaluar medicación concomitante y función hepática si clínicamente indicado."
    case "inmunologia":
      return "PCR elevada sugiere proceso inflamatorio activo. Recomendada correlación con síntomas y otros marcadores."
    default:
      return "Resultados simulados a la espera de un examen seleccionado."
  }
}

