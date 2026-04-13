"use client"

import {
  Fragment,
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react"
import Link from "next/link"
import {
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  Filter,
  History,
  Loader2,
  Plus,
  Search,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
  getNextStatusSlugFromWorkflow,
  isMuestraTomadaSlug,
  resolveExamStatusToWorkflowSlug,
  workflowRowIndexForResolvedSlug,
  workflowStepLabelEs,
} from "@/lib/ordenes-medicas-types"
import type { ExamRow } from "@/lib/laboratory-ordenes-types"
import type { LaboratoryExamApi } from "@/lib/laboratory-ordenes-types"
import { mapExamToRow, priorityLabel } from "@/lib/laboratory-ordenes-types"
import type { LaboratoryWorkflowStatus } from "@/lib/laboratory-ordenes-types"
import {
  fetchAvailableSamplesForExam,
  fetchLaboratoryExamById,
  fetchLaboratoryExams,
  fetchWorkflowStatuses,
  updateExamStatus,
} from "@/lib/laboratory-ordenes-api"
import {
  extractStatusObservationLogFromExam,
  pickExamGeneralObservations,
} from "@/lib/laboratory-exam-status-logs"
import type { UpdateExamStatusPayload } from "@/lib/laboratory-ordenes-types"
import type { SampleApi } from "@/lib/samples-types"
import { sampleLocationLine, sampleTypeDisplay } from "@/lib/samples-types"
import { useAuth } from "@/contexts/auth-context"
import FooterComponent from "@/components/footer/footer-component"
import NavbarComponent from "@/components/navbar/navbar-component"
import SidebarComponent from "@/components/sidebar/sidebar-component"
import { NuevaOrdenMedicaDialog } from "@/components/ordenes-medicas/nueva-orden-medica-dialog"

const FILTER_DOT = [
  "bg-violet-600",
  "bg-violet-500",
  "bg-blue-500",
  "bg-amber-400",
  "bg-red-500",
  "bg-emerald-400",
  "bg-sky-500",
  "bg-emerald-700",
]

const BADGE_STYLES: { className: string; dot: string }[] = [
  {
    className: "bg-violet-50 text-violet-800 border-violet-100",
    dot: "bg-violet-500",
  },
  {
    className: "bg-blue-50 text-blue-800 border-blue-100",
    dot: "bg-blue-500",
  },
  {
    className: "bg-amber-50 text-amber-900 border-amber-100",
    dot: "bg-amber-400",
  },
  {
    className: "bg-red-50 text-red-800 border-red-100",
    dot: "bg-red-500",
  },
  {
    className: "bg-emerald-50 text-emerald-900 border-emerald-100",
    dot: "bg-emerald-500",
  },
  {
    className: "bg-sky-50 text-sky-800 border-sky-100",
    dot: "bg-sky-500",
  },
  {
    className: "bg-indigo-50 text-indigo-800 border-indigo-100",
    dot: "bg-indigo-500",
  },
]

function badgeForSlug(slug: string, workflowSlugs: string[]) {
  const idx = Math.max(0, workflowSlugs.indexOf(slug))
  return BADGE_STYLES[idx % BADGE_STYLES.length] ?? BADGE_STYLES[0]
}

function formatSampleWhen(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return String(iso)
  }
}

const OrderExamTableRow = memo(function OrderExamTableRow({
  row: o,
  workflowSlugs,
  workflowStatuses,
  onOpenDetail,
}: {
  row: ExamRow
  workflowSlugs: string[]
  workflowStatuses: LaboratoryWorkflowStatus[]
  onOpenDetail: (row: ExamRow) => void
}) {
  const b = badgeForSlug(o.statusSlug, workflowSlugs)
  const statusLabel = workflowStepLabelEs(o.statusSlug, workflowStatuses)
  return (
    <TableRow
      className="cursor-pointer hover:bg-violet-50/50"
      onClick={() => onOpenDetail(o)}
    >
      <TableCell className="font-mono text-xs text-gray-600">
        {o.orderNumber}
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-2">
          <div className="rounded-full bg-violet-100 p-1.5 mt-0.5">
            <User className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{o.patientName}</p>
            <p className="text-xs text-gray-500">{o.document}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-gray-800">{o.exam}</TableCell>
      <TableCell className="text-gray-700">{o.doctor}</TableCell>
      <TableCell>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            b.className
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", b.dot)}
          />
          {statusLabel}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            o.paid ? "text-emerald-600" : "text-red-600"
          )}
        >
          <CreditCard className="h-3.5 w-3.5" />
          {o.paid ? "Sí" : "No"}
        </span>
      </TableCell>
      <TableCell>
        {String(o.priority).toLowerCase() === "urgente" ? (
          <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            URGENTE
          </span>
        ) : String(o.priority).toLowerCase() === "alta" ? (
          <span className="rounded-md bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
            Alta
          </span>
        ) : (
          <span className="text-gray-600 text-sm">
            {priorityLabel(o.priority)}
          </span>
        )}
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {o.dateLabel}
        </span>
      </TableCell>
    </TableRow>
  )
})

export function OrdenesMedicasView() {
  const { user, isLoading: authLoading } = useAuth()
  const [workflowStatuses, setWorkflowStatuses] = useState<
    LaboratoryWorkflowStatus[]
  >([])
  const [orders, setOrders] = useState<ExamRow[]>([])

  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "error" | "ready"
  >("idle")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [filter, setFilter] = useState<"Todos" | string>("Todos")
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)
  const [statusObservations, setStatusObservations] = useState("")
  const [availableSamples, setAvailableSamples] = useState<SampleApi[]>([])
  const [sampleOptionsLoading, setSampleOptionsLoading] = useState(false)
  const [samplePickerError, setSamplePickerError] = useState<string | null>(
    null
  )
  const [selectedInventorySampleId, setSelectedInventorySampleId] = useState<
    number | null
  >(null)
  const [examDetail, setExamDetail] = useState<Record<string, unknown> | null>(
    null
  )
  const [examDetailLoading, setExamDetailLoading] = useState(false)
  const [examDetailError, setExamDetailError] = useState<string | null>(null)

  const workflowSlugs = useMemo(
    () => workflowStatuses.map((w) => w.slug),
    [workflowStatuses]
  )

  const reloadOrders = useCallback(async () => {
    // Sin `laboratory_id`: el API filtra por organización del token. Si se envía
    // laboratory_id y los exámenes tienen laboratory_id null, la lista queda vacía.
    const list = await fetchLaboratoryExams({ per_page: 100 })
    setOrders(list.map(mapExamToRow))
  }, [])

  const handleOrderCreated = useCallback(
    async (created: LaboratoryExamApi) => {
      await reloadOrders()
      const row = mapExamToRow(created)
      setFilter("Todos")
      setSelectedExamId(row.examId)
      setSheetOpen(true)
    },
    [reloadOrders]
  )

  const handleDialogActionMessage = useCallback(
    (message: string | null) => {
      setActionError(message)
    },
    []
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadState("loading")
      setLoadError(null)
      const LOAD_TIMEOUT_MS = 60_000
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      const deadline = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(
            new Error(
              "El servidor tardó demasiado en responder. Revisa que el API esté en marcha (p. ej. Laravel en el puerto configurado en NEXT_PUBLIC_API_URL)."
            )
          )
        }, LOAD_TIMEOUT_MS)
      })
      const dataPromise = Promise.all([
        fetchWorkflowStatuses(),
        fetchLaboratoryExams({ per_page: 100 }),
      ]).finally(() => {
        if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      })
      try {
        const [wf, exams] = await Promise.race([dataPromise, deadline])
        if (cancelled) return
        setWorkflowStatuses(wf)
        setOrders(exams.map(mapExamToRow))
        setLoadState("ready")
      } catch (e) {
        if (cancelled) return
        setLoadError(e instanceof Error ? e.message : "Error al cargar datos")
        setLoadState("error")
      }
    }
    if (user) load()
    else setLoadState("idle")
  }, [user])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const s of workflowSlugs) c[s] = 0
    for (const o of orders) {
      if (o.statusSlug in c) c[o.statusSlug]++
      else c[o.statusSlug] = (c[o.statusSlug] ?? 0) + 1
    }
    return c
  }, [orders, workflowSlugs])

  const filtered = useMemo(() => {
    let list = orders
    if (filter !== "Todos") list = list.filter((o) => o.statusSlug === filter)
    const q = deferredSearch.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          String(o.examId).includes(q) ||
          o.patientName.toLowerCase().includes(q) ||
          o.exam.toLowerCase().includes(q) ||
          o.document.toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, filter, deferredSearch])

  const selected = orders.find((o) => o.examId === selectedExamId) ?? null

  const resolvedSelectedSlug = useMemo(() => {
    if (!selected) return ""
    return resolveExamStatusToWorkflowSlug(
      selected.statusSlug,
      workflowStatuses
    )
  }, [selected, workflowStatuses])

  const nextSlug =
    selected && workflowStatuses.length
      ? getNextStatusSlugFromWorkflow(
          resolvedSelectedSlug,
          workflowStatuses
        )
      : null

  const isMuestraTomadaNext = isMuestraTomadaSlug(nextSlug ?? "")

  /** Primera vez a muestra_tomada: el examen aún no tiene muestra vinculada */
  const needsInventorySampleForToma =
    !!selected &&
    isMuestraTomadaNext &&
    selected.assignedSampleId == null

  /** Paso muestra_tomada: solo el médico asignado (403 si no). Otros pasos: reglas anteriores. */
  const canChangeStatus =
    !!user?.id &&
    !!selected &&
    (isMuestraTomadaNext
      ? selected.assignedDoctorId === user.id
      : selected.assignedDoctorId === user.id ||
        (selected.assignedDoctorId == null &&
          selected.requestingDoctorId === user.id) ||
        user.laboratory != null)

  const canCancelOrder =
    !!user?.id &&
    !!selected &&
    (selected.assignedDoctorId === user.id ||
      (selected.assignedDoctorId == null &&
        selected.requestingDoctorId === user.id) ||
      user.laboratory != null)

  const lastWorkflowSlug = workflowSlugs[workflowSlugs.length - 1]
  const isTerminal =
    !!selected &&
    (resolvedSelectedSlug === lastWorkflowSlug ||
      selected.statusSlug === "cancelled")

  const currentWorkflowIndex =
    !selected || selected.statusSlug === "cancelled"
      ? -1
      : (() => {
          const i = workflowRowIndexForResolvedSlug(
            resolvedSelectedSlug,
            workflowStatuses
          )
          return i >= 0 ? i : 0
        })()

  useEffect(() => {
    if (!sheetOpen || !selected) {
      setAvailableSamples([])
      setSelectedInventorySampleId(null)
      setSamplePickerError(null)
      return
    }
    if (!needsInventorySampleForToma) {
      setAvailableSamples([])
      setSelectedInventorySampleId(null)
      setSamplePickerError(null)
      return
    }
    if (selected.assignedDoctorId !== user?.id) return

    let cancelled = false
    setSampleOptionsLoading(true)
    setSamplePickerError(null)
    fetchAvailableSamplesForExam(selected.examId)
      .then((list) => {
        if (cancelled) return
        setAvailableSamples(list)
        if (list.length === 1) setSelectedInventorySampleId(list[0].id)
        else setSelectedInventorySampleId(null)
      })
      .catch((e) => {
        if (!cancelled) {
          setSamplePickerError(
            e instanceof Error ? e.message : "Error al cargar muestras"
          )
        }
      })
      .finally(() => {
        if (!cancelled) setSampleOptionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [
    sheetOpen,
    selected?.examId,
    needsInventorySampleForToma,
    user?.id,
    selected?.assignedDoctorId,
  ])

  const openDetail = useCallback((row: ExamRow) => {
    setSelectedExamId(row.examId)
    setStatusObservations("")
    setSelectedInventorySampleId(null)
    setAvailableSamples([])
    setSamplePickerError(null)
    setSheetOpen(true)
  }, [])

  const refreshExamDetail = useCallback(async () => {
    if (!selectedExamId) return
    setExamDetailLoading(true)
    setExamDetailError(null)
    try {
      const data = await fetchLaboratoryExamById(selectedExamId)
      setExamDetail(data)
    } catch (e) {
      setExamDetail(null)
      setExamDetailError(
        e instanceof Error ? e.message : "No se pudo cargar el detalle del examen"
      )
    } finally {
      setExamDetailLoading(false)
    }
  }, [selectedExamId])

  useEffect(() => {
    if (!sheetOpen || !selectedExamId) {
      setExamDetail(null)
      setExamDetailError(null)
      setExamDetailLoading(false)
      return
    }
    void refreshExamDetail()
  }, [sheetOpen, selectedExamId, refreshExamDetail])

  const statusObservationLog = useMemo(
    () => extractStatusObservationLogFromExam(examDetail),
    [examDetail]
  )
  const generalExamObservations = useMemo(
    () => pickExamGeneralObservations(examDetail),
    [examDetail]
  )

  async function advanceOrder() {
    if (!selected || !nextSlug || !canChangeStatus) return
    if (needsInventorySampleForToma && selectedInventorySampleId == null) {
      setActionError(
        "Selecciona una muestra del inventario para registrar la toma."
      )
      return
    }
    setSaving(true)
    setActionError(null)
    try {
      const payload: UpdateExamStatusPayload = {
        status: nextSlug,
        observations: statusObservations.trim() || undefined,
      }
      if (needsInventorySampleForToma && selectedInventorySampleId != null) {
        payload.sample_id = selectedInventorySampleId
      }
      await updateExamStatus(selected.examId, payload)
      await reloadOrders()
      setStatusObservations("")
      setSelectedInventorySampleId(null)
      await refreshExamDetail()
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "No se pudo avanzar el estado"
      )
    } finally {
      setSaving(false)
    }
  }

  async function cancelOrder() {
    if (!selected || !canCancelOrder) return
    setSaving(true)
    setActionError(null)
    try {
      await updateExamStatus(selected.examId, {
        status: "cancelled",
        observations: statusObservations.trim() || undefined,
      })
      await reloadOrders()
      setSheetOpen(false)
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "No se pudo cancelar la orden"
      )
    } finally {
      setSaving(false)
    }
  }

  const filterKeys: ("Todos" | string)[] = useMemo(
    () => ["Todos", ...workflowSlugs],
    [workflowSlugs]
  )

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#eef0f4] flex flex-col">
        <div className="flex flex-1 min-w-0">
          <SidebarComponent />
          <div className="flex-1 flex flex-col min-w-0">
            <NavbarComponent />
            <main className="flex-1 flex items-center justify-center p-8">
              <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            </main>
          </div>
        </div>
        <FooterComponent />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#eef0f4] flex flex-col">
        <div className="flex flex-1 min-w-0">
          <SidebarComponent />
          <div className="flex-1 flex flex-col min-w-0">
            <NavbarComponent />
            <main className="flex-1 p-6">
              <Alert>
                <AlertTitle>Sesión requerida</AlertTitle>
                <AlertDescription>
                  Inicia sesión como laboratorio para gestionar órdenes médicas.
                </AlertDescription>
              </Alert>
            </main>
          </div>
        </div>
        <FooterComponent />
      </div>
    )
  }

  if (loadState === "loading" || loadState === "idle") {
    return (
      <div className="min-h-screen bg-[#eef0f4] flex flex-col">
        <div className="flex flex-1 min-w-0">
          <SidebarComponent />
          <div className="flex-1 flex flex-col min-w-0">
            <NavbarComponent />
            <main className="flex-1 flex items-center justify-center p-8">
              <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            </main>
          </div>
        </div>
        <FooterComponent />
      </div>
    )
  }

  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-[#eef0f4] flex flex-col">
        <div className="flex flex-1 min-w-0">
          <SidebarComponent />
          <div className="flex-1 flex flex-col min-w-0">
            <NavbarComponent />
            <main className="flex-1 p-6">
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{loadError}</AlertDescription>
              </Alert>
            </main>
          </div>
        </div>
        <FooterComponent />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eef0f4] flex flex-col">
      <div className="flex flex-1 min-w-0">
        <SidebarComponent />
        <div className="flex-1 flex flex-col min-w-0">
          <NavbarComponent />
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto space-y-5">
              {actionError && (
                <Alert variant="destructive" className="border-red-200">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{actionError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Órdenes Médicas
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">
                    Gestión de exámenes y solicitudes médicas
                  </p>
                </div>
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                  onClick={() => {
                    setActionError(null)
                    setDialogOpen(true)
                  }}
                  disabled={saving}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Orden
                </Button>
              </div>

              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-0.5">
                    {filterKeys.map((key, idx) => (
                      <Fragment key={`${idx}-${key}`}>
                        {idx > 0 && (
                          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 hidden sm:inline mx-0.5" />
                        )}
                        <button
                          type="button"
                          onClick={() => setFilter(key)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border transition-colors shrink-0",
                            filter === key
                              ? key === "Todos"
                                ? "bg-violet-600 text-white border-violet-600"
                                : "bg-violet-50 text-violet-900 border-violet-200 ring-1 ring-violet-200"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full shrink-0",
                              FILTER_DOT[
                                filterKeys.indexOf(key) % FILTER_DOT.length
                              ]
                            )}
                          />
                          {key === "Todos"
                            ? "Todos"
                            : workflowStepLabelEs(key, workflowStatuses)}
                          {key === "Todos" ? (
                            <span className="opacity-90">
                              ({orders.length})
                            </span>
                          ) : (
                            <span className="text-gray-500 font-normal">
                              ({counts[key] ?? 0})
                            </span>
                          )}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <div className="relative flex gap-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por ID, paciente o examen..."
                      className="pl-10 pr-12 bg-gray-50 border-gray-200"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 border-gray-200"
                      aria-label="Filtros"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Paciente</TableHead>
                      <TableHead className="font-semibold">Examen</TableHead>
                      <TableHead className="font-semibold">Médico</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="font-semibold">Pago</TableHead>
                      <TableHead className="font-semibold">Prioridad</TableHead>
                      <TableHead className="font-semibold">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((o) => (
                      <OrderExamTableRow
                        key={o.examId}
                        row={o}
                        workflowSlugs={workflowSlugs}
                        workflowStatuses={workflowStatuses}
                        onOpenDetail={openDetail}
                      />
                    ))}
                  </TableBody>
                </Table>
                {filtered.length === 0 && (
                  <p className="p-8 text-center text-gray-500 text-sm">
                    No hay órdenes que coincidan con la búsqueda.
                  </p>
                )}
              </Card>
            </div>
          </main>
        </div>
      </div>
      <FooterComponent />

      <NuevaOrdenMedicaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={user}
        onOrderCreated={handleOrderCreated}
        onActionMessage={handleDialogActionMessage}
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg border-l bg-[#f7f8fb] p-0 gap-0 overflow-y-auto"
        >
          <SheetTitle className="sr-only">
            {selected
              ? `Detalle de orden médica, folio ${selected.orderNumber}`
              : "Detalle de orden médica"}
          </SheetTitle>
          {selected && (
            <>
              <SheetHeader className="p-6 pb-4 border-b border-gray-200 bg-white">
                <p
                  className="text-xs text-gray-500 font-mono"
                  aria-hidden
                >
                  {selected.orderNumber}
                </p>
                <p
                  className="text-xl font-semibold text-foreground tracking-tight"
                  aria-hidden
                >
                  Detalle de Orden
                </p>
              </SheetHeader>
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">
                    Observaciones (opcional)
                  </Label>
                  <Textarea
                    placeholder="Notas al cambiar estado..."
                    value={statusObservations}
                    onChange={(e) => setStatusObservations(e.target.value)}
                    className="min-h-[72px] bg-white"
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <History className="h-4 w-4 shrink-0 text-violet-600" />
                    Historial de observaciones
                  </div>
                  {examDetailLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                      Cargando historial…
                    </div>
                  )}
                  {examDetailError && (
                    <Alert variant="destructive" className="border-red-200 py-2">
                      <AlertDescription className="text-sm">
                        {examDetailError}
                      </AlertDescription>
                    </Alert>
                  )}
                  {!examDetailLoading &&
                    !examDetailError &&
                    generalExamObservations && (
                      <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 text-sm">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Notas del examen
                        </p>
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {generalExamObservations}
                        </p>
                      </div>
                    )}
                  {!examDetailLoading &&
                    !examDetailError &&
                    statusObservationLog.length === 0 &&
                    !generalExamObservations && (
                      <p className="text-xs text-gray-500">
                        Sin observaciones guardadas aún. Si el detalle del examen
                        expone historial (p. ej.{" "}
                        <code className="text-[11px]">status_logs</code>), aparecerán
                        aquí tras cada cambio de estado.
                      </p>
                    )}
                  {statusObservationLog.length > 0 && (
                    <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {statusObservationLog.map((entry, idx) => (
                        <li
                          key={`${entry.occurredAt ?? "t"}-${idx}-${entry.statusSlug}`}
                          className="rounded-lg border border-violet-100 bg-violet-50/50 p-3 text-sm"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2 gap-y-1">
                            <span className="font-medium text-violet-900">
                              {workflowStepLabelEs(
                                entry.statusSlug,
                                workflowStatuses
                              )}
                            </span>
                            {entry.occurredAt && (
                              <span className="text-xs text-gray-500 tabular-nums">
                                {formatSampleWhen(entry.occurredAt)}
                              </span>
                            )}
                          </div>
                          {entry.actorName && (
                            <p className="text-xs text-gray-600 mt-1">
                              {entry.actorName}
                            </p>
                          )}
                          <p className="text-gray-800 mt-2 whitespace-pre-wrap leading-snug">
                            {entry.observations}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {needsInventorySampleForToma && canChangeStatus && (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500 font-semibold">
                      Muestra de inventario (obligatorio)
                    </Label>
                    <p className="text-xs text-gray-600">
                      Elige un tubo en stock (activo) compatible con este paciente
                      o genérico. Si no hay ninguna,{" "}
                      <Link
                        href="/inventario-muestras"
                        className="text-violet-600 font-medium underline underline-offset-2"
                      >
                        registra una en Inventario de muestras
                      </Link>{" "}
                      y vuelve aquí.
                    </p>
                    {sampleOptionsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                        Cargando muestras disponibles…
                      </div>
                    ) : samplePickerError ? (
                      <Alert variant="destructive" className="border-red-200">
                        <AlertDescription>{samplePickerError}</AlertDescription>
                      </Alert>
                    ) : availableSamples.length === 0 ? (
                      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        No hay muestras disponibles para vincular. Crea una en
                        inventario o revisa que el paciente coincida.
                      </p>
                    ) : (
                      <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                        {availableSamples.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              setSelectedInventorySampleId(s.id)
                            }
                            className={cn(
                              "w-full text-left rounded-xl border p-3 transition-colors",
                              selectedInventorySampleId === s.id
                                ? "border-violet-500 bg-violet-50 ring-1 ring-violet-200"
                                : "border-gray-200 bg-white hover:border-violet-200"
                            )}
                          >
                            <p className="font-mono text-sm font-semibold text-violet-800">
                              {s.sample_code}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              {sampleTypeDisplay(s)} · {sampleLocationLine(s)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Vence: {formatSampleWhen(s.expires_at)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {!isTerminal && workflowStatuses.length > 0 && (
                    <Button
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11"
                      onClick={advanceOrder}
                      disabled={
                        saving ||
                        !canChangeStatus ||
                        !nextSlug ||
                        (needsInventorySampleForToma &&
                          selectedInventorySampleId == null)
                      }
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span className="mr-2">→</span>
                          {isMuestraTomadaNext && needsInventorySampleForToma
                            ? "Registrar toma de muestra"
                            : nextSlug
                              ? `Avanzar a: ${workflowStepLabelEs(
                                  nextSlug,
                                  workflowStatuses
                                )}`
                              : "Siguiente estado no disponible"}
                        </>
                      )}
                    </Button>
                  )}
                  {!isTerminal &&
                    nextSlug &&
                    !canChangeStatus && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      {isMuestraTomadaNext
                        ? "Solo el médico asignado puede registrar la toma de muestra y avanzar a este estado."
                        : "Solo el médico asignado o el solicitante (si aún no hay asignado) pueden cambiar el estado de esta orden."}
                    </p>
                  )}
                  {lastWorkflowSlug &&
                    selected.statusSlug !== "cancelled" &&
                    !isTerminal &&
                    canCancelOrder && (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                        onClick={cancelOrder}
                        disabled={saving}
                      >
                        Cancelar orden
                      </Button>
                    )}
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-gray-300"
                    type="button"
                    disabled
                  >
                    <User className="h-4 w-4 mr-2" />
                    Asignar Colaborador
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Flujo de Estado
                  </h3>
                  {selected.statusSlug === "cancelled" && (
                    <Alert className="border-gray-200 bg-gray-50">
                      <AlertTitle>Orden cancelada</AlertTitle>
                      <AlertDescription>
                        Esta orden no continúa en el flujo de laboratorio.
                      </AlertDescription>
                    </Alert>
                  )}
                  {selected.statusSlug !== "cancelled" && (
                  <ol className="relative">
                    {workflowStatuses.map((step, i) => {
                      const idxOrder = currentWorkflowIndex
                      /** Posición en el array del workflow (no indexOf(slug): slugs duplicados rompen el UI) */
                      const idxStep = i
                      const passed = idxStep < idxOrder
                      const isCurrent = idxStep === idxOrder
                      const isLastStep = step.slug === lastWorkflowSlug
                      const delivered =
                        !!lastWorkflowSlug &&
                        resolvedSelectedSlug === lastWorkflowSlug
                      const showCheck =
                        passed ||
                        (delivered && isLastStep && isCurrent)
                      const showCurrent =
                        isCurrent &&
                        !showCheck &&
                        selected.statusSlug !== "cancelled"
                      const pending = idxStep > idxOrder
                      const isLast = i === workflowStatuses.length - 1
                      return (
                        <li key={`${i}-${step.slug ?? "step"}`} className="flex gap-3">
                          <div className="flex flex-col items-center w-9 shrink-0">
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold border-2 z-10",
                                showCheck &&
                                  "bg-emerald-500 border-emerald-500 text-white",
                                showCurrent &&
                                  "bg-violet-600 border-violet-600 text-white",
                                pending &&
                                  "bg-white border-gray-200 text-gray-400"
                              )}
                            >
                              {showCheck ? (
                                <Check className="h-4 w-4" strokeWidth={3} />
                              ) : (
                                String(i + 1).padStart(2, "0")
                              )}
                            </div>
                            {!isLast && (
                              <div
                                className={cn(
                                  "w-0.5 grow min-h-[20px] -mb-1",
                                  i < idxOrder ? "bg-emerald-300" : "bg-gray-200"
                                )}
                              />
                            )}
                          </div>
                          <div className={cn("pb-6 pt-1.5", isLast && "pb-0")}>
                            <p
                              className={cn(
                                "text-sm font-medium",
                                showCurrent && "text-violet-700 font-semibold",
                                showCheck && !showCurrent && "text-emerald-800",
                                pending && "text-gray-400"
                              )}
                            >
                              {workflowStepLabelEs(
                                step.slug,
                                workflowStatuses
                              )}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Datos del Paciente
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Nombre</dt>
                      <dd className="font-medium text-gray-900">
                        {selected.patientName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Documento</dt>
                      <dd className="font-medium text-gray-900">
                        {selected.document}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Médico solicitante</dt>
                      <dd className="font-medium text-gray-900">
                        {selected.doctor}
                      </dd>
                    </div>
                    {selected.assignedName && (
                      <div>
                        <dt className="text-gray-500">Médico asignado</dt>
                        <dd className="font-medium text-gray-900">
                          {selected.assignedName}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-gray-500">Prioridad</dt>
                      <dd className="font-medium text-gray-900">
                        {priorityLabel(selected.priority)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Examen</dt>
                      <dd className="font-medium text-gray-900">
                        {selected.exam}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
