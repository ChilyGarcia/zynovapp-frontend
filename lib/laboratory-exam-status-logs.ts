/**
 * Extrae entradas de historial con observaciones al cambiar estado de un examen.
 * Tolera distintos nombres de colección / campos que el API Laravel pueda enviar.
 */

export interface ExamStatusObservationEntry {
  statusSlug: string
  observations: string
  occurredAt: string | null
  actorName: string | null
}

function pickStr(o: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = o[k]
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return null
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>
  return null
}

function normalizeLogRow(item: unknown): ExamStatusObservationEntry | null {
  if (!item || typeof item !== "object") return null
  const o = item as Record<string, unknown>
  const obs =
    pickStr(o, [
      "observations",
      "notes",
      "comment",
      "message",
      "observation",
      "body",
      "description",
    ]) ?? ""
  if (!obs.trim()) return null

  const statusSlug =
    pickStr(o, [
      "status_slug",
      "to_status",
      "new_status",
      "status",
      "state",
      "exam_status",
      "slug",
    ]) ?? "—"

  const occurredAt = pickStr(o, [
    "created_at",
    "updated_at",
    "changed_at",
    "occurred_at",
    "transitioned_at",
  ])

  let actorName =
    pickStr(o, ["user_name", "actor_name", "changed_by_name", "author_name"]) ??
    null
  const user = asRecord(o.user)
  if (user && !actorName) {
    const fromFull = pickStr(user, ["name", "full_name"])
    const fromParts = [pickStr(user, ["first_name"]), pickStr(user, ["last_name"])]
      .filter(Boolean)
      .join(" ")
      .trim()
    actorName = fromFull ?? (fromParts.length > 0 ? fromParts : null)
  }
  const changedBy = asRecord(o.changed_by) ?? asRecord(o.changedBy)
  if (changedBy && !actorName) {
    actorName = pickStr(changedBy, ["name", "full_name"])
  }

  return {
    statusSlug,
    observations: obs.trim(),
    occurredAt,
    actorName,
  }
}

function collectLogArrays(exam: Record<string, unknown>): unknown[] {
  const listKeys = [
    "status_logs",
    "status_history",
    "exam_status_history",
    "status_transitions",
    "audit_logs",
    "histories",
    "exam_status_histories",
  ]
  const roots: (Record<string, unknown> | null)[] = [
    exam,
    asRecord(exam.data),
    asRecord(exam.exam),
    asRecord(exam.relationships),
  ]
  for (const root of roots) {
    if (!root) continue
    for (const key of listKeys) {
      const arr = root[key]
      if (Array.isArray(arr) && arr.length > 0) return arr
    }
  }
  return []
}

function parseTime(iso: string | null): number {
  if (!iso) return 0
  const t = Date.parse(iso)
  return Number.isFinite(t) ? t : 0
}

/**
 * Lista cronológica (más reciente primero) de observaciones ligadas a cambios de estado.
 */
export function extractStatusObservationLogFromExam(
  exam: Record<string, unknown> | null | undefined
): ExamStatusObservationEntry[] {
  if (!exam) return []
  const rows = collectLogArrays(exam)
    .map(normalizeLogRow)
    .filter((x): x is ExamStatusObservationEntry => x != null)
  rows.sort((a, b) => parseTime(b.occurredAt) - parseTime(a.occurredAt))
  return rows
}

/** Observaciones “planas” del modelo examen (si el API las envía). */
export function pickExamGeneralObservations(
  exam: Record<string, unknown> | null | undefined
): string | null {
  if (!exam) return null
  const direct =
    pickStr(exam, ["observations", "status_observations", "lab_observations"]) ??
    null
  if (direct) return direct
  const data = asRecord(exam.data)
  if (data) {
    return pickStr(data, ["observations", "status_observations", "lab_observations"])
  }
  return null
}
