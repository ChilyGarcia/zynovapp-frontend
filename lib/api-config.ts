// Configuración del API
// La URL se puede configurar mediante la variable de entorno NEXT_PUBLIC_API_URL
// Para desarrollo local, crea un archivo .env.local con: NEXT_PUBLIC_API_URL=http://localhost:8000
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://apizynovapp.zynovapp.com"

export const API_ENDPOINTS = {
  login: `${API_URL}/api/auth/login`,
  logout: `${API_URL}/api/auth/logout`,
  me: `${API_URL}/api/auth/me`,
  authProfile: `${API_URL}/api/auth/profile`,
  examTypes: `${API_URL}/api/exam-types`,
  examType: (id: number) => `${API_URL}/api/exam-types/${id}`,
  // Endpoints de laboratorio para tipos de examen
  laboratoryExamTypes: `${API_URL}/api/laboratory/exam-types`,
  laboratoryExamType: (id: number) => `${API_URL}/api/laboratory/exam-types/${id}`,
  laboratoryExams: `${API_URL}/api/laboratory/exams`,
  patientExams: `${API_URL}/api/patient/exams`,
  examDetail: (id: number) => `${API_URL}/api/exams/${id}`,
  laboratoryProfile: `${API_URL}/api/laboratory/profile`,
  // Endpoints para configuración
  examParameters: (examTypeId: number) => `${API_URL}/api/exam-types/${examTypeId}/parameters`,
  examParameter: (examTypeId: number, parameterId: number) => `${API_URL}/api/exam-types/${examTypeId}/parameters/${parameterId}`,
  measurementUnits: `${API_URL}/api/laboratory/unit-types`,
  measurementUnit: (id: number) => `${API_URL}/api/laboratory/unit-types/${id}`,
  examTemplates: `${API_URL}/api/laboratory/exam-templates`,
  examTemplate: (id: number) => `${API_URL}/api/laboratory/exam-templates/${id}`,
  examTemplateQuestions: (templateId: number) => `${API_URL}/api/laboratory/exam-templates/${templateId}/questions`,
  examTemplateQuestion: (templateId: number, questionId: number) => `${API_URL}/api/laboratory/exam-templates/${templateId}/questions/${questionId}`,
  examTemplateReorder: (templateId: number) => `${API_URL}/api/laboratory/exam-templates/${templateId}/questions/reorder`,
  laboratoryExamsList: `${API_URL}/api/laboratory/exams`,
  laboratoryExam: (id: number) => `${API_URL}/api/laboratory/exams/${id}`,
  laboratoryExamQuestions: (examId: number) => `${API_URL}/api/laboratory/exams/${examId}/questions`,
  laboratoryExamResults: (examId: number) => `${API_URL}/api/laboratory/exams/${examId}/results`,
  laboratoryExamExportPDF: (id: number) => `${API_URL}/api/laboratory/exams/${id}/export-pdf`,
  laboratoryExamsSearch: (documentNumber: string, status?: string) => {
    const params = new URLSearchParams({ document_number: documentNumber })
    if (status) params.append('status', status)
    return `${API_URL}/api/laboratory/exams/search?${params.toString()}`
  },
  /** Tipos de solicitud (organización) */
  laboratoryRequestTypes: `${API_URL}/api/laboratory/request-types`,
  laboratoryRequestType: (id: number) =>
    `${API_URL}/api/laboratory/request-types/${id}`,
  /** Personal de la organización (selects médico / auxiliar) */
  laboratoryStaff: `${API_URL}/api/laboratory/staff`,
  /** Opciones para el formulario de nueva orden (selects + prioridades + pago) */
  laboratoryOrderFormOptions: `${API_URL}/api/laboratory/exams/order-form-options`,
  /** Estados del flujo de examen (etiquetas y orden) */
  laboratoryExamWorkflowStatuses: `${API_URL}/api/laboratory/exams/workflow-statuses`,
  /** Cambiar estado del examen (médico asignado) */
  laboratoryExamStatus: (id: number) =>
    `${API_URL}/api/laboratory/exams/${id}/status`,
  /** Muestras de inventario disponibles para vincular al pasar a muestra_tomada */
  laboratoryExamAvailableSamples: (examId: number) =>
    `${API_URL}/api/laboratory/exams/${examId}/available-samples`,
  /** Búsqueda de paciente por documento (solo organización del usuario) — siempre 200, revisar `found` */
  laboratoryPatientsSearch: (documentNumber: string) => {
    const q = new URLSearchParams({
      document_number: documentNumber.trim(),
    })
    return `${API_URL}/api/laboratory/patients/search?${q.toString()}`
  },
  laboratoryPatient: (id: number) =>
    `${API_URL}/api/laboratory/patients/${id}`,
  /** Lista de exámenes con filtros opcionales */
  laboratoryExamsQuery: (params?: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams()
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== "") q.set(k, String(v))
      }
    }
    const s = q.toString()
    return s
      ? `${API_URL}/api/laboratory/exams?${s}`
      : `${API_URL}/api/laboratory/exams`
  },
  /** Inventario de muestras (organización) */
  laboratorySamples: `${API_URL}/api/laboratory/samples`,
  laboratorySamplesStats: `${API_URL}/api/laboratory/samples/stats`,
  laboratorySample: (id: number) =>
    `${API_URL}/api/laboratory/samples/${id}`,
  laboratorySamplesQuery: (params?: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams()
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== "") q.set(k, String(v))
      }
    }
    const s = q.toString()
    return s
      ? `${API_URL}/api/laboratory/samples?${s}`
      : `${API_URL}/api/laboratory/samples`
  },
  // Agrega más endpoints aquí según necesites
}

