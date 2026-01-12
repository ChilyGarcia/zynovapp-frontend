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
  laboratoryExamsSearch: (documentNumber: string, status?: string) => {
    const params = new URLSearchParams({ document_number: documentNumber })
    if (status) params.append('status', status)
    return `${API_URL}/api/laboratory/exams/search?${params.toString()}`
  },
  // Agrega más endpoints aquí según necesites
}

