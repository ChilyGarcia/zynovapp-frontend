"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CreditCard,
  FileText,
  Loader2,
  Plus,
  Search,
  Stethoscope,
  User as UserIcon,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { User } from "@/lib/auth"
import {
  createLaboratoryExam,
  fetchOrderFormOptions,
  lookupPatientByDocument,
} from "@/lib/laboratory-ordenes-api"
import {
  REQUEST_TYPE_CODES,
  type CreateLaboratoryExamPayload,
  type LaboratoryExamApi,
  type LaboratoryPatientSearchData,
  type OrderFormOptionsData,
  type PriorityForm,
} from "@/lib/laboratory-ordenes-types"

const FALLBACK_PRIORITIES: { value: string; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
]

export interface NuevaOrdenMedicaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onOrderCreated: (exam: LaboratoryExamApi) => Promise<void> | void
  /** Mensaje de error en la vista principal; `null` limpia el aviso */
  onActionMessage: (message: string | null) => void
}

export function NuevaOrdenMedicaDialog({
  open,
  onOpenChange,
  user,
  onOrderCreated,
  onActionMessage,
}: NuevaOrdenMedicaDialogProps) {
  const [orderFormOptions, setOrderFormOptions] =
    useState<OrderFormOptionsData | null>(null)
  const [orderFormLoading, setOrderFormLoading] = useState(false)
  const [orderFormError, setOrderFormError] = useState<string | null>(null)

  const [formPatientSearch, setFormPatientSearch] = useState("")
  const [formDoc, setFormDoc] = useState("")
  const [patientCtx, setPatientCtx] = useState<{
    doc: string
    found: boolean
    data?: LaboratoryPatientSearchData
  } | null>(null)
  const [patientSearchLoading, setPatientSearchLoading] = useState(false)
  const [patientSearchError, setPatientSearchError] = useState<string | null>(
    null
  )
  const [formNewFirstName, setFormNewFirstName] = useState("")
  const [formNewLastName, setFormNewLastName] = useState("")
  const [formNewEmail, setFormNewEmail] = useState("")
  const [formNewPhone, setFormNewPhone] = useState("")
  const [formRequestTypeId, setFormRequestTypeId] = useState("")
  const [formExamTypeId, setFormExamTypeId] = useState("")
  const [formRequestingDoctorId, setFormRequestingDoctorId] = useState("")
  const [formAssignedDoctorId, setFormAssignedDoctorId] = useState("")
  const [formAssigneeId, setFormAssigneeId] = useState("")
  const [formPriority, setFormPriority] = useState<PriorityForm>("normal")
  const [formPaid, setFormPaid] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setOrderFormError(null)
    setOrderFormOptions(null)
    setFormPatientSearch("")
    setFormDoc("")
    setPatientCtx(null)
    setPatientSearchError(null)
    setFormNewFirstName("")
    setFormNewLastName("")
    setFormNewEmail("")
    setFormNewPhone("")
    setFormRequestTypeId("")
    setFormExamTypeId("")
    setFormRequestingDoctorId("")
    setFormAssignedDoctorId("")
    setFormAssigneeId("")
    setFormPriority("normal")
    setFormPaid(false)

    setOrderFormLoading(true)
    fetchOrderFormOptions()
      .then((opts) => {
        if (cancelled) return
        setOrderFormOptions(opts)
        const paidDefault = opts.payment?.default_is_paid === true
        setFormPaid(paidDefault)
        const labRequest = opts.request_types.find(
          (t) => t.code === REQUEST_TYPE_CODES.LAB_EXAM
        )
        if (labRequest) {
          setFormRequestTypeId(String(labRequest.id))
        } else if (opts.request_types[0]) {
          setFormRequestTypeId(String(opts.request_types[0].id))
        }
        const pri =
          opts.priorities.find((p) => p.value === "normal") ??
          opts.priorities[0]
        if (pri?.value) {
          setFormPriority(pri.value as PriorityForm)
        }
        const staffIds = opts.staff.map((s) => s.id)
        if (user?.id && staffIds.includes(user.id)) {
          setFormRequestingDoctorId(String(user.id))
          setFormAssignedDoctorId(String(user.id))
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setOrderFormError(
            e instanceof Error ? e.message : "Error al cargar el formulario"
          )
        }
      })
      .finally(() => {
        if (!cancelled) setOrderFormLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, user?.id])

  const patientDocStale =
    patientCtx != null && formDoc.trim() !== patientCtx.doc

  const patientStepOk = useMemo(() => {
    if (!patientCtx || patientDocStale) return false
    if (patientCtx.found) return Boolean(patientCtx.data?.patient_id)
    return Boolean(formNewFirstName.trim() && formNewLastName.trim())
  }, [patientCtx, patientDocStale, formNewFirstName, formNewLastName])

  const runPatientDocumentSearch = useCallback(async () => {
    const doc = formDoc.trim()
    if (!doc) {
      setPatientSearchError("Ingresa un número de documento.")
      return
    }
    setPatientSearchLoading(true)
    setPatientSearchError(null)
    setPatientCtx(null)
    try {
      const r = await lookupPatientByDocument(doc)
      setPatientCtx({ doc, found: r.found, data: r.data })
      if (r.found && r.data) {
        const full = [r.data.first_name, r.data.last_name]
          .filter(Boolean)
          .join(" ")
          .trim()
        setFormPatientSearch(full || "—")
        setFormNewFirstName("")
        setFormNewLastName("")
      } else {
        setFormPatientSearch("")
      }
    } catch (e) {
      setPatientCtx(null)
      setPatientSearchError(
        e instanceof Error ? e.message : "Error al buscar paciente"
      )
    } finally {
      setPatientSearchLoading(false)
    }
  }, [formDoc])

  const createOrder = useCallback(async () => {
    const doc = formDoc.trim()
    if (
      !doc ||
      !formRequestTypeId ||
      !formExamTypeId ||
      !formRequestingDoctorId ||
      !formAssignedDoctorId
    ) {
      onActionMessage(
        "Completa documento del paciente, tipo de solicitud, examen y médicos."
      )
      return
    }
    if (!patientCtx || patientCtx.doc !== doc || patientDocStale) {
      onActionMessage(
        "Busca el paciente por documento y usa un resultado vigente antes de crear la orden."
      )
      return
    }
    if (!patientCtx.found) {
      if (!formNewFirstName.trim() || !formNewLastName.trim()) {
        onActionMessage(
          "No hay paciente con ese documento en tu organización: completa nombre, apellido y datos del nuevo paciente."
        )
        return
      }
    }

    const base: CreateLaboratoryExamPayload = {
      patient_document: doc,
      document_type:
        patientCtx.found && patientCtx.data?.document_type
          ? String(patientCtx.data.document_type)
          : "CC",
      exam_type_id: Number(formExamTypeId),
      exam_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      request_type_id: Number(formRequestTypeId),
      requesting_doctor_id: Number(formRequestingDoctorId),
      assigned_doctor_id: Number(formAssignedDoctorId),
      assignee_user_id: formAssigneeId ? Number(formAssigneeId) : null,
      priority: formPriority,
      is_paid: formPaid,
    }

    const payload: CreateLaboratoryExamPayload =
      patientCtx.found && patientCtx.data
        ? {
            ...base,
            patient_id: patientCtx.data.patient_id,
          }
        : {
            ...base,
            patient_first_name: formNewFirstName.trim(),
            patient_last_name: formNewLastName.trim(),
            patient_email: formNewEmail.trim() || undefined,
            patient_phone: formNewPhone.trim() || undefined,
          }

    setSaving(true)
    onActionMessage(null)
    try {
      const created = await createLaboratoryExam(payload)
      await onOrderCreated(created)
      onOpenChange(false)
    } catch (e) {
      onActionMessage(
        e instanceof Error ? e.message : "No se pudo crear la orden"
      )
    } finally {
      setSaving(false)
    }
  }, [
    formDoc,
    formRequestTypeId,
    formExamTypeId,
    formRequestingDoctorId,
    formAssignedDoctorId,
    formAssigneeId,
    formPriority,
    formPaid,
    patientCtx,
    patientDocStale,
    formNewFirstName,
    formNewLastName,
    formNewEmail,
    formNewPhone,
    onOrderCreated,
    onOpenChange,
    onActionMessage,
  ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-100">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Nueva Orden Médica</DialogTitle>
            </div>
          </DialogHeader>
        </div>
        <div className="relative p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {orderFormLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-lg">
              <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            </div>
          )}
          {orderFormError && (
            <Alert variant="destructive">
              <AlertTitle>No se cargaron las opciones</AlertTitle>
              <AlertDescription>{orderFormError}</AlertDescription>
            </Alert>
          )}
          {orderFormOptions && orderFormOptions.request_types.length === 0 && (
            <Alert>
              <AlertTitle>Sin tipos de solicitud</AlertTitle>
              <AlertDescription>
                Crea tipos con{" "}
                <code className="text-xs">
                  POST /api/laboratory/request-types
                </code>{" "}
                antes de generar órdenes.
              </AlertDescription>
            </Alert>
          )}
          {orderFormOptions && orderFormOptions.exam_types.length === 0 && (
            <Alert>
              <AlertTitle>Sin tipos de examen</AlertTitle>
              <AlertDescription>
                Alta los tipos de examen en el flujo habitual del laboratorio; el
                backend no inventa listas vacías.
              </AlertDescription>
            </Alert>
          )}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-violet-700 font-medium text-sm">
              <UserIcon className="h-4 w-4" />
              Paciente
            </div>
            <p className="text-xs text-gray-500">
              Busca por documento en tu organización. Si no existe, podrás
              registrar los datos del nuevo paciente.
            </p>
            {patientSearchError && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription>{patientSearchError}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="space-y-2 flex-1">
                <Label>Documento</Label>
                <Input
                  placeholder="Número de documento"
                  value={formDoc}
                  onChange={(e) => {
                    setFormDoc(e.target.value)
                    setPatientSearchError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      void runPatientDocumentSearch()
                    }
                  }}
                  disabled={orderFormLoading}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => void runPatientDocumentSearch()}
                  disabled={orderFormLoading || patientSearchLoading}
                >
                  {patientSearchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
            {patientDocStale && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                El documento cambió respecto a la última búsqueda. Pulsa{" "}
                <strong>Buscar</strong> de nuevo.
              </p>
            )}
            {patientCtx &&
              !patientDocStale &&
              patientCtx.found &&
              patientCtx.data && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 space-y-1 text-sm">
                  <p className="font-semibold text-emerald-900">
                    Paciente en tu organización
                  </p>
                  <p className="text-gray-800">
                    <span className="text-gray-500">Nombre: </span>
                    {formPatientSearch || "—"}
                  </p>
                  <p className="text-gray-800">
                    <span className="text-gray-500">Documento: </span>
                    {patientCtx.data.document_type ?? "CC"}{" "}
                    {patientCtx.data.document_number ?? formDoc.trim()}
                  </p>
                  {(patientCtx.data.phone || patientCtx.data.email) && (
                    <p className="text-gray-700 text-xs">
                      {patientCtx.data.phone && (
                        <span>Tel: {patientCtx.data.phone} </span>
                      )}
                      {patientCtx.data.email && (
                        <span>· {patientCtx.data.email}</span>
                      )}
                    </p>
                  )}
                </div>
              )}
            {patientCtx && !patientDocStale && !patientCtx.found && (
              <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50/50 p-4">
                <div className="flex items-center gap-2 text-violet-800 font-medium text-sm">
                  <UserPlus className="h-4 w-4" />
                  Nuevo paciente en tu organización
                </div>
                <p className="text-xs text-gray-600">
                  No hay paciente con este documento. Completa los datos para
                  darlo de alta al crear la orden.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={formNewFirstName}
                      onChange={(e) => setFormNewFirstName(e.target.value)}
                      placeholder="Nombre"
                      disabled={orderFormLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input
                      value={formNewLastName}
                      onChange={(e) => setFormNewLastName(e.target.value)}
                      placeholder="Apellido"
                      disabled={orderFormLoading}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formNewEmail}
                      onChange={(e) => setFormNewEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      disabled={orderFormLoading}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={formNewPhone}
                      onChange={(e) => setFormNewPhone(e.target.value)}
                      placeholder="Teléfono"
                      disabled={orderFormLoading}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-violet-700 font-medium text-sm">
              <FileText className="h-4 w-4" />
              Información de la Orden
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Solicitud</Label>
                <Select
                  value={formRequestTypeId || undefined}
                  onValueChange={setFormRequestTypeId}
                  disabled={orderFormLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(orderFormOptions?.request_types ?? []).map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Examen</Label>
                <Select
                  value={formExamTypeId || undefined}
                  onValueChange={setFormExamTypeId}
                  disabled={orderFormLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar examen" />
                  </SelectTrigger>
                  <SelectContent>
                    {(orderFormOptions?.exam_types ?? []).map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-violet-700 font-medium text-sm">
              <Stethoscope className="h-4 w-4" />
              Asignación
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Médico Solicitante</Label>
                <Select
                  value={formRequestingDoctorId || undefined}
                  onValueChange={setFormRequestingDoctorId}
                  disabled={orderFormLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {(orderFormOptions?.staff ?? []).map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Médico asignado</Label>
                <Select
                  value={formAssignedDoctorId || undefined}
                  onValueChange={setFormAssignedDoctorId}
                  disabled={orderFormLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Quién avanza estados" />
                  </SelectTrigger>
                  <SelectContent>
                    {(orderFormOptions?.staff ?? []).map((m) => (
                      <SelectItem key={`as-${m.id}`} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Asignar a (opcional)</Label>
                <Select
                  value={formAssigneeId || undefined}
                  onValueChange={setFormAssigneeId}
                  disabled={orderFormLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Bacteriólogo / Auxiliar" />
                  </SelectTrigger>
                  <SelectContent>
                    {(orderFormOptions?.staff ?? []).map((m) => (
                      <SelectItem key={`a-${m.id}`} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={formPriority}
                  onValueChange={(v) => setFormPriority(v as PriorityForm)}
                  disabled={orderFormLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      orderFormOptions?.priorities?.length
                        ? orderFormOptions.priorities
                        : FALLBACK_PRIORITIES
                    ).map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 gap-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-normal">Estado de Pago</Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {formPaid ? "Pagado" : "Sin Pagar"}
                  </span>
                  <Switch checked={formPaid} onCheckedChange={setFormPaid} />
                </div>
              </div>
            </div>
          </section>
        </div>
        <DialogFooter className="p-6 pt-2 border-t border-gray-100 bg-gray-50/80">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            onClick={() => void createOrder()}
            disabled={
              saving ||
              orderFormLoading ||
              patientSearchLoading ||
              !orderFormOptions?.request_types?.length ||
              !orderFormOptions?.exam_types?.length ||
              !orderFormOptions?.staff?.length ||
              !patientStepOk
            }
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Crear Orden
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
