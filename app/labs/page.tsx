"use client"

import type React from "react"
import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import NavbarComponent from "@/components/navbar/navbar-component"
import FooterComponent from "@/components/footer/footer-component"
import {
  Home,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  CreditCard,
  HelpCircle,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react"

export default function LabsPage() {
  const [step, setStep] = useState(1)
  const [selectedExam, setSelectedExam] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const exams = useMemo(
    () => [
      { id: "hemograma", label: "Hemograma" },
      { id: "perfiles-bioquimicos", label: "Perfiles bioquímicos" },
      { id: "electrolitos", label: "Electrolitos" },
      { id: "marcadores-tumorales", label: "Marcadores tumorales" },
      { id: "coagulacion", label: "Coagulación" },
      { id: "inmunologia", label: "Inmunología" },
    ],
    []
  )

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(f ? URL.createObjectURL(f) : null)
  }, [previewUrl])

  const goNext = useCallback(() => {
    if (step === 1 && !selectedExam) return
    if (step === 2 && !file) return
    setStep((s) => Math.min(3, s + 1))
  }, [step, selectedExam, file])

  const goBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1))
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white/90 backdrop-blur-sm shadow-sm border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <img src="/icons/zynovapp-icon.png" alt="Zynovapp" className="h-5 w-auto" />
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              <SidebarItem icon={<Home className="w-5 h-5" />} label="Inicio" />
              <SidebarItem icon={<MessageSquare className="w-5 h-5" />} label="Consultar" />
              <SidebarItem icon={<FileText className="w-5 h-5" />} label="Mi Historia" />
              <SidebarItem icon={<Users className="w-5 h-5" />} label="Pacientes" />
              <SidebarItem icon={<Users className="w-5 h-5" />} label="Chequeos" />
              <SidebarItem icon={<BarChart3 className="w-5 h-5" />} label="Informes" />
              <SidebarItem icon={<AlertTriangle className="w-5 h-5" />} label="Alertas" />
              <SidebarItem icon={<CreditCard className="w-5 h-5" />} label="Pagos y Créditos" />
              <SidebarItem icon={<HelpCircle className="w-5 h-5" />} label="Soporte" />
            </nav>
          </div>

          {/* AIVIAPP Button */}
          <div className="p-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
              AIVIAPP
            </Button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <NavbarComponent />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Análisis de Laboratorios</h1>
                <p className="text-gray-600">Selecciona el examen, sube tu archivo y revisa resultados simulados.</p>
              </div>

              {/* Stepper */}
              <div className="mb-6">
                <Stepper step={step} />
              </div>

              {/* Steps */}
              {step === 1 && (
                <Card className="rounded-2xl border border-purple-100 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Selecciona el tipo de examen</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {exams.map((ex) => (
                        <button
                          key={ex.id}
                          onClick={() => setSelectedExam(ex.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            selectedExam === ex.id
                              ? "border-purple-500 bg-purple-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{ex.label}</span>
                            {selectedExam === ex.id ? (
                              <CheckCircle2 className="w-5 h-5 text-purple-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <Button variant="outline" disabled>
                        Atrás
                      </Button>
                      <Button onClick={goNext} disabled={!selectedExam} className="bg-purple-600 hover:bg-purple-700 text-white">
                        Siguiente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card className="rounded-2xl border border-purple-100 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Sube el archivo del examen</h2>
                    <p className="text-sm text-gray-600 mb-4">Acepta imágenes o PDF. Arrastra y suelta, o haz clic para seleccionar.</p>

                    <label
                      htmlFor="labs-file"
                      className="group block rounded-2xl border-2 border-dashed border-purple-200 bg-gradient-to-b from-white to-purple-50/50 hover:from-white hover:to-purple-100 transition-colors p-8 cursor-pointer"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-800 font-medium">Arrastra tu archivo aquí</p>
                        <p className="text-xs text-gray-500">o haz clic para buscar en tu dispositivo</p>
                      </div>
                      <Input id="labs-file" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                    </label>

                    {file && (
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                            </div>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Listo</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewUrl && file && file.type.startsWith("image/") && (
                      <div className="mt-4">
                        <img src={previewUrl} alt="Vista previa" className="max-h-64 rounded-xl border border-gray-200 shadow-sm" />
                      </div>
                    )}

                    <div className="mt-6 flex justify-between gap-3">
                      <Button variant="outline" onClick={goBack}>
                        Atrás
                      </Button>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => { setFile(null); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }}}>
                          Limpiar
                        </Button>
                        <Button onClick={goNext} disabled={!file} className="bg-purple-600 hover:bg-purple-700 text-white">
                          Analizar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card className="rounded-2xl border border-purple-100 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Resultados simulados</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Examen seleccionado: <span className="font-medium text-gray-900">{labelForExam(selectedExam, exams)}</span>
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Parámetros principales</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mockResults(selectedExam).map((r) => (
                            <div key={r.name} className="rounded-lg border border-gray-100 p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{r.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${r.flag === "alto" ? "bg-red-50 text-red-600" : r.flag === "bajo" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>
                                  {r.flag}
                                </span>
                              </div>
                              <div className="mt-1">
                                <span className="text-sm font-medium text-gray-900">{r.value}</span>
                                <span className="text-xs text-gray-500 ml-2">Ref: {r.ref}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Conclusión</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {mockConclusion(selectedExam)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between gap-3">
                      <Button variant="outline" onClick={goBack}>
                        Atrás
                      </Button>
                      <Button className="bg-gray-900 hover:bg-black text-white" onClick={() => { setStep(1); setSelectedExam(null); setFile(null); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) } }}>
                        Nuevo análisis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>

      <FooterComponent />
    </div>
  )
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

function SidebarItem({ icon, label, active = false, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
        active ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  )
}

function Stepper({ step }: { step: number }) {
  const state1: StepState = step > 1 ? "done" : step === 1 ? "active" : "todo"
  const state2: StepState = step > 2 ? "done" : step === 2 ? "active" : "todo"
  const state3: StepState = step === 3 ? "active" : step > 3 ? "done" : "todo"

  return (
    <div className="w-fit mx-auto">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <StepCircle index={1} state={state1} />
        <Connector active={step >= 2} />
        <StepCircle index={2} state={state2} />
        <Connector active={step >= 3} />
        <StepCircle index={3} state={state3} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-8 justify-items-center w-full">
        <StepLabel text="Examen" state={state1} />
        <StepLabel text="Archivo" state={state2} />
        <StepLabel text="Resultados" state={state3} />
      </div>
    </div>
  )
}

type StepState = "todo" | "active" | "done"

function StepCircle({ index, state }: { index: number; state: StepState }) {
  const circleClass =
    state === "done"
      ? "bg-green-600 text-white"
      : state === "active"
      ? "bg-purple-600 text-white"
      : "bg-gray-200 text-gray-600"

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${circleClass}`}>
      {state === "done" ? <Check className="w-5 h-5" /> : index}
    </div>
  )
}

function StepLabel({ text, state }: { text: string; state: StepState }) {
  return (
    <div className={`text-xs sm:text-sm font-medium whitespace-nowrap ${state !== "todo" ? "text-gray-900" : "text-gray-500"}`}>
      {text}
    </div>
  )
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className={`h-0.5 w-16 sm:w-24 md:w-32 rounded ${active ? "bg-purple-400" : "bg-gray-300"}`} />
  )
}

function labelForExam(selected: string | null, list: { id: string; label: string }[]) {
  if (!selected) return "—"
  return list.find((e) => e.id === selected)?.label ?? selected
}

function mockResults(selected: string | null): { name: string; value: string; ref: string; flag: "normal" | "alto" | "bajo" }[] {
  switch (selected) {
    case "hemograma":
      return [
        { name: "Hemoglobina", value: "13.8 g/dL", ref: "12 - 16", flag: "normal" },
        { name: "Hematocrito", value: "41%", ref: "36 - 46", flag: "normal" },
        { name: "Leucocitos", value: "11.2 x10^3/µL", ref: "4.0 - 11.0", flag: "alto" },
        { name: "Plaquetas", value: "150 x10^3/µL", ref: "150 - 450", flag: "normal" },
      ]
    case "perfiles-bioquimicos":
      return [
        { name: "Glucosa", value: "112 mg/dL", ref: "70 - 100", flag: "alto" },
        { name: "Creatinina", value: "0.9 mg/dL", ref: "0.6 - 1.1", flag: "normal" },
        { name: "Colesterol total", value: "182 mg/dL", ref: "< 200", flag: "normal" },
        { name: "Triglicéridos", value: "170 mg/dL", ref: "< 150", flag: "alto" },
      ]
    case "electrolitos":
      return [
        { name: "Sodio", value: "138 mmol/L", ref: "135 - 145", flag: "normal" },
        { name: "Potasio", value: "3.4 mmol/L", ref: "3.5 - 5.1", flag: "bajo" },
        { name: "Cloro", value: "104 mmol/L", ref: "98 - 107", flag: "normal" },
      ]
    case "marcadores-tumorales":
      return [
        { name: "CEA", value: "3.1 ng/mL", ref: "< 5.0", flag: "normal" },
        { name: "CA-125", value: "36 U/mL", ref: "< 35", flag: "alto" },
      ]
    case "coagulacion":
      return [
        { name: "TP (INR)", value: "1.2", ref: "0.8 - 1.2", flag: "normal" },
        { name: "TTPa", value: "36 s", ref: "25 - 35", flag: "alto" },
      ]
    case "inmunologia":
      return [
        { name: "PCR", value: "7 mg/L", ref: "< 5", flag: "alto" },
        { name: "IgG", value: "980 mg/dL", ref: "700 - 1600", flag: "normal" },
      ]
    default:
      return [
        { name: "Parámetro A", value: "—", ref: "—", flag: "normal" },
        { name: "Parámetro B", value: "—", ref: "—", flag: "normal" },
      ]
  }
}

function mockConclusion(selected: string | null): string {
  switch (selected) {
    case "hemograma":
      return "Leve leucocitosis que podría sugerir proceso infeccioso o inflamatorio agudo. Correlacionar con clínica."
    case "perfiles-bioquimicos":
      return "Alteración leve del metabolismo de carbohidratos y lípidos. Sugerido control dietario y repetición en 3 meses."
    case "electrolitos":
      return "Hipopotasemia leve. Considerar reposición y evaluación de pérdidas gastrointestinales o renales."
    case "marcadores-tumorales":
      return "Ligero aumento de CA-125. El resultado debe interpretarse con estudios de imagen y evaluación ginecológica."
    case "coagulacion":
      return "Tiempo de TTPa discretamente prolongado; evaluar medicación concomitante y función hepática si clínicamente indicado."
    case "inmunologia":
      return "PCR elevada sugiere proceso inflamatorio activo. Recomendada correlación con síntomas y otros marcadores."
    default:
      return "Resultados simulados a la espera de un examen seleccionado."
  }
}


