// Configuración del API
// Puedes cambiar esta URL según tu entorno
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const API_ENDPOINTS = {
  login: `${API_URL}/api/auth/login`,
  logout: `${API_URL}/api/auth/logout`,
  me: `${API_URL}/api/auth/me`,
  examTypes: `${API_URL}/api/exam-types`,
  laboratoryExams: `${API_URL}/api/laboratory/exams`,
  patientExams: `${API_URL}/api/patient/exams`,
  examDetail: (id: number) => `${API_URL}/api/exams/${id}`,
  // Agrega más endpoints aquí según necesites
}

