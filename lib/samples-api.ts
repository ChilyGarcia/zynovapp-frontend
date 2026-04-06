import { API_ENDPOINTS } from "@/lib/api-config"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import type {
  CreateSamplePayload,
  SampleApi,
  SamplesStats,
  UpdateSamplePayload,
} from "@/lib/samples-types"

const LARAVEL_MSG_ES: Record<string, string> = {
  "The sample type field is required.": "El tipo de muestra es obligatorio.",
  "The sample type field must be a string.":
    "El tipo de muestra debe enviarse como texto (p. ej. el identificador entre comillas).",
  "The expires at field must be a date after collected at.":
    "La fecha de vencimiento debe ser posterior a la fecha de toma.",
}

/** Une mensajes de validación Laravel `{ message, errors: { campo: string[] } }` */
export function formatSamplesApiError(json: unknown): string {
  if (!json || typeof json !== "object") return "Error desconocido"
  const o = json as Record<string, unknown>
  const errs = o.errors
  if (errs && typeof errs === "object" && errs !== null) {
    const parts: string[] = []
    for (const msgs of Object.values(errs)) {
      if (Array.isArray(msgs)) {
        for (const m of msgs) {
          if (typeof m === "string" && m.trim()) {
            parts.push(LARAVEL_MSG_ES[m.trim()] ?? m.trim())
          }
        }
      }
    }
    if (parts.length) return parts.join(" ")
  }
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim()
  return "Error al procesar la solicitud"
}

function unwrapData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data as T
  }
  return json as T
}

function unwrapList<T>(json: unknown): T[] {
  const raw = unwrapData<unknown>(json)
  if (Array.isArray(raw)) return raw as T[]
  if (raw && typeof raw === "object" && "data" in raw) {
    const inner = (raw as { data: unknown }).data
    if (Array.isArray(inner)) return inner as T[]
    /** Paginación Laravel: { data: { data: [...] } } */
    if (
      inner &&
      typeof inner === "object" &&
      "data" in inner &&
      Array.isArray((inner as { data: unknown }).data)
    ) {
      return (inner as { data: T[] }).data
    }
  }
  return []
}

export async function fetchSamplesStats(): Promise<SamplesStats> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratorySamplesStats)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ??
        "No se pudieron cargar las estadísticas de muestras"
    )
  }
  const raw = unwrapData<unknown>(json)
  if (raw && typeof raw === "object") {
    return raw as SamplesStats
  }
  return json as SamplesStats
}

export async function fetchSamples(options?: {
  search?: string
  /** all | active | in_process | processed | expired */
  status?: string
  per_page?: number
  page?: number
}): Promise<SampleApi[]> {
  const params: Record<string, string | number | undefined> = {
    per_page: options?.per_page ?? 30,
    page: options?.page,
  }
  if (options?.search?.trim()) params.search = options.search.trim()
  if (options?.status && options.status !== "all") {
    params.status = options.status
  }
  const res = await fetchWithAuth(
    API_ENDPOINTS.laboratorySamplesQuery(params)
  )
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ??
        "No se pudo cargar el listado de muestras"
    )
  }
  return unwrapList<SampleApi>(json)
}

export async function fetchSampleById(id: number): Promise<SampleApi> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratorySample(id))
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ?? "No se encontró la muestra"
    )
  }
  const raw = unwrapData<unknown>(json)
  if (raw && typeof raw === "object" && "id" in raw) {
    return raw as SampleApi
  }
  const d = (json as { data?: SampleApi }).data
  if (d?.id) return d
  throw new Error("Respuesta inválida")
}

export async function createSample(
  payload: CreateSamplePayload
): Promise<SampleApi> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratorySamples, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(formatSamplesApiError(json))
  }
  const raw = unwrapData<unknown>(json)
  if (raw && typeof raw === "object" && "id" in raw) {
    return raw as SampleApi
  }
  const d = (json as { data?: SampleApi }).data
  if (d?.id) return d
  throw new Error("Respuesta inválida al crear la muestra")
}

export async function updateSample(
  id: number,
  payload: UpdateSamplePayload
): Promise<SampleApi> {
  const res = await fetchWithAuth(API_ENDPOINTS.laboratorySample(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(formatSamplesApiError(json))
  }
  const raw = unwrapData<unknown>(json)
  if (raw && typeof raw === "object" && "id" in raw) {
    return raw as SampleApi
  }
  const d = (json as { data?: SampleApi }).data
  if (d?.id) return d
  return fetchSampleById(id)
}
