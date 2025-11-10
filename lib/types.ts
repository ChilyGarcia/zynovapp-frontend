// Tipos compartidos de la aplicación

export interface ExamType {
  id: number
  name: string
  code: string
  category: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExamTypesResponse {
  success: boolean
  data: ExamType[]
}

export interface Laboratory {
  id: number
  user_id: number
  name: string
  license_number: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  description: string
  logo: string | null
  opening_time: string | null
  closing_time: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: number
  user_id: number
  first_name: string
  last_name: string
  document_type: string
  document_number: string
  birth_date: string
  gender: string | null
  blood_type: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  created_at: string
  updated_at: string
}

export interface Exam {
  id: number
  laboratory_id: number
  patient_id: number
  exam_type_id: number
  order_number: string
  exam_date: string
  result_date: string
  status: string
  observations: string | null
  patient_notes: string | null
  report_file: string | null
  created_at: string
  updated_at: string
  laboratory: Laboratory
  exam_type: ExamType
  patient?: Patient
}

export interface ExamResult {
  id: number
  exam_id: number
  parameter_name: string
  parameter_code: string | null
  value: string
  unit: string
  reference_min: string | null
  reference_max: string | null
  reference_text: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ExamDetail extends Exam {
  results: ExamResult[]
}

export interface PaginationLink {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface PatientExamsResponse {
  success: boolean
  data: {
    current_page: number
    data: Exam[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: PaginationLink[]
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

export interface ExamDetailResponse {
  success: boolean
  data: ExamDetail
}

