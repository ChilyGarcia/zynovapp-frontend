"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Beaker,
  Box,
  Calendar,
  CheckCircle2,
  Clock,
  FlaskConical,
  Loader2,
  MapPin,
  Package,
  Plus,
  Search,
  StickyNote,
  Thermometer,
  Warehouse,
  ArrowRightLeft,
  FileBarChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { resolveOrganizationId } from "@/lib/auth"
import {
  createSample,
  fetchSamples,
  fetchSamplesStats,
  fetchSampleById,
} from "@/lib/samples-api"
import {
  sampleDescriptionLine,
  sampleLocationLine,
  samplePatientName,
  sampleTypeDisplay,
  type CreateSamplePayload,
  type SampleApi,
  type SampleStatusApi,
  type SamplesStats,
} from "@/lib/samples-types"
import NavbarComponent from "@/components/navbar/navbar-component"
import FooterComponent from "@/components/footer/footer-component"
import SidebarComponent from "@/components/sidebar/sidebar-component"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const FILTER_OPTIONS: { value: "all" | SampleStatusApi; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activa" },
  { value: "in_process", label: "En Proceso" },
  { value: "processed", label: "Procesada" },
  { value: "expired", label: "Vencida" },
]

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase()
  if (s === "in_process")
    return "bg-amber-50 text-amber-900 border-amber-200 ring-1 ring-amber-100"
  if (s === "processed")
    return "bg-sky-50 text-sky-900 border-sky-200 ring-1 ring-sky-100"
  if (s === "expired")
    return "bg-red-50 text-red-900 border-red-200 ring-1 ring-red-100"
  if (s === "active")
    return "bg-emerald-50 text-emerald-900 border-emerald-200 ring-1 ring-emerald-100"
  return "bg-gray-50 text-gray-800 border-gray-200"
}

function statusLabelEs(status: string): string {
  const m: Record<string, string> = {
    active: "Activa",
    in_process: "En Proceso",
    processed: "Procesada",
    expired: "Vencida",
  }
  return m[status] ?? status
}

function formatDt(iso: string | null | undefined): string {
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
    return iso
  }
}

/** Valor de `datetime-local` (sin segundos) → string con `:00` para el backend */
function normalizeDateTimeForApi(raw: string): string | undefined {
  if (!raw?.trim()) return undefined
  const v = raw.trim()
  if (v.length === 16 && v.includes("T")) return `${v}:00`
  return v
}

export function InventarioMuestrasView() {
  const { user, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<SamplesStats | null>(null)
  const [samples, setSamples] = useState<SampleApi[]>([])
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | SampleStatusApi>("all")
  const [registerOpen, setRegisterOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [detailSample, setDetailSample] = useState<SampleApi | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  /** Formulario registrar (solo inventario) */
  const [fSampleTypeId, setFSampleTypeId] = useState("")
  const [fCode, setFCode] = useState("")
  const [fStorageLocation, setFStorageLocation] = useState("")
  const [fCollected, setFCollected] = useState("")
  const [fExpires, setFExpires] = useState("")
  const [fNotes, setFNotes] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const reload = useCallback(async () => {
    if (!user) return
    setLoadState("loading")
    setLoadError(null)
    try {
      const [st, list] = await Promise.all([
        fetchSamplesStats(),
        fetchSamples({
          search: debouncedSearch,
          status: statusFilter,
          per_page: 50,
        }),
      ])
      setStats(st)
      setSamples(list)
      setLoadState("ready")
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Error al cargar")
      setLoadState("error")
    }
  }, [user, debouncedSearch, statusFilter])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoadState("idle")
      return
    }
    reload()
  }, [authLoading, user, reload])

  useEffect(() => {
    if (!detailId) {
      setDetailSample(null)
      return
    }
    let cancelled = false
    setDetailLoading(true)
    fetchSampleById(detailId)
      .then((s) => {
        if (!cancelled) setDetailSample(s)
      })
      .catch(() => {
        if (!cancelled) setDetailSample(null)
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [detailId])

  const chipOptions = useMemo(() => {
    const fromApi = stats?.status_filters
    if (fromApi?.length) {
      return [
        { value: "all" as const, label: "Todos" },
        ...fromApi.map((x) => ({
          value: x.value as "all" | SampleStatusApi,
          label: x.label,
        })),
      ]
    }
    return FILTER_OPTIONS
  }, [stats?.status_filters])

  async function submitRegister() {
    setActionError(null)
    const orgId = resolveOrganizationId(user)
    const typeId = Number.parseInt(fSampleTypeId.trim(), 10)
    if (!fSampleTypeId.trim() || Number.isNaN(typeId) || typeId < 1) {
      setActionError("Indica un ID de tipo de muestra válido.")
      return
    }
    const collectedNorm = normalizeDateTimeForApi(fCollected)
    const expiresNorm = normalizeDateTimeForApi(fExpires)
    if (collectedNorm && expiresNorm) {
      const t1 = Date.parse(collectedNorm)
      const t2 = Date.parse(expiresNorm)
      if (!Number.isNaN(t1) && !Number.isNaN(t2) && t2 <= t1) {
        setActionError(
          "La fecha de vencimiento debe ser posterior a la fecha y hora de toma."
        )
        return
      }
    }
    setSaving(true)
    try {
      const body: CreateSamplePayload = {
        sample_type: fSampleTypeId.trim(),
        code: fCode.trim() || undefined,
        storage_location: fStorageLocation.trim() || undefined,
        collected_at: collectedNorm,
        expires_at: expiresNorm,
        notes: fNotes.trim() || undefined,
        status: "active",
      }
      if (orgId != null) body.organization_id = orgId
      await createSample(body)
      setRegisterOpen(false)
      setFSampleTypeId("")
      setFCode("")
      setFStorageLocation("")
      setFCollected("")
      setFExpires("")
      setFNotes("")
      await reload()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loadState === "loading" || loadState === "idle") {
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
                  Inicia sesión para ver el inventario de muestras.
                </AlertDescription>
              </Alert>
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
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Inventario de Muestras
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">
                    Control y trazabilidad de muestras clínicas
                  </p>
                </div>
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white shrink-0 rounded-xl h-11 px-5"
                  onClick={() => {
                    setActionError(null)
                    setRegisterOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Muestra
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="border border-gray-200/80 shadow-sm bg-white rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <Beaker className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Muestras Activas
                      </p>
                      <p className="text-2xl font-bold text-gray-900 tabular-nums">
                        {stats?.active_samples ?? "—"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200/80 shadow-sm bg-white rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        En Proceso
                      </p>
                      <p className="text-2xl font-bold text-gray-900 tabular-nums">
                        {stats?.in_process ?? "—"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200/80 shadow-sm bg-white rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Procesadas Hoy
                      </p>
                      <p className="text-2xl font-bold text-gray-900 tabular-nums">
                        {stats?.processed_today ?? "—"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200/80 shadow-sm bg-white rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Alertas
                      </p>
                      <p className="text-2xl font-bold text-gray-900 tabular-nums">
                        {stats?.alerts ?? "—"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="registro" className="space-y-4">
                <TabsList className="bg-white border border-gray-200 rounded-xl p-1 h-auto flex-wrap gap-1">
                  <TabsTrigger
                    value="registro"
                    className="rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white gap-2"
                  >
                    <Box className="h-4 w-4" />
                    Registro
                  </TabsTrigger>
                  <TabsTrigger
                    value="almacenamiento"
                    className="rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white gap-2"
                  >
                    <Warehouse className="h-4 w-4" />
                    Almacenamiento
                  </TabsTrigger>
                  <TabsTrigger
                    value="movimientos"
                    className="rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white gap-2"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    Movimientos
                  </TabsTrigger>
                  <TabsTrigger
                    value="reportes"
                    className="rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white gap-2"
                  >
                    <FileBarChart className="h-4 w-4" />
                    Reportes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="registro" className="mt-0 space-y-4">
                  <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar por código, ubicación o tipo..."
                            className="pl-10 bg-gray-50 border-gray-200 rounded-xl h-11"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {chipOptions.map((chip) => (
                            <button
                              key={chip.value}
                              type="button"
                              onClick={() =>
                                setStatusFilter(
                                  chip.value as "all" | SampleStatusApi
                                )
                              }
                              className={cn(
                                "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium border transition-colors",
                                statusFilter === chip.value
                                  ? "bg-violet-600 text-white border-violet-600"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                              )}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {samples.length === 0 ? (
                    <Card className="border border-dashed border-gray-300 bg-white/80 rounded-xl">
                      <CardContent className="py-16 text-center text-gray-500">
                        <FlaskConical className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        No hay muestras que coincidan con los filtros.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {samples.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setDetailId(s.id)}
                          className="text-left rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-violet-200 transition-all p-4 flex flex-col gap-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-xs font-semibold text-gray-800">
                              {s.sample_code}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0",
                                statusBadgeClass(String(s.status))
                              )}
                            >
                              {statusLabelEs(String(s.status))}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base leading-snug">
                              {samplePatientName(s)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {sampleDescriptionLine(s)}
                            </p>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                              <span>{sampleLocationLine(s)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span>
                                {s.temperature_celsius != null &&
                                s.temperature_celsius !== ""
                                  ? `${s.temperature_celsius}°C`
                                  : "—"}
                              </span>
                              {s.temperature_verified ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                              <span className="text-gray-600">
                                Tomada: {formatDt(s.collected_at)}
                              </span>
                            </div>
                          </div>
                          <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {s.exam?.order_number
                                ? s.exam.order_number
                                : s.exam_id
                                  ? `Orden #${s.exam_id}`
                                  : "Sin orden"}
                            </span>
                            <span>Vence: {formatDt(s.expires_at)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="almacenamiento">
                  <Card className="border border-gray-200 bg-white rounded-xl">
                    <CardContent className="py-12 text-center text-gray-500">
                      Vista de almacenamiento próximamente.
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="movimientos">
                  <Card className="border border-gray-200 bg-white rounded-xl">
                    <CardContent className="py-12 text-center text-gray-500">
                      Historial de movimientos próximamente.
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="reportes">
                  <Card className="border border-gray-200 bg-white rounded-xl">
                    <CardContent className="py-12 text-center text-gray-500">
                      Reportes próximamente.
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
      <FooterComponent />

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Registrar muestra</DialogTitle>
            <p className="text-sm text-gray-500 font-normal pt-1">
              Alta solo de inventario. El código de muestra lo genera el servidor.
              La vinculación a orden o paciente ocurre al tomar la muestra en el
              flujo clínico.
            </p>
          </DialogHeader>
          {actionError && (
            <Alert variant="destructive" className="border-red-200">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-3 text-sm">
            {resolveOrganizationId(user) != null ? (
              <p className="text-xs text-gray-500">
                Organización ID en la petición:{" "}
                <span className="font-mono">{resolveOrganizationId(user)}</span>
              </p>
            ) : (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                La organización se asignará desde tu sesión en el servidor (no se
                envía <span className="font-mono">organization_id</span> en el
                cuerpo).
              </p>
            )}
            <div className="space-y-1">
              <Label>ID tipo de muestra *</Label>
              <Input
                inputMode="numeric"
                placeholder="Ej. 1"
                value={fSampleTypeId}
                onChange={(e) => setFSampleTypeId(e.target.value)}
                className="rounded-lg"
              />
              <p className="text-xs text-gray-400">
                Identificador del catálogo de tipos de muestra en tu sistema.
              </p>
            </div>
            <div className="space-y-1">
              <Label>Código (opcional)</Label>
              <Input
                value={fCode}
                onChange={(e) => setFCode(e.target.value)}
                placeholder="Referencia interna si aplica"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label>Ubicación de almacenamiento</Label>
              <Input
                value={fStorageLocation}
                onChange={(e) => setFStorageLocation(e.target.value)}
                placeholder="Ej. Rack A — Pos. 12"
                className="rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tomada (fecha/hora)</Label>
                <Input
                  type="datetime-local"
                  value={fCollected}
                  onChange={(e) => setFCollected(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <Label>Vencimiento</Label>
                <Input
                  type="datetime-local"
                  value={fExpires}
                  onChange={(e) => setFExpires(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notas</Label>
              <Textarea
                value={fNotes}
                onChange={(e) => setFNotes(e.target.value)}
                rows={3}
                className="rounded-lg"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRegisterOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 rounded-xl"
              onClick={submitRegister}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={detailId != null} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-lg p-0 gap-0 flex flex-col bg-[#eef0f4] border-l overflow-hidden">
          {detailLoading ? (
            <div className="flex flex-1 items-center justify-center py-20 bg-[#eef0f4]">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : detailSample ? (
            <>
              <div className="bg-white border-b border-gray-200 px-6 pt-6 pb-4 shrink-0">
                <SheetHeader className="space-y-3 p-0 text-left">
                  <SheetTitle className="text-lg font-semibold text-gray-900">
                    Detalle de muestra
                  </SheetTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-2.5 py-1">
                      {detailSample.sample_code}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full border",
                        statusBadgeClass(String(detailSample.status))
                      )}
                    >
                      {statusLabelEs(String(detailSample.status))}
                    </span>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2">
                      <Package className="h-4 w-4 text-violet-600 shrink-0" />
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Identificación
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Origen / paciente
                        </p>
                        <p className="text-base font-semibold text-gray-900 leading-snug">
                          {samplePatientName(detailSample)}
                        </p>
                      </div>
                      <div className="h-px bg-gray-100" />
                      <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Tipo de muestra
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {sampleTypeDisplay(detailSample)}
                        </p>
                        {sampleDescriptionLine(detailSample) !== "—" &&
                        sampleDescriptionLine(detailSample) !==
                          sampleTypeDisplay(detailSample) ? (
                          <p className="text-sm text-gray-600 mt-1.5">
                            {sampleDescriptionLine(detailSample)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-violet-600 shrink-0" />
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Ubicación y condiciones
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      <div className="flex items-start justify-between gap-4 px-4 py-3">
                        <span className="text-sm text-gray-500 shrink-0 pt-0.5">
                          Ubicación
                        </span>
                        <span className="text-sm font-medium text-gray-900 text-right">
                          {sampleLocationLine(detailSample)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 px-4 py-3">
                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-emerald-600 shrink-0" />
                          Temperatura
                        </span>
                        <span className="text-sm font-medium text-gray-900 tabular-nums">
                          {detailSample.temperature_celsius != null
                            ? `${detailSample.temperature_celsius}°C`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-violet-600 shrink-0" />
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Fechas
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      <div className="flex items-center justify-between gap-4 px-4 py-3">
                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                          Tomada
                        </span>
                        <span className="text-sm font-medium text-gray-900 text-right tabular-nums">
                          {formatDt(detailSample.collected_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 px-4 py-3">
                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                          Vencimiento
                        </span>
                        <span className="text-sm font-medium text-gray-900 text-right tabular-nums">
                          {formatDt(detailSample.expires_at)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {detailSample.notes?.trim() ? (
                  <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
                    <CardContent className="p-0">
                      <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2">
                        <StickyNote className="h-4 w-4 text-violet-600 shrink-0" />
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                          Notas
                        </h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
                          {detailSample.notes}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 bg-[#eef0f4]">
              <p className="text-gray-500 text-sm text-center">
                No se pudo cargar el detalle.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
