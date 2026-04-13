/** Respuestas / payloads del flujo de órdenes médicas (laboratorio) */

export interface LaboratoryRequestType {
  id: number
  name: string
  code?: string | null
  sort_order?: number
}

export interface LaboratoryStaffUser {
  id: number
  name: string
  email?: string
  role?: string
}

export interface LaboratoryWorkflowStatus {
  slug: string
  label: string
  sort_order?: number
}

/**
 * El API puede enviar `key`, `code`, `name`, etc. en lugar de `slug`/`label`.
 * Sin esto, el stepper muestra "—" y no hay "siguiente estado".
 */
export function normalizeWorkflowStatusRow(
  raw: unknown
): LaboratoryWorkflowStatus | null {
  if (raw == null || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  const pickString = (...keys: string[]): string => {
    for (const k of keys) {
      const v = o[k]
      if (typeof v === "string" && v.trim()) return v.trim()
    }
    return ""
  }

  let slug = pickString(
    "slug",
    "key",
    "code",
    "status_key",
    "status_slug",
    "value",
    "status",
    "name"
  )
  const label = pickString(
    "label",
    "name",
    "title",
    "description",
    "slug",
    "key"
  )

  const sortRaw =
    o.sort_order ?? o.order ?? o.position ?? o.sort ?? o.sequence
  const sort_order =
    typeof sortRaw === "number" && Number.isFinite(sortRaw)
      ? sortRaw
      : typeof sortRaw === "string" && /^\d+$/.test(sortRaw)
        ? Number.parseInt(sortRaw, 10)
        : undefined

  if (!slug && label) {
    slug = label
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\s-]+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
  }

  if (!slug) return null

  return {
    slug,
    label: label || slug,
    sort_order,
  }
}

export type ExamPriorityApi = "normal" | "alta" | "urgente"

/** GET /api/laboratory/exams/order-form-options → data */
export interface OrderFormOptionPriority {
  value: string
  label: string
}

/** Fila de `request_types` en order-form-options (códigos del backend) */
export interface OrderFormOptionRequestType {
  id: number
  name: string
  code?: string | null
  sort_order?: number
}

/** Códigos de tipo de solicitud (tabla request_types / seed Laravel) */
export const REQUEST_TYPE_CODES = {
  LAB_EXAM: "examen_laboratorio",
  CONSULTATIONS: "consultas",
  IMAGING: "imagenes_diagnosticas",
  MEDICATIONS: "medicamentos",
  OTHER: "otros",
} as const

export interface OrderFormOptionsData {
  request_types: OrderFormOptionRequestType[]
  exam_types: { id: number; name: string }[]
  staff: { id: number; name: string }[]
  priorities: OrderFormOptionPriority[]
  /** Info del toggle is_paid (p. ej. default false = sin pagar) */
  payment?: {
    default_is_paid?: boolean
  }
}

/** GET /api/laboratory/patients/search — data cuando found === true */
export interface LaboratoryPatientSearchData {
  patient_id: number
  first_name?: string
  last_name?: string
  document_number?: string
  document_type?: string
  phone?: string | null
  user_id?: number
  email?: string | null
}

export interface LaboratoryExamApi {
  id: number
  order_number?: string
  /** Clave del estado; el API puede usar `status_slug` u otros alias. */
  status?: string
  status_slug?: string
  priority?: ExamPriorityApi | string
  is_paid?: boolean
  created_at?: string
  exam_date?: string | null
  exam_type?: { id: number; name: string; code?: string }
  patient?: {
    id?: number
    first_name?: string
    last_name?: string
    document_number?: string
    document_type?: string
  }
  request_type?: { id: number; name: string; code?: string | null }
  requesting_doctor?: { id: number; name: string }
  assigned_doctor?: { id: number; name: string } | null
  assignee?: { id: number; name: string } | null
  requesting_doctor_id?: number
  assigned_doctor_id?: number | null
  assignee_user_id?: number | null
  /** Muestra ya vinculada (no exige sample_id otra vez al avanzar) */
  assigned_sample_id?: number | null
  sample_id?: number | null
  assigned_sample?: { id?: number } | null
  /** Observaciones generales del examen (si el API las envía en listado o detalle) */
  observations?: string | null
  /** Historial de cambios de estado con observaciones (nombre de clave según backend) */
  status_logs?: unknown[]
  status_history?: unknown[]
}

export interface CreateLaboratoryExamPayload {
  patient_document: string
  /** Paciente ya existente en la org (opcional; si el backend lo usa junto con document) */
  patient_id?: number
  /**
   * Solo requeridos cuando el paciente es nuevo (no existe en la org).
   * Si ya existe, puedes omitirlos y enviar solo documento (+ patient_id si aplica).
   */
  patient_first_name?: string
  patient_last_name?: string
  patient_email?: string
  patient_phone?: string | null
  document_type: string
  exam_type_id: number
  exam_date?: string
  patient_notes?: string | null
  request_type_id: number
  requesting_doctor_id: number
  assigned_doctor_id: number
  assignee_user_id?: number | null
  priority: ExamPriorityApi
  is_paid: boolean
  /** Si el backend aún espera resultados vacíos en algunos casos */
  results?: unknown[]
}

export interface UpdateExamStatusPayload {
  status: string
  observations?: string
  /** Obligatorio la primera vez que se pasa a muestra_tomada sin muestra previa */
  sample_id?: number
}

/** Prioridad en UI del formulario */
export type PriorityForm = "normal" | "alta" | "urgente"

export function priorityFormToApi(p: PriorityForm): ExamPriorityApi {
  return p
}

export function priorityLabel(p: string): string {
  const m: Record<string, string> = {
    normal: "Normal",
    alta: "Alta",
    urgente: "URGENTE",
  }
  return m[p] ?? p
}

export function mapExamToRow(exam: LaboratoryExamApi) {
  const patient = exam.patient
  const name = [patient?.first_name, patient?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()
  const doc = patient?.document_number
    ? `${patient.document_type ?? "CC"} ${patient.document_number}`
    : "—"
  const dateSrc = exam.created_at || exam.exam_date
  let dateLabel = "—"
  if (dateSrc) {
    try {
      dateLabel = new Date(dateSrc).toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      dateLabel = dateSrc
    }
  }

  const ex = exam as Record<string, unknown>
  const statusCandidates: unknown[] = [
    exam.status,
    exam.status_slug,
    ex.status_slug,
    ex.exam_status,
    ex.state,
  ]
  let statusSlug = ""
  for (const c of statusCandidates) {
    if (typeof c === "string" && c.trim()) {
      statusSlug = c.trim()
      break
    }
  }

  return {
    examId: exam.id,
    orderNumber: exam.order_number ?? `#${exam.id}`,
    patientName: name || "—",
    document: doc,
    exam: exam.exam_type?.name ?? "—",
    doctor: exam.requesting_doctor?.name ?? "—",
    assignedName: exam.assigned_doctor?.name ?? null,
    assigneeName: exam.assignee?.name ?? null,
    statusSlug,
    paid: Boolean(exam.is_paid),
    priority: (exam.priority as string) || "normal",
    dateLabel,
    requestTypeName: exam.request_type?.name,
    requestingDoctorId: exam.requesting_doctor_id ?? exam.requesting_doctor?.id,
    assignedDoctorId:
      exam.assigned_doctor_id ?? exam.assigned_doctor?.id ?? null,
    assigneeUserId: exam.assignee_user_id ?? exam.assignee?.id ?? null,
    assignedSampleId:
      exam.assigned_sample_id ??
      exam.sample_id ??
      exam.assigned_sample?.id ??
      null,
  }
}

export type ExamRow = ReturnType<typeof mapExamToRow>
