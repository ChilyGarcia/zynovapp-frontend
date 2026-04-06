/** Tipos del inventario de muestras — API `/api/laboratory/samples` */

export type SampleStatusApi = "active" | "in_process" | "processed" | "expired"

export interface SamplesStats {
  active_samples: number
  in_process: number
  processed_today: number
  alerts: number
  /** Opcional: chips desde el backend */
  status_filters?: { value: string; label: string }[]
}

export interface SamplePatientRef {
  id?: number
  first_name?: string | null
  last_name?: string | null
  document_number?: string | null
}

export interface SampleExamRef {
  id?: number
  order_number?: string | null
}

export interface SampleApi {
  id: number
  sample_code: string
  code?: string | null
  status: SampleStatusApi | string
  sample_type_id?: number | null
  /** Texto o relación anidada según el API */
  sample_type?: string | { name?: string | null } | null
  container?: string | null
  storage_location?: string | null
  rack?: string | null
  position?: string | null
  temperature_celsius?: number | string | null
  temperature_verified?: boolean | null
  collected_at?: string | null
  expires_at?: string | null
  processed_at?: string | null
  notes?: string | null
  organization_id?: number | null
  exam_id?: number | null
  patient_id?: number | null
  patient?: SamplePatientRef | null
  exam?: SampleExamRef | null
}

/**
 * POST /api/laboratory/samples — alta solo inventario (sin examen obligatorio;
 * patient_id opcional para trazabilidad si el backend lo acepta).
 */
export interface CreateSamplePayload {
  /** Si se omite, el backend suele tomar la organización del JWT */
  organization_id?: number
  /**
   * Tipo de muestra: el API Laravel exige `sample_type` como **string**
   * (p. ej. id numérico en texto `"12"` o un código/slug).
   */
  sample_type: string
  sample_type_id?: number
  code?: string | null
  storage_location?: string | null
  collected_at?: string | null
  expires_at?: string | null
  status?: SampleStatusApi
  notes?: string | null
}

export interface UpdateSamplePayload {
  sample_type_id?: number
  code?: string | null
  storage_location?: string | null
  container?: string | null
  rack?: string | null
  position?: string | null
  temperature_celsius?: number
  temperature_verified?: boolean
  collected_at?: string | null
  expires_at?: string | null
  status?: SampleStatusApi
  notes?: string | null
}

export function sampleTypeDisplay(s: SampleApi): string {
  const st = s.sample_type
  if (typeof st === "string" && st.trim()) return st.trim()
  if (st && typeof st === "object" && st.name && String(st.name).trim())
    return String(st.name).trim()
  return "—"
}

export function samplePatientName(s: SampleApi): string {
  const p = s.patient
  if (!p) return "Inventario (sin paciente)"
  const n = [p.first_name, p.last_name].filter(Boolean).join(" ").trim()
  return n || "Inventario (sin paciente)"
}

export function sampleDescriptionLine(s: SampleApi): string {
  const parts = [
    sampleTypeDisplay(s),
    s.container,
    s.storage_location,
  ].filter((x) => x && x !== "—")
  return parts.length ? parts.join(" — ") : "—"
}

/** Texto de ubicación para tarjetas (API nuevo o legado rack/posición). */
export function sampleLocationLine(s: SampleApi): string {
  if (s.storage_location?.trim()) return s.storage_location.trim()
  if (s.rack || s.position)
    return `Rack ${s.rack ?? "—"} — Pos. ${s.position ?? "—"}`
  return "Sin ubicación"
}
