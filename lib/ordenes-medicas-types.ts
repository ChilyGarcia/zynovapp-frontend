/** Helpers de flujo usando el orden devuelto por GET .../workflow-statuses */

function normKey(s: string | undefined | null): string {
  if (s == null || typeof s !== "string") return ""
  return s.trim().toLowerCase().replace(/[\s_-]+/g, "")
}

/**
 * Variantes que puede enviar el API por cada clave interna del examen (normKey del slug en workflow).
 * Ej.: el backend muestra "solicitado" pero la clave es `solicitud`.
 */
const WORKFLOW_SLUG_ALIASES: Record<string, string[]> = {
  solicitud: ["solicitado", "solicitud", "requested"],
  registrado: ["registro", "registrado", "registered"],
  muestra_tomada: [
    "muestra",
    "muestra_tomada",
    "muestratomada",
    "sample_taken",
    "sampletaken",
  ],
  en_proceso: ["en_proceso", "enproceso", "in_process", "inprocess"],
  resultado_recibido: [
    "resultado",
    "resultado_recibido",
    "resultadorecibido",
    "result_received",
  ],
  validado: ["validated"],
  entregado: ["delivered"],
  cancelled: ["cancelado", "canceled"],
}

/**
 * Índice del estado actual en el array ordenado del workflow (no usar indexOf(slug) en UI:
 * si hay slugs repetidos o variantes, todos los pasos pueden verse como "actuales").
 */
export function workflowRowIndexForResolvedSlug(
  resolvedSlug: string,
  workflow: readonly { slug: string; label: string }[]
): number {
  if (!resolvedSlug?.trim()) return -1
  let idx = workflow.findIndex((w) => w.slug === resolvedSlug)
  if (idx >= 0) return idx
  const rn = normKey(resolvedSlug)
  idx = workflow.findIndex((w) => normKey(w.slug) === rn)
  if (idx >= 0) return idx
  idx = workflow.findIndex((w) => normKey(w.label) === rn)
  return idx
}

/**
 * Alinea el `status` del examen (API) con un `slug` del catálogo de workflow.
 * Si no coincide (mayúsculas, guiones, sinónimos tipo solicitud/solicitado), el índice
 * queda en -1 y el stepper se ve todo gris y no hay "siguiente estado".
 */
export function resolveExamStatusToWorkflowSlug(
  raw: string | undefined | null,
  workflow: readonly { slug: string; label: string }[]
): string {
  if (raw == null || typeof raw !== "string" || !raw.trim() || workflow.length === 0) {
    return typeof raw === "string" ? raw : ""
  }
  const slugs = workflow.map((w) => w.slug).filter((s): s is string => Boolean(s))

  if (slugs.includes(raw)) return raw
  const r = normKey(raw)

  /** Coincidencia por slug normalizado + alias de claves internas */
  for (const s of slugs) {
    const nk = normKey(s)
    if (nk === r) return s
    const aliases = WORKFLOW_SLUG_ALIASES[nk] ?? []
    if (aliases.some((a) => normKey(a) === r)) return s
  }
  for (const s of slugs) {
    if (typeof s === "string" && s.toLowerCase() === raw.toLowerCase()) return s
  }
  for (const w of workflow) {
    if (normKey(w.label) === r) return w.slug
  }

  /** normKey de etiqueta en inglés (Requested, …) → clave interna esperada */
  const englishNormToCanon: Record<string, string> = {
    requested: "solicitud",
    registered: "registrado",
    sampletaken: "muestra_tomada",
    inprocess: "en_proceso",
    resultreceived: "resultado_recibido",
    validated: "validado",
    delivered: "entregado",
    cancelled: "cancelled",
  }
  const canonFromRaw = englishNormToCanon[r]
  if (canonFromRaw) {
    const hit = slugs.find((s) => normKey(s) === normKey(canonFromRaw))
    if (hit) return hit
  }
  for (const w of workflow) {
    const ln = normKey(w.label)
    const canon = englishNormToCanon[ln]
    if (canon) {
      const hit = slugs.find((s) => normKey(s) === normKey(canon))
      if (hit) return hit
    }
  }

  return raw
}

export function getStatusIndex(
  status: string,
  workflowSlugs: readonly string[]
): number {
  return workflowSlugs.indexOf(status)
}

export function getNextStatusSlug(
  current: string,
  workflowSlugs: readonly string[]
): string | null {
  const i = getStatusIndex(current, workflowSlugs)
  if (i < 0 || i >= workflowSlugs.length - 1) return null
  return workflowSlugs[i + 1] ?? null
}

/**
 * Siguiente slug usando el orden del array del workflow (evita fallos si indexOf(slug) no coincide).
 */
export function getNextStatusSlugFromWorkflow(
  resolvedSlug: string,
  workflow: readonly { slug: string; label: string }[]
): string | null {
  const i = workflowRowIndexForResolvedSlug(resolvedSlug, workflow)
  if (i < 0 || i >= workflow.length - 1) return null
  const next = workflow[i + 1]
  return next?.slug ?? null
}

/** Etiquetas en español por clave interna (normKey del slug) */
const SPANISH_LABEL_BY_NORM: Record<string, string> = {
  solicitud: "Solicitado",
  solicitado: "Solicitado",
  registrado: "Registrado",
  muestratomada: "Muestra tomada",
  enproceso: "En proceso",
  resultadorecibido: "Resultado recibido",
  validado: "Validado",
  entregado: "Entregado",
  cancelled: "Cancelada",
  cancelada: "Cancelada",
}

/** Texto en español para pasos del flujo, filtros y tablas (prioridad sobre label del API en inglés). */
export function workflowStepLabelEs(
  slug: string,
  workflow: readonly { slug: string; label: string }[]
): string {
  if (slug == null || typeof slug !== "string" || !slug.trim()) return "—"
  const nk = normKey(slug)
  const mapped = SPANISH_LABEL_BY_NORM[nk]
  if (mapped) return mapped
  const w = workflow.find(
    (x) => x.slug === slug || normKey(x.slug) === nk
  )
  if (w?.slug) {
    const m2 = SPANISH_LABEL_BY_NORM[normKey(w.slug)]
    if (m2) return m2
  }
  return w?.label ?? slug
}

export function labelForSlug(
  slug: string,
  workflow: readonly { slug: string; label: string }[]
): string {
  return workflow.find((w) => w.slug === slug)?.label ?? slug
}

/** Próximo paso del flujo es "muestra tomada" (requiere muestra de inventario la primera vez). */
export function isMuestraTomadaSlug(slug: string | null | undefined): boolean {
  if (!slug?.trim()) return false
  return normKey(slug) === "muestratomada"
}
