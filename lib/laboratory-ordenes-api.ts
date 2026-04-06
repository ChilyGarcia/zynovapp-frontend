import { API_ENDPOINTS } from "@/lib/api-config"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import type { ExamType } from "@/lib/types"
import {
  normalizeWorkflowStatusRow,
  type CreateLaboratoryExamPayload,
  type LaboratoryExamApi,
  type LaboratoryPatientSearchData,
  type LaboratoryRequestType,
  type OrderFormOptionsData,
  type LaboratoryStaffUser,
  type LaboratoryWorkflowStatus,
  type UpdateExamStatusPayload,
} from "@/lib/laboratory-ordenes-types"
import type { SampleApi } from "@/lib/samples-types"

function unwrapData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json) {
    const d = (json as { data: unknown }).data
    return d as T
  }
  return json as T
}

/** GET patients/search — el API responde 200 con `found`; no usar 404 como “no existe”. */
function parsePatientSearchResponse(json: unknown): {
  found: boolean
  data?: LaboratoryPatientSearchData
} {
  if (!json || typeof json !== "object") return { found: false }
  const o = json as Record<string, unknown>
  if (typeof o.found === "boolean") {
    const data =
      o.found && o.data && typeof o.data === "object"
        ? (o.data as LaboratoryPatientSearchData)
        : undefined
    return { found: o.found, data }
  }
  const inner = o.data
  if (inner && typeof inner === "object") {
    const w = inner as Record<string, unknown>
    if (typeof w.found === "boolean") {
      const data =
        w.found && w.data && typeof w.data === "object"
          ? (w.data as LaboratoryPatientSearchData)
          : undefined
      return { found: w.found, data }
    }
  }
  return { found: false }
}

/**
 * Busca paciente por documento en la organización del usuario autenticado.
 * Siempre espera HTTP 200 con `found` en el cuerpo; errores de red/5xx lanzan.
 */
export async function lookupPatientByDocument(
  documentNumber: string
): Promise<{ found: boolean; data?: LaboratoryPatientSearchData }> {
  const trimmed = documentNumber.trim()
  if (!trimmed) {
    return { found: false }
  }
  const res = await fetchWithAuth(
    API_ENDPOINTS.laboratoryPatientsSearch(trimmed)
  )
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "message" in json
        ? String((json as { message: string }).message)
        : `Error al buscar paciente (${res.status})`
    throw new Error(msg)
  }
  return parsePatientSearchResponse(json)
}

/** Lista paginada Laravel o array directo */
function unwrapList<T>(json: unknown): T[] {
  const raw = unwrapData<unknown>(json)
  if (Array.isArray(raw)) return raw as T[]
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    Array.isArray((raw as { data: unknown }).data)
  ) {
    return (raw as { data: T[] }).data
  }
  return []
}

export async function fetchWorkflowStatuses(): Promise<
  LaboratoryWorkflowStatus[]
> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratoryExamWorkflowStatuses)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message ??
        "No se pudieron cargar los estados del flujo"
    )
  }
  const json = await res.json()
  const rawList = unwrapList<unknown>(json)
  const list = rawList
    .map((row) => normalizeWorkflowStatusRow(row))
    .filter((x): x is LaboratoryWorkflowStatus => x != null)
  return [...list].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )
}

export async function fetchRequestTypes(): Promise<LaboratoryRequestType[]> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratoryRequestTypes)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message ??
        "No se pudieron cargar los tipos de solicitud"
    )
  }
  const json = await res.json()
  return unwrapList<LaboratoryRequestType>(json)
}

export async function fetchStaff(): Promise<LaboratoryStaffUser[]> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratoryStaff)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message ?? "No se pudo cargar el personal"
    )
  }
  const json = await res.json()
  return unwrapList<LaboratoryStaffUser>(json)
}

export async function fetchOrderFormOptions(): Promise<OrderFormOptionsData> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratoryOrderFormOptions)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message ??
        "No se pudieron cargar las opciones del formulario"
    )
  }
  const json = await res.json()
  const raw = unwrapData<Record<string, unknown>>(json)
  if (!raw || typeof raw !== "object") {
    return {
      request_types: [],
      exam_types: [],
      staff: [],
      priorities: [],
    }
  }
  return {
    request_types: Array.isArray(raw.request_types)
      ? (raw.request_types as OrderFormOptionsData["request_types"])
      : [],
    exam_types: Array.isArray(raw.exam_types)
      ? (raw.exam_types as OrderFormOptionsData["exam_types"])
      : [],
    staff: Array.isArray(raw.staff)
      ? (raw.staff as OrderFormOptionsData["staff"])
      : [],
    priorities: Array.isArray(raw.priorities)
      ? (raw.priorities as OrderFormOptionsData["priorities"])
      : [],
    payment:
      raw.payment && typeof raw.payment === "object"
        ? (raw.payment as OrderFormOptionsData["payment"])
        : undefined,
  }
}

export async function fetchLaboratoryExamTypes(): Promise<ExamType[]> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratoryExamTypes)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message ??
        "No se pudieron cargar los tipos de examen"
    )
  }
  const json = await res.json()
  if (
    json &&
    typeof json === "object" &&
    "success" in json &&
    (json as { success: boolean }).success &&
    Array.isArray((json as { data: ExamType[] }).data)
  ) {
    return (json as { data: ExamType[] }).data
  }
  const list = unwrapList<ExamType>(json)
  return list
}

export async function fetchLaboratoryExams(options?: {
  laboratory_id?: number
  assigned_doctor_id?: number
  per_page?: number
}): Promise<LaboratoryExamApi[]> {
  const res = await fetchWithAuth(
    API_ENDPOINTS.laboratoryExamsQuery({
      laboratory_id: options?.laboratory_id,
      assigned_doctor_id: options?.assigned_doctor_id,
      per_page: options?.per_page ?? 100,
    })
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message ??
        "No se pudieron cargar las órdenes"
    )
  }
  const json = await res.json()
  return unwrapList<LaboratoryExamApi>(json)
}

export async function createLaboratoryExam(
  payload: CreateLaboratoryExamPayload
): Promise<LaboratoryExamApi> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratoryExams, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ?? "Error al crear la orden"
    )
  }
  const raw = unwrapData<unknown>(json)
  const exam =
    raw && typeof raw === "object" && "id" in raw
      ? (raw as LaboratoryExamApi)
      : (json as { data?: LaboratoryExamApi }).data
  if (!exam?.id) {
    throw new Error("Respuesta inválida al crear la orden")
  }
  return exam
}

function formatExamStatusError(json: unknown): string {
  if (!json || typeof json !== "object") return "No se pudo actualizar el estado"
  const o = json as Record<string, unknown>
  const errs = o.errors
  if (errs && typeof errs === "object" && errs !== null) {
    const parts: string[] = []
    for (const msgs of Object.values(errs)) {
      if (Array.isArray(msgs)) {
        for (const m of msgs) {
          if (typeof m === "string" && m.trim()) parts.push(m.trim())
        }
      }
    }
    if (parts.length) return parts.join(" ")
  }
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim()
  if (typeof o.hint === "string" && o.hint.trim()) return o.hint.trim()
  return "No se pudo actualizar el estado"
}

function unwrapSamplesArray(json: unknown): SampleApi[] {
  const raw = unwrapData<unknown>(json)
  if (Array.isArray(raw)) return raw as SampleApi[]
  if (raw && typeof raw === "object" && "data" in raw) {
    const inner = (raw as { data: unknown }).data
    if (Array.isArray(inner)) return inner as SampleApi[]
    if (
      inner &&
      typeof inner === "object" &&
      "data" in inner &&
      Array.isArray((inner as { data: unknown }).data)
    ) {
      return (inner as { data: SampleApi[] }).data
    }
  }
  return []
}

/** Muestras de inventario elegibles para vincular al pasar el examen a muestra_tomada */
export async function fetchAvailableSamplesForExam(
  examId: number
): Promise<SampleApi[]> {
  const res = await fetchWithAuth(
    API_ENDPOINTS.laboratoryExamAvailableSamples(examId)
  )
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(formatExamStatusError(json))
  }
  return unwrapSamplesArray(json)
}

export async function updateExamStatus(
  examId: number,
  payload: UpdateExamStatusPayload
): Promise<void> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratoryExamStatus(examId), {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(formatExamStatusError(json))
  }
}
