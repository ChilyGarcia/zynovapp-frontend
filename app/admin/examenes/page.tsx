"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NavbarComponent from "@/components/navbar/navbar-component"
import FooterComponent from "@/components/footer/footer-component"
import SidebarComponent from "@/components/sidebar/sidebar-component"
import { useAuth } from "@/contexts/auth-context"
import { API_ENDPOINTS } from "@/lib/api-config"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import type { ExamType, ExamTypesResponse } from "@/lib/types"
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  FlaskConical,
  List,
  Ruler,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { darkenColor } from "@/lib/color-utils"

// Tipos para parámetros y unidades
interface ExamParameter {
  id?: number
  exam_type_id: number
  parameter_name: string
  parameter_code?: string
  unit_id: number
  reference_min?: string
  reference_max?: string
  reference_text?: string
  is_active: boolean
}

interface MeasurementUnit {
  id: number
  name: string
  symbol: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Tipos para Exam Templates
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

// Tipo auxiliar para las preguntas en el formulario de plantilla
type TemplateQuestionInput = {
  parameter_name: string
  parameter_code: string
  description: string
  unit_type_id: number
  reference_min: string
  reference_max: string
  reference_text: string
  notes_placeholder: string
  order: number
  is_required: boolean
}

export default function AdminExamenesPage(): React.JSX.Element {
  const { user, laboratoryColor } = useAuth()
  const activeColor = laboratoryColor || "#6366F1"

  // Estados para Exámenes
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [examError, setExamError] = useState<string | null>(null)
  
  // Estados para Exam Templates
  const [examTemplates, setExamTemplates] = useState<ExamTemplate[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<{ templateId: number; question: ExamTemplateQuestion | null } | null>(null)
  const [questionToDelete, setQuestionToDelete] = useState<{ templateId: number; questionId: number } | null>(null)
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [isSavingQuestion, setIsSavingQuestion] = useState(false)
  const [questionFormData, setQuestionFormData] = useState({
    parameter_name: "",
    parameter_code: "",
    description: "",
    unit_type_id: 0,
    reference_min: "",
    reference_max: "",
    reference_text: "",
    notes_placeholder: "",
    order: 0,
    is_required: true,
  })
  const [templateFormData, setTemplateFormData] = useState({
    name: "",
    description: "",
    exam_type_id: 0,
  })
  const [templateQuestions, setTemplateQuestions] = useState<TemplateQuestionInput[]>([])
  const [showExamDialog, setShowExamDialog] = useState(false)
  const [editingExam, setEditingExam] = useState<ExamType | null>(null)
  const [examToDelete, setExamToDelete] = useState<number | null>(null)
  const [isSavingExam, setIsSavingExam] = useState(false)
  const [examFormData, setExamFormData] = useState({
    name: "",
    code: "",
    category: "",
    description: "",
    is_active: true,
  })

  // Estados para Parámetros
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)
  const [parameters, setParameters] = useState<ExamParameter[]>([])
  const [isLoadingParameters, setIsLoadingParameters] = useState(false)
  const [showParameterDialog, setShowParameterDialog] = useState(false)
  const [editingParameter, setEditingParameter] = useState<ExamParameter | null>(null)
  const [parameterToDelete, setParameterToDelete] = useState<number | null>(null)
  const [isSavingParameter, setIsSavingParameter] = useState(false)
  const [parameterFormData, setParameterFormData] = useState<Omit<ExamParameter, "exam_type_id">>({
    parameter_name: "",
    parameter_code: "",
    unit_id: 0,
    reference_min: "",
    reference_max: "",
    reference_text: "",
    is_active: true,
  })

  // Estados para Unidades de Medida
  const [units, setUnits] = useState<MeasurementUnit[]>([])
  const [isLoadingUnits, setIsLoadingUnits] = useState(true)
  const [showUnitDialog, setShowUnitDialog] = useState(false)
  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null)
  const [unitToDelete, setUnitToDelete] = useState<number | null>(null)
  const [isSavingUnit, setIsSavingUnit] = useState(false)
  const [unitFormData, setUnitFormData] = useState({
    name: "",
    symbol: "",
    description: "",
  })

  const fetchExamTypes = async () => {
    try {
      setIsLoadingExams(true)
      setExamError(null)
      const response = await fetchWithAuth(API_ENDPOINTS.laboratoryExamTypes)
      
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

  const fetchParameters = async (examTypeId: number) => {
    try {
      setIsLoadingParameters(true)
      const response = await fetchWithAuth(API_ENDPOINTS.examParameters(examTypeId))
      
      if (!response.ok) {
        throw new Error("Error al cargar los parámetros")
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setParameters(data.data)
      } else {
        setParameters([])
      }
    } catch (error) {
      console.error("Error al cargar parámetros:", error)
      setParameters([])
    } finally {
      setIsLoadingParameters(false)
    }
  }

  const fetchUnits = async () => {
    try {
      setIsLoadingUnits(true)
      const response = await fetchWithAuth(API_ENDPOINTS.measurementUnits)
      
      if (!response.ok) {
        throw new Error("Error al cargar las unidades de medida")
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setUnits(data.data)
      } else {
        setUnits([])
      }
    } catch (error) {
      console.error("Error al cargar unidades:", error)
      setUnits([])
    } finally {
      setIsLoadingUnits(false)
    }
  }

  // Cargar exámenes y unidades
  useEffect(() => {
    fetchExamTypes()
    fetchExamTemplates()
    fetchUnits()
  }, [])

  // Cargar parámetros cuando se selecciona un examen
  useEffect(() => {
    if (selectedExamId) {
      fetchParameters(selectedExamId)
    } else {
      setParameters([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamId])

  // Funciones para Exámenes
  const handleOpenExamDialog = (exam?: ExamType) => {
    if (exam) {
      setEditingExam(exam)
      setExamFormData({
        name: exam.name,
        code: exam.code,
        category: exam.category,
        description: exam.description,
        is_active: exam.is_active,
      })
    } else {
      setEditingExam(null)
      setExamFormData({
        name: "",
        code: "",
        category: "",
        description: "",
        is_active: true,
      })
    }
    setShowExamDialog(true)
  }

  const handleSaveExam = async () => {
    try {
      setIsSavingExam(true)
      const url = editingExam 
        ? API_ENDPOINTS.laboratoryExamType(editingExam.id)
        : API_ENDPOINTS.laboratoryExamTypes
      
      const method = editingExam ? "PUT" : "POST"
      
      const response = await fetchWithAuth(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examFormData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar el examen")
      }

      await fetchExamTypes()
      setShowExamDialog(false)
      setEditingExam(null)
    } catch (error) {
      console.error("Error al guardar examen:", error)
      alert(error instanceof Error ? error.message : "Error al guardar el examen")
    } finally {
      setIsSavingExam(false)
    }
  }

  const handleDeleteExam = async () => {
    if (!examToDelete) return

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.laboratoryExamType(examToDelete), {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Error al eliminar el examen")
      }

      await fetchExamTypes()
      setExamToDelete(null)
    } catch (error) {
      console.error("Error al eliminar examen:", error)
      alert(error instanceof Error ? error.message : "Error al eliminar el examen")
    }
  }

  // Funciones para Parámetros
  const handleOpenParameterDialog = (parameter?: ExamParameter) => {
    if (parameter) {
      setEditingParameter(parameter)
      setParameterFormData({
        parameter_name: parameter.parameter_name,
        parameter_code: parameter.parameter_code || "",
        unit_id: parameter.unit_id,
        reference_min: parameter.reference_min || "",
        reference_max: parameter.reference_max || "",
        reference_text: parameter.reference_text || "",
        is_active: parameter.is_active,
      })
    } else {
      setEditingParameter(null)
      setParameterFormData({
        parameter_name: "",
        parameter_code: "",
        unit_id: units.length > 0 ? units[0].id : 0,
        reference_min: "",
        reference_max: "",
        reference_text: "",
        is_active: true,
      })
    }
    setShowParameterDialog(true)
  }

  const handleSaveParameter = async () => {
    if (!selectedExamId) {
      alert("Por favor selecciona un examen primero")
      return
    }

    try {
      setIsSavingParameter(true)
      const url = editingParameter && editingParameter.id
        ? API_ENDPOINTS.examParameter(selectedExamId, editingParameter.id)
        : API_ENDPOINTS.examParameters(selectedExamId)
      
      const method = editingParameter && editingParameter.id ? "PUT" : "POST"
      
      const payload = {
        ...parameterFormData,
        exam_type_id: selectedExamId,
      }

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar el parámetro")
      }

      await fetchParameters(selectedExamId)
      setShowParameterDialog(false)
      setEditingParameter(null)
    } catch (error) {
      console.error("Error al guardar parámetro:", error)
      alert(error instanceof Error ? error.message : "Error al guardar el parámetro")
    } finally {
      setIsSavingParameter(false)
    }
  }

  const handleDeleteParameter = async () => {
    if (!parameterToDelete || !selectedExamId) return

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.examParameter(selectedExamId, parameterToDelete), {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Error al eliminar el parámetro")
      }

      await fetchParameters(selectedExamId)
      setParameterToDelete(null)
    } catch (error) {
      console.error("Error al eliminar parámetro:", error)
      alert(error instanceof Error ? error.message : "Error al eliminar el parámetro")
    }
  }

  // Funciones para Unidades de Medida
  const handleOpenUnitDialog = (unit?: MeasurementUnit) => {
    if (unit) {
      setEditingUnit(unit)
      setUnitFormData({
        name: unit.name,
        symbol: unit.symbol,
        description: unit.description || "",
      })
    } else {
      setEditingUnit(null)
      setUnitFormData({
        name: "",
        symbol: "",
        description: "",
      })
    }
    setShowUnitDialog(true)
  }

  const handleSaveUnit = async () => {
    try {
      setIsSavingUnit(true)
      const url = editingUnit 
        ? API_ENDPOINTS.measurementUnit(editingUnit.id)
        : API_ENDPOINTS.measurementUnits
      
      const method = editingUnit ? "PUT" : "POST"
      
      const response = await fetchWithAuth(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(unitFormData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar la unidad")
      }

      await fetchUnits()
      setShowUnitDialog(false)
      setEditingUnit(null)
    } catch (error) {
      console.error("Error al guardar unidad:", error)
      alert(error instanceof Error ? error.message : "Error al guardar la unidad")
    } finally {
      setIsSavingUnit(false)
    }
  }

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.measurementUnit(unitToDelete), {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Error al eliminar la unidad")
      }

      await fetchUnits()
      setUnitToDelete(null)
    } catch (error) {
      console.error("Error al eliminar unidad:", error)
      alert(error instanceof Error ? error.message : "Error al eliminar la unidad")
    }
  }

  // Funciones para Exam Templates
  const handleOpenTemplateDialog = () => {
    setTemplateFormData({
      name: "",
      description: "",
      exam_type_id: 0,
    })
    setTemplateQuestions([])
    setShowTemplateDialog(true)
  }

  const handleAddQuestion = () => {
    setTemplateQuestions([
      ...templateQuestions,
      {
        parameter_name: "",
        parameter_code: "",
        description: "",
        unit_type_id: units.length > 0 ? units[0].id : 0,
        reference_min: "",
        reference_max: "",
        reference_text: "",
        notes_placeholder: "",
        order: templateQuestions.length,
        is_required: true,
      },
    ])
  }

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = templateQuestions.filter((_, i) => i !== index)
    // Reordenar los índices
    const reorderedQuestions = newQuestions.map((q, i) => ({ ...q, order: i }))
    setTemplateQuestions(reorderedQuestions)
  }

  const handleUpdateQuestion = (index: number, field: string, value: string | number | boolean) => {
    const newQuestions = [...templateQuestions]
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    }
    setTemplateQuestions(newQuestions)
  }

  const handleSaveTemplate = async () => {
    if (!templateFormData.name || !templateFormData.exam_type_id) {
      alert("Por favor completa el nombre y selecciona un tipo de examen")
      return
    }

    if (templateQuestions.length === 0) {
      alert("Por favor agrega al menos una pregunta")
      return
    }

    // Validar que todas las preguntas tengan nombre y unidad
    for (let i = 0; i < templateQuestions.length; i++) {
      const q = templateQuestions[i]
      if (!q.parameter_name || !q.unit_type_id) {
        alert(`La pregunta ${i + 1} debe tener nombre y unidad de medida`)
        return
      }
    }

    try {
      setIsSavingTemplate(true)
      
      const payload = {
        name: templateFormData.name,
        description: templateFormData.description || null,
        exam_type_id: templateFormData.exam_type_id,
        questions: templateQuestions.map((q) => ({
          parameter_name: q.parameter_name,
          parameter_code: q.parameter_code || null,
          description: q.description || null,
          unit_type_id: q.unit_type_id,
          reference_min: q.reference_min || null,
          reference_max: q.reference_max || null,
          reference_text: q.reference_text || null,
          notes_placeholder: q.notes_placeholder || null,
          order: q.order,
          is_required: q.is_required,
        })),
      }

      const response = await fetchWithAuth(API_ENDPOINTS.examTemplates, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar la plantilla")
      }

      await fetchExamTemplates()
      setShowTemplateDialog(false)
      setTemplateFormData({
        name: "",
        description: "",
        exam_type_id: 0,
      })
      setTemplateQuestions([])
    } catch (error) {
      console.error("Error al guardar plantilla:", error)
      alert(error instanceof Error ? error.message : "Error al guardar la plantilla")
    } finally {
      setIsSavingTemplate(false)
    }
  }

  // Funciones para gestionar preguntas de plantillas
  const handleOpenQuestionDialog = (templateId: number, question?: ExamTemplateQuestion) => {
    if (question) {
      setEditingQuestion({ templateId, question })
      setQuestionFormData({
        parameter_name: question.parameter_name,
        parameter_code: question.parameter_code || "",
        description: question.description || "",
        unit_type_id: question.unit_type_id,
        reference_min: question.reference_min || "",
        reference_max: question.reference_max || "",
        reference_text: question.reference_text || "",
        notes_placeholder: question.notes_placeholder || "",
        order: question.order,
        is_required: question.is_required,
      })
    } else {
      const template = examTemplates.find((t) => t.id === templateId)
      const maxOrder = template && template.questions ? template.questions.length : 0
      setEditingQuestion({ templateId, question: null })
      setQuestionFormData({
        parameter_name: "",
        parameter_code: "",
        description: "",
        unit_type_id: units.length > 0 ? units[0].id : 0,
        reference_min: "",
        reference_max: "",
        reference_text: "",
        notes_placeholder: "",
        order: maxOrder,
        is_required: true,
      })
    }
    setShowQuestionDialog(true)
  }

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return

    if (!questionFormData.parameter_name || !questionFormData.unit_type_id) {
      alert("Por favor completa el nombre del parámetro y selecciona una unidad de medida")
      return
    }

    try {
      setIsSavingQuestion(true)
      const { templateId, question } = editingQuestion
      
      if (question && question.id) {
        // Actualizar pregunta existente
        const payload: any = {}
        if (questionFormData.parameter_name) payload.parameter_name = questionFormData.parameter_name
        if (questionFormData.description) payload.description = questionFormData.description
        if (questionFormData.reference_min) payload.reference_min = questionFormData.reference_min
        if (questionFormData.reference_max) payload.reference_max = questionFormData.reference_max
        if (questionFormData.reference_text) payload.reference_text = questionFormData.reference_text
        if (questionFormData.parameter_code) payload.parameter_code = questionFormData.parameter_code
        if (questionFormData.notes_placeholder) payload.notes_placeholder = questionFormData.notes_placeholder
        if (questionFormData.unit_type_id) payload.unit_type_id = questionFormData.unit_type_id
        if (questionFormData.order !== undefined) payload.order = questionFormData.order
        payload.is_required = questionFormData.is_required

        const response = await fetchWithAuth(
          API_ENDPOINTS.examTemplateQuestion(templateId, question.id),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Error al actualizar la pregunta")
        }
      } else {
        // Crear nueva pregunta
        const payload = {
          parameter_name: questionFormData.parameter_name,
          parameter_code: questionFormData.parameter_code || null,
          description: questionFormData.description || null,
          unit_type_id: questionFormData.unit_type_id,
          reference_min: questionFormData.reference_min || null,
          reference_max: questionFormData.reference_max || null,
          reference_text: questionFormData.reference_text || null,
          notes_placeholder: questionFormData.notes_placeholder || null,
          order: questionFormData.order,
          is_required: questionFormData.is_required,
        }

        const response = await fetchWithAuth(
          API_ENDPOINTS.examTemplateQuestions(templateId),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Error al crear la pregunta")
        }
      }

      await fetchExamTemplates()
      setShowQuestionDialog(false)
      setEditingQuestion(null)
    } catch (error) {
      console.error("Error al guardar pregunta:", error)
      alert(error instanceof Error ? error.message : "Error al guardar la pregunta")
    } finally {
      setIsSavingQuestion(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) {
      return
    }

    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.examTemplateQuestion(questionToDelete.templateId, questionToDelete.questionId),
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Error al eliminar la pregunta")
      }

      await fetchExamTemplates()
      setQuestionToDelete(null)
    } catch (error) {
      console.error("Error al eliminar pregunta:", error)
      alert(error instanceof Error ? error.message : "Error al eliminar la pregunta")
    }
  }

  const handleReorderQuestions = async (templateId: number, questions: ExamTemplateQuestion[]) => {
    try {
      const payload = {
        questions: questions.map((q, index) => ({
          id: q.id,
          order: index,
        })),
      }

      const response = await fetchWithAuth(API_ENDPOINTS.examTemplateReorder(templateId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al reordenar las preguntas")
      }

      await fetchExamTemplates()
    } catch (error) {
      console.error("Error al reordenar preguntas:", error)
      alert(error instanceof Error ? error.message : "Error al reordenar las preguntas")
    }
  }

  const handleMoveQuestion = async (templateId: number, questionIndex: number, direction: "up" | "down") => {
    const template = examTemplates.find((t) => t.id === templateId)
    if (!template) {
      return
    }

    const questions = [...template.questions].sort((a, b) => a.order - b.order)
    const newIndex = direction === "up" ? questionIndex - 1 : questionIndex + 1

    if (newIndex < 0 || newIndex >= questions.length) {
      return
    }

    // Intercambiar posiciones
    const temp = questions[questionIndex]
    questions[questionIndex] = questions[newIndex]
    questions[newIndex] = temp

    await handleReorderQuestions(templateId, questions)
  }

  // Render del componente
  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col">
      <div className="flex flex-1">
        <SidebarComponent />
        <div className="flex-1 flex flex-col">
          <NavbarComponent />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Settings className="w-6 h-6" style={{ color: activeColor }} />
                  Configuración de Exámenes
                </h1>
                <p className="text-gray-600">Gestiona exámenes, parámetros y unidades de medida</p>
              </div>

              <Tabs defaultValue="examenes" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="examenes" className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Exámenes
                  </TabsTrigger>
                  <TabsTrigger value="parametros" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Parámetros
                  </TabsTrigger>
                  <TabsTrigger value="unidades" className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Unidades de Medida
                  </TabsTrigger>
                </TabsList>

                {/* Tab de Exámenes */}
                <TabsContent value="examenes" className="space-y-4">
                  {/* Sección de Tipos de Examen */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Tipos de Examen</CardTitle>
                          <CardDescription>Gestiona los tipos de examen disponibles en tu laboratorio</CardDescription>
                        </div>
                        <Button
                          onClick={() => handleOpenExamDialog()}
                          style={{ backgroundColor: activeColor }}
                          className="text-white hover:opacity-90"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Tipo de Examen
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingExams ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin" style={{ color: activeColor }} />
                          <span className="ml-3 text-gray-600">Cargando tipos de examen...</span>
                        </div>
                      ) : examError ? (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <p className="text-sm text-red-700">{examError}</p>
                        </div>
                      ) : examTypes.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <FlaskConical className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No hay tipos de examen registrados</p>
                          <p className="text-sm mt-2">Crea tu primer tipo de examen para comenzar</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {examTypes.map((exam) => (
                            <Card key={exam.id} className="border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-gray-900">{exam.name}</h3>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        exam.is_active 
                                          ? "bg-green-100 text-green-700" 
                                          : "bg-gray-100 text-gray-700"
                                      }`}>
                                        {exam.is_active ? "Activo" : "Inactivo"}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      <span className="font-medium">Código:</span> {exam.code}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      <span className="font-medium">Categoría:</span> {exam.category}
                                    </p>
                                    {exam.description && (
                                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{exam.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 ml-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenExamDialog(exam)}
                                      title="Editar"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setExamToDelete(exam.id)}
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sección de Plantillas de Examen */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Plantillas de Exámenes</CardTitle>
                          <CardDescription>Lista de plantillas de exámenes con sus preguntas y parámetros</CardDescription>
                        </div>
                        <Button
                          onClick={handleOpenTemplateDialog}
                          style={{ backgroundColor: activeColor }}
                          className="text-white hover:opacity-90"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nueva Plantilla
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingTemplates ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin" style={{ color: activeColor }} />
                          <span className="ml-3 text-gray-600">Cargando plantillas de exámenes...</span>
                        </div>
                      ) : templatesError ? (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <p className="text-sm text-red-700">{templatesError}</p>
                        </div>
                      ) : examTemplates.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <FlaskConical className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No hay plantillas de exámenes registradas</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {examTemplates.map((template) => (
                            <Card key={template.id} className="border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        template.is_active 
                                          ? "bg-green-100 text-green-700" 
                                          : "bg-gray-100 text-gray-700"
                                      }`}>
                                        {template.is_active ? "Activo" : "Inactivo"}
                                      </span>
                                    </div>
                                    {template.description && (
                                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                    )}
                                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                      <span>Tipo: <strong>{template.exam_type.name}</strong></span>
                                      <span>Código: <strong>{template.exam_type.code}</strong></span>
                                      <span>Categoría: <strong>{template.exam_type.category}</strong></span>
                                    </div>
                                    <div className="mt-2">
                                      <span className="text-xs text-gray-500">
                                        Preguntas: <strong>{template.questions.length}</strong>
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                                  >
                                    {expandedTemplate === template.id ? (
                                      <>
                                        <ChevronUp className="w-4 h-4 mr-2" />
                                        Ocultar
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-4 h-4 mr-2" />
                                        Ver Preguntas
                                      </>
                                    )}
                                  </Button>
                                </div>
                                
                                {expandedTemplate === template.id && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="text-sm font-semibold text-gray-900">Preguntas del Examen</h4>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenQuestionDialog(template.id)}
                                        style={{ borderColor: activeColor, color: activeColor }}
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Agregar Pregunta
                                      </Button>
                                    </div>
                                    {template.questions.length === 0 ? (
                                      <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                                        <List className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm">No hay preguntas en esta plantilla</p>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        {template.questions
                                          .sort((a, b) => a.order - b.order)
                                          .map((question, questionIndex) => (
                                            <div
                                              key={question.id}
                                              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                              <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                      {question.parameter_name}
                                                    </span>
                                                    {question.parameter_code && (
                                                      <span className="text-xs text-gray-500">
                                                        ({question.parameter_code})
                                                      </span>
                                                    )}
                                                    {question.is_required && (
                                                      <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                                                        Requerido
                                                      </span>
                                                    )}
                                                  </div>
                                                  {question.description && (
                                                    <p className="text-xs text-gray-600 mt-1">{question.description}</p>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMoveQuestion(template.id, questionIndex, "up")}
                                                    disabled={questionIndex === 0}
                                                    title="Mover arriba"
                                                  >
                                                    <ArrowUp className="w-4 h-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMoveQuestion(template.id, questionIndex, "down")}
                                                    disabled={questionIndex === template.questions.length - 1}
                                                    title="Mover abajo"
                                                  >
                                                    <ArrowDown className="w-4 h-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenQuestionDialog(template.id, question)}
                                                    title="Editar"
                                                  >
                                                    <Edit className="w-4 h-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setQuestionToDelete({ templateId: template.id, questionId: question.id })}
                                                    title="Eliminar"
                                                  >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                  </Button>
                                                </div>
                                              </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                                              <div>
                                                <span className="text-gray-500">Unidad:</span>
                                                <span className="ml-1 font-medium text-gray-900">
                                                  {question.unit_type.symbol}
                                                </span>
                                              </div>
                                              {question.reference_min && (
                                                <div>
                                                  <span className="text-gray-500">Mín:</span>
                                                  <span className="ml-1 font-medium text-gray-900">
                                                    {question.reference_min}
                                                  </span>
                                                </div>
                                              )}
                                              {question.reference_max && (
                                                <div>
                                                  <span className="text-gray-500">Máx:</span>
                                                  <span className="ml-1 font-medium text-gray-900">
                                                    {question.reference_max}
                                                  </span>
                                                </div>
                                              )}
                                              {question.reference_text && (
                                                <div className="md:col-span-2">
                                                  <span className="text-gray-500">Ref:</span>
                                                  <span className="ml-1 font-medium text-gray-900">
                                                    {question.reference_text}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                            {question.notes_placeholder && (
                                              <div className="mt-2 text-xs text-gray-500 italic">
                                                {question.notes_placeholder}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab de Parámetros */}
                <TabsContent value="parametros" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Parámetros de Exámenes</CardTitle>
                          <CardDescription>Gestiona los parámetros (preguntas) para cada examen</CardDescription>
                        </div>
                        <Button
                          onClick={() => handleOpenParameterDialog()}
                          disabled={!selectedExamId}
                          style={{ backgroundColor: activeColor }}
                          className="text-white hover:opacity-90 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Parámetro
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Label>Selecciona un examen</Label>
                        <Select
                          value={selectedExamId?.toString() || ""}
                          onValueChange={(value) => setSelectedExamId(parseInt(value))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Selecciona un examen" />
                          </SelectTrigger>
                          <SelectContent>
                            {examTypes.map((exam) => (
                              <SelectItem key={exam.id} value={exam.id.toString()}>
                                {exam.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedExamId ? (
                        isLoadingParameters ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: activeColor }} />
                            <span className="ml-3 text-gray-600">Cargando parámetros...</span>
                          </div>
                        ) : parameters.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <List className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>No hay parámetros registrados para este examen</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {parameters.map((param) => (
                              <Card key={param.id} className="border-gray-200">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">{param.parameter_name}</h3>
                                        {param.parameter_code && (
                                          <span className="text-xs text-gray-500">({param.parameter_code})</span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        Unidad: {units.find(u => u.id === param.unit_id)?.symbol || param.unit_id}
                                      </p>
                                      {(param.reference_min || param.reference_max) && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Referencia: {param.reference_min || "—"} - {param.reference_max || "—"}
                                        </p>
                                      )}
                                      {param.reference_text && (
                                        <p className="text-xs text-gray-500 mt-1">{param.reference_text}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenParameterDialog(param)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setParameterToDelete(param.id || null)}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <List className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>Selecciona un examen para ver sus parámetros</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab de Unidades de Medida */}
                <TabsContent value="unidades" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Unidades de Medida</CardTitle>
                          <CardDescription>Gestiona las unidades de medida disponibles</CardDescription>
                        </div>
                        <Button
                          onClick={() => handleOpenUnitDialog()}
                          style={{ backgroundColor: activeColor }}
                          className="text-white hover:opacity-90"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nueva Unidad
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingUnits ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin" style={{ color: activeColor }} />
                          <span className="ml-3 text-gray-600">Cargando unidades...</span>
                        </div>
                      ) : units.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Ruler className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No hay unidades de medida registradas</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {units.map((unit) => (
                            <Card key={unit.id} className="border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{unit.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">Símbolo: {unit.symbol}</p>
                                    {unit.description && (
                                      <p className="text-xs text-gray-500 mt-2">{unit.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenUnitDialog(unit)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setUnitToDelete(unit.id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <FooterComponent />

      {/* Dialog para Exámenes */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingExam ? "Editar Examen" : "Nuevo Examen"}</DialogTitle>
            <DialogDescription>
              {editingExam ? "Modifica la información del examen" : "Completa la información para crear un nuevo examen"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exam-name">Nombre *</Label>
              <Input
                id="exam-name"
                value={examFormData.name}
                onChange={(e) => setExamFormData({ ...examFormData, name: e.target.value })}
                placeholder="Ej: Hemograma Completo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam-code">Código *</Label>
                <Input
                  id="exam-code"
                  value={examFormData.code}
                  onChange={(e) => setExamFormData({ ...examFormData, code: e.target.value })}
                  placeholder="Ej: HEMO-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-category">Categoría *</Label>
                <Input
                  id="exam-category"
                  value={examFormData.category}
                  onChange={(e) => setExamFormData({ ...examFormData, category: e.target.value })}
                  placeholder="Ej: hemograma"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-description">Descripción</Label>
              <Textarea
                id="exam-description"
                value={examFormData.description}
                onChange={(e) => setExamFormData({ ...examFormData, description: e.target.value })}
                placeholder="Descripción del examen..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="exam-active"
                checked={examFormData.is_active}
                onChange={(e) => setExamFormData({ ...examFormData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="exam-active">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExamDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveExam}
              disabled={isSavingExam || !examFormData.name || !examFormData.code || !examFormData.category}
              style={{ backgroundColor: activeColor }}
              className="text-white hover:opacity-90"
            >
              {isSavingExam ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Parámetros */}
      <Dialog open={showParameterDialog} onOpenChange={setShowParameterDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingParameter ? "Editar Parámetro" : "Nuevo Parámetro"}</DialogTitle>
            <DialogDescription>
              {editingParameter ? "Modifica la información del parámetro" : "Completa la información para crear un nuevo parámetro"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="param-name">Nombre del Parámetro *</Label>
              <Input
                id="param-name"
                value={parameterFormData.parameter_name}
                onChange={(e) => setParameterFormData({ ...parameterFormData, parameter_name: e.target.value })}
                placeholder="Ej: Hemoglobina"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="param-code">Código del Parámetro</Label>
                <Input
                  id="param-code"
                  value={parameterFormData.parameter_code}
                  onChange={(e) => setParameterFormData({ ...parameterFormData, parameter_code: e.target.value })}
                  placeholder="Ej: HGB"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="param-unit">Unidad de Medida *</Label>
                <Select
                  value={parameterFormData.unit_id.toString()}
                  onValueChange={(value) => setParameterFormData({ ...parameterFormData, unit_id: parseInt(value) })}
                >
                  <SelectTrigger id="param-unit">
                    <SelectValue placeholder="Selecciona una unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.name} ({unit.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="param-min">Valor Mínimo de Referencia</Label>
                <Input
                  id="param-min"
                  type="number"
                  value={parameterFormData.reference_min}
                  onChange={(e) => setParameterFormData({ ...parameterFormData, reference_min: e.target.value })}
                  placeholder="Ej: 13.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="param-max">Valor Máximo de Referencia</Label>
                <Input
                  id="param-max"
                  type="number"
                  value={parameterFormData.reference_max}
                  onChange={(e) => setParameterFormData({ ...parameterFormData, reference_max: e.target.value })}
                  placeholder="Ej: 17.5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="param-text">Texto de Referencia</Label>
              <Textarea
                id="param-text"
                value={parameterFormData.reference_text}
                onChange={(e) => setParameterFormData({ ...parameterFormData, reference_text: e.target.value })}
                placeholder="Ej: Negativo, Positivo, etc."
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="param-active"
                checked={parameterFormData.is_active}
                onChange={(e) => setParameterFormData({ ...parameterFormData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="param-active">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParameterDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveParameter}
              disabled={isSavingParameter || !parameterFormData.parameter_name || !parameterFormData.unit_id}
              style={{ backgroundColor: activeColor }}
              className="text-white hover:opacity-90"
            >
              {isSavingParameter ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Unidades de Medida */}
      <Dialog open={showUnitDialog} onOpenChange={setShowUnitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUnit ? "Editar Unidad de Medida" : "Nueva Unidad de Medida"}</DialogTitle>
            <DialogDescription>
              {editingUnit ? "Modifica la información de la unidad" : "Completa la información para crear una nueva unidad de medida"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unit-name">Nombre *</Label>
              <Input
                id="unit-name"
                value={unitFormData.name}
                onChange={(e) => setUnitFormData({ ...unitFormData, name: e.target.value })}
                placeholder="Ej: Gramos por decilitro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-symbol">Símbolo *</Label>
              <Input
                id="unit-symbol"
                value={unitFormData.symbol}
                onChange={(e) => setUnitFormData({ ...unitFormData, symbol: e.target.value })}
                placeholder="Ej: g/dL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-description">Descripción</Label>
              <Textarea
                id="unit-description"
                value={unitFormData.description}
                onChange={(e) => setUnitFormData({ ...unitFormData, description: e.target.value })}
                placeholder="Descripción opcional de la unidad..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnitDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveUnit}
              disabled={isSavingUnit || !unitFormData.name || !unitFormData.symbol}
              style={{ backgroundColor: activeColor }}
              className="text-white hover:opacity-90"
            >
              {isSavingUnit ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmar eliminación de Examen */}
      <AlertDialog open={examToDelete !== null} onOpenChange={() => setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el examen y todos sus parámetros asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExam}
              style={{ backgroundColor: "#ef4444" }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para confirmar eliminación de Parámetro */}
      <AlertDialog open={parameterToDelete !== null} onOpenChange={() => setParameterToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el parámetro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteParameter}
              style={{ backgroundColor: "#ef4444" }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para confirmar eliminación de Unidad */}
      <AlertDialog open={unitToDelete !== null} onOpenChange={() => setUnitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la unidad de medida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUnit}
              style={{ backgroundColor: "#ef4444" }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para confirmar eliminación de Pregunta */}
      <AlertDialog open={questionToDelete !== null} onOpenChange={() => setQuestionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la pregunta de la plantilla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestion}
              style={{ backgroundColor: "#ef4444" }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para editar/crear Pregunta de Plantilla */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion?.question?.id ? "Editar Pregunta" : "Nueva Pregunta"}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion?.question?.id
                ? "Modifica la información de la pregunta"
                : "Completa la información para agregar una nueva pregunta a la plantilla"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question-param-name">Nombre del Parámetro *</Label>
              <Input
                id="question-param-name"
                value={questionFormData.parameter_name}
                onChange={(e) => setQuestionFormData({ ...questionFormData, parameter_name: e.target.value })}
                placeholder="Ej: Glóbulos Rojos (RBC)"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="question-param-code">Código del Parámetro</Label>
                <Input
                  id="question-param-code"
                  value={questionFormData.parameter_code}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, parameter_code: e.target.value })}
                  placeholder="Ej: RBC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-order">Orden</Label>
                <Input
                  id="question-order"
                  type="number"
                  value={questionFormData.order}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, order: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-description">Descripción</Label>
              <Textarea
                id="question-description"
                value={questionFormData.description}
                onChange={(e) => setQuestionFormData({ ...questionFormData, description: e.target.value })}
                placeholder="Descripción del parámetro..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-unit">Unidad de Medida *</Label>
              <Select
                value={questionFormData.unit_type_id.toString()}
                onValueChange={(value) => setQuestionFormData({ ...questionFormData, unit_type_id: parseInt(value) })}
              >
                <SelectTrigger id="question-unit">
                  <SelectValue placeholder="Selecciona una unidad" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="question-ref-min">Valor Mínimo de Referencia</Label>
                <Input
                  id="question-ref-min"
                  type="number"
                  step="any"
                  value={questionFormData.reference_min}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, reference_min: e.target.value })}
                  placeholder="Ej: 4.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-ref-max">Valor Máximo de Referencia</Label>
                <Input
                  id="question-ref-max"
                  type="number"
                  step="any"
                  value={questionFormData.reference_max}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, reference_max: e.target.value })}
                  placeholder="Ej: 5.5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-ref-text">Texto de Referencia</Label>
              <Input
                id="question-ref-text"
                value={questionFormData.reference_text}
                onChange={(e) => setQuestionFormData({ ...questionFormData, reference_text: e.target.value })}
                placeholder="Ej: Negativo, Positivo, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-notes">Placeholder de Notas</Label>
              <Input
                id="question-notes"
                value={questionFormData.notes_placeholder}
                onChange={(e) => setQuestionFormData({ ...questionFormData, notes_placeholder: e.target.value })}
                placeholder="Ej: Valor normal entre 4.5 y 5.5 millones/µL"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="question-required"
                checked={questionFormData.is_required}
                onChange={(e) => setQuestionFormData({ ...questionFormData, is_required: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="question-required">Pregunta Requerida</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveQuestion}
              disabled={isSavingQuestion || !questionFormData.parameter_name || !questionFormData.unit_type_id}
              style={{ backgroundColor: activeColor }}
              className="text-white hover:opacity-90"
            >
              {isSavingQuestion ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear Plantilla de Examen */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Plantilla de Examen</DialogTitle>
            <DialogDescription>
              Crea una nueva plantilla de examen con sus preguntas y parámetros
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Información básica de la plantilla */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Información de la Plantilla</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Nombre de la Plantilla *</Label>
                  <Input
                    id="template-name"
                    value={templateFormData.name}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                    placeholder="Ej: Hemograma Completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-description">Descripción</Label>
                  <Textarea
                    id="template-description"
                    value={templateFormData.description}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                    placeholder="Descripción de la plantilla..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-exam-type">Tipo de Examen *</Label>
                  <Select
                    value={templateFormData.exam_type_id.toString()}
                    onValueChange={(value) => setTemplateFormData({ ...templateFormData, exam_type_id: parseInt(value) })}
                  >
                    <SelectTrigger id="template-exam-type">
                      <SelectValue placeholder="Selecciona un tipo de examen" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id.toString()}>
                          {exam.name} ({exam.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Preguntas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Preguntas del Examen</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddQuestion}
                  style={{ borderColor: activeColor, color: activeColor }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Pregunta
                </Button>
              </div>

              {templateQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  <List className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No hay preguntas agregadas</p>
                  <p className="text-xs mt-1">Haz clic en "Agregar Pregunta" para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {templateQuestions.map((question, index) => (
                    <Card key={index} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">
                            Pregunta {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nombre del Parámetro *</Label>
                              <Input
                                value={question.parameter_name}
                                onChange={(e) => handleUpdateQuestion(index, "parameter_name", e.target.value)}
                                placeholder="Ej: Glóbulos Rojos (RBC)"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Código del Parámetro</Label>
                              <Input
                                value={question.parameter_code}
                                onChange={(e) => handleUpdateQuestion(index, "parameter_code", e.target.value)}
                                placeholder="Ej: RBC"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                              value={question.description}
                              onChange={(e) => handleUpdateQuestion(index, "description", e.target.value)}
                              placeholder="Descripción del parámetro..."
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label>Unidad de Medida *</Label>
                              <Select
                                value={question.unit_type_id.toString()}
                                onValueChange={(value) => handleUpdateQuestion(index, "unit_type_id", parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona una unidad" />
                                </SelectTrigger>
                                <SelectContent>
                                  {units.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                      {unit.name} ({unit.symbol})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Orden</Label>
                              <Input
                                type="number"
                                value={question.order}
                                onChange={(e) => handleUpdateQuestion(index, "order", parseInt(e.target.value) || 0)}
                                min={0}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Valor Mínimo de Referencia</Label>
                              <Input
                                type="number"
                                step="any"
                                value={question.reference_min}
                                onChange={(e) => handleUpdateQuestion(index, "reference_min", e.target.value)}
                                placeholder="Ej: 4.5"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Valor Máximo de Referencia</Label>
                              <Input
                                type="number"
                                step="any"
                                value={question.reference_max}
                                onChange={(e) => handleUpdateQuestion(index, "reference_max", e.target.value)}
                                placeholder="Ej: 5.5"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Texto de Referencia</Label>
                            <Input
                              value={question.reference_text}
                              onChange={(e) => handleUpdateQuestion(index, "reference_text", e.target.value)}
                              placeholder="Ej: Negativo, Positivo, etc."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Placeholder de Notas</Label>
                            <Input
                              value={question.notes_placeholder}
                              onChange={(e) => handleUpdateQuestion(index, "notes_placeholder", e.target.value)}
                              placeholder="Ej: Valor normal entre 4.5 y 5.5 millones/µL"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={question.is_required}
                              onChange={(e) => handleUpdateQuestion(index, "is_required", e.target.checked)}
                              className="rounded"
                            />
                            <Label>Pregunta Requerida</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate || !templateFormData.name || !templateFormData.exam_type_id || templateQuestions.length === 0}
              style={{ backgroundColor: activeColor }}
              className="text-white hover:opacity-90"
            >
              {isSavingTemplate ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Plantilla"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

