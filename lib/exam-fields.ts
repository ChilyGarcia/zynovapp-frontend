// Definición de campos para cada tipo de examen según el API

export interface ExamField {
  parameter_name: string
  parameter_code?: string
  unit: string
  reference_min?: string
  reference_max?: string
  reference_text?: string
  placeholder?: string
}

export const examFieldsMap: Record<number, ExamField[]> = {
  // 1 - Hemograma Completo
  1: [
    { parameter_name: "Glóbulos Rojos", parameter_code: "RBC", unit: "millones/μL", reference_min: "4.5", reference_max: "5.5", placeholder: "4.8" },
    { parameter_name: "Hemoglobina", parameter_code: "HGB", unit: "g/dL", reference_min: "13.5", reference_max: "17.5", placeholder: "15.2" },
    { parameter_name: "Hematocrito", parameter_code: "HCT", unit: "%", reference_min: "40.0", reference_max: "50.0", placeholder: "45.0" },
    { parameter_name: "Glóbulos Blancos", parameter_code: "WBC", unit: "miles/μL", reference_min: "4.0", reference_max: "11.0", placeholder: "7.5" },
    { parameter_name: "Plaquetas", parameter_code: "PLT", unit: "miles/μL", reference_min: "150", reference_max: "400", placeholder: "250" },
    { parameter_name: "Neutrófilos", parameter_code: "NEUT", unit: "%", reference_min: "40", reference_max: "70", placeholder: "60" },
    { parameter_name: "Linfocitos", parameter_code: "LYMPH", unit: "%", reference_min: "20", reference_max: "40", placeholder: "30" },
    { parameter_name: "Monocitos", parameter_code: "MONO", unit: "%", reference_min: "2", reference_max: "10", placeholder: "7" },
  ],
  // 2 - Hemograma con Diferencial
  2: [
    { parameter_name: "Glóbulos Rojos", unit: "millones/μL", reference_min: "4.5", reference_max: "5.5", placeholder: "4.6" },
    { parameter_name: "Hemoglobina", unit: "g/dL", reference_min: "13.5", reference_max: "17.5", placeholder: "14.5" },
    { parameter_name: "Leucocitos Totales", unit: "miles/μL", reference_min: "4.0", reference_max: "11.0", placeholder: "8.2" },
    { parameter_name: "Neutrófilos Segmentados", unit: "%", reference_min: "40", reference_max: "70", placeholder: "65" },
    { parameter_name: "Linfocitos", unit: "%", reference_min: "20", reference_max: "40", placeholder: "25" },
    { parameter_name: "Monocitos", unit: "%", reference_min: "2", reference_max: "10", placeholder: "6" },
    { parameter_name: "Eosinófilos", unit: "%", reference_min: "1", reference_max: "6", placeholder: "3" },
    { parameter_name: "Basófilos", unit: "%", reference_min: "0", reference_max: "2", placeholder: "1" },
  ],
  // 3 - Perfil Bioquímico Básico
  3: [
    { parameter_name: "Glucosa", parameter_code: "GLU", unit: "mg/dL", reference_min: "70", reference_max: "100", placeholder: "95" },
    { parameter_name: "Urea", parameter_code: "BUN", unit: "mg/dL", reference_min: "15", reference_max: "45", placeholder: "28" },
    { parameter_name: "Creatinina", parameter_code: "CREA", unit: "mg/dL", reference_min: "0.7", reference_max: "1.3", placeholder: "0.9" },
    { parameter_name: "Ácido Úrico", parameter_code: "URIC", unit: "mg/dL", reference_min: "3.5", reference_max: "7.0", placeholder: "5.5" },
  ],
  // 4 - Perfil Lipídico
  4: [
    { parameter_name: "Colesterol Total", parameter_code: "CHOL", unit: "mg/dL", reference_max: "200", placeholder: "180" },
    { parameter_name: "HDL Colesterol", parameter_code: "HDL", unit: "mg/dL", reference_min: "40", placeholder: "55" },
    { parameter_name: "LDL Colesterol", parameter_code: "LDL", unit: "mg/dL", reference_max: "130", placeholder: "110" },
    { parameter_name: "Triglicéridos", parameter_code: "TRIG", unit: "mg/dL", reference_max: "150", placeholder: "120" },
    { parameter_name: "VLDL Colesterol", parameter_code: "VLDL", unit: "mg/dL", reference_max: "30", placeholder: "24" },
  ],
  // 5 - Perfil Hepático
  5: [
    { parameter_name: "TGO (AST)", parameter_code: "AST", unit: "U/L", reference_max: "40", placeholder: "28" },
    { parameter_name: "TGP (ALT)", parameter_code: "ALT", unit: "U/L", reference_max: "41", placeholder: "32" },
    { parameter_name: "Bilirrubina Total", parameter_code: "TBIL", unit: "mg/dL", reference_max: "1.2", placeholder: "0.8" },
    { parameter_name: "Bilirrubina Directa", parameter_code: "DBIL", unit: "mg/dL", reference_max: "0.3", placeholder: "0.2" },
    { parameter_name: "Bilirrubina Indirecta", parameter_code: "IBIL", unit: "mg/dL", reference_max: "0.9", placeholder: "0.6" },
    { parameter_name: "Fosfatasa Alcalina", parameter_code: "ALP", unit: "U/L", reference_min: "30", reference_max: "120", placeholder: "75" },
    { parameter_name: "Gamma GT", parameter_code: "GGT", unit: "U/L", reference_max: "55", placeholder: "25" },
  ],
  // 6 - Glucosa en Ayunas
  6: [
    { parameter_name: "Glucosa en Ayunas", parameter_code: "GLU", unit: "mg/dL", reference_min: "70", reference_max: "100", placeholder: "92" },
  ],
  // 7 - Hemoglobina Glicosilada
  7: [
    { parameter_name: "Hemoglobina Glicosilada", parameter_code: "HBA1C", unit: "%", reference_max: "6.5", placeholder: "5.8" },
    { parameter_name: "Glucosa Promedio Estimada", parameter_code: "EAG", unit: "mg/dL", reference_text: "Correlación con HbA1c", placeholder: "120" },
  ],
  // 8 - Electrolitos Séricos
  8: [
    { parameter_name: "Sodio", parameter_code: "NA", unit: "mEq/L", reference_min: "135", reference_max: "145", placeholder: "140" },
    { parameter_name: "Potasio", parameter_code: "K", unit: "mEq/L", reference_min: "3.5", reference_max: "5.0", placeholder: "4.2" },
    { parameter_name: "Cloro", parameter_code: "CL", unit: "mEq/L", reference_min: "98", reference_max: "107", placeholder: "102" },
  ],
  // 9 - Calcio Sérico
  9: [
    { parameter_name: "Calcio Total", parameter_code: "CA", unit: "mg/dL", reference_min: "8.5", reference_max: "10.5", placeholder: "9.5" },
    { parameter_name: "Calcio Iónico", parameter_code: "CAI", unit: "mg/dL", reference_min: "4.5", reference_max: "5.3", placeholder: "4.8" },
  ],
  // 10 - Magnesio Sérico
  10: [
    { parameter_name: "Magnesio", parameter_code: "MG", unit: "mg/dL", reference_min: "1.7", reference_max: "2.4", placeholder: "2.0" },
  ],
  // 11 - PSA
  11: [
    { parameter_name: "PSA Total", parameter_code: "PSA", unit: "ng/mL", reference_max: "4.0", placeholder: "2.5" },
    { parameter_name: "PSA Libre", parameter_code: "PSAL", unit: "ng/mL", placeholder: "0.6" },
    { parameter_name: "Relación PSA Libre/Total", parameter_code: "PSAR", unit: "%", reference_min: "15", placeholder: "24" },
  ],
  // 12 - CEA
  12: [
    { parameter_name: "CEA", parameter_code: "CEA", unit: "ng/mL", reference_max: "5.0", placeholder: "2.8" },
  ],
  // 13 - CA 125
  13: [
    { parameter_name: "CA 125", parameter_code: "CA125", unit: "U/mL", reference_max: "35", placeholder: "18" },
  ],
  // 14 - CA 19-9
  14: [
    { parameter_name: "CA 19-9", parameter_code: "CA199", unit: "U/mL", reference_max: "37", placeholder: "22" },
  ],
  // 15 - Tiempo de Protrombina
  15: [
    { parameter_name: "Tiempo de Protrombina", parameter_code: "PT", unit: "segundos", reference_min: "11.0", reference_max: "13.5", placeholder: "12.5" },
    { parameter_name: "INR", parameter_code: "INR", unit: "ratio", reference_min: "0.8", reference_max: "1.2", placeholder: "1.0" },
    { parameter_name: "Actividad de Protrombina", parameter_code: "PTA", unit: "%", reference_min: "70", reference_max: "130", placeholder: "95" },
  ],
  // 16 - TPT
  16: [
    { parameter_name: "TPT", parameter_code: "APTT", unit: "segundos", reference_min: "25", reference_max: "35", placeholder: "32" },
  ],
  // 17 - INR
  17: [
    { parameter_name: "INR", parameter_code: "INR", unit: "ratio", reference_min: "2.0", reference_max: "3.0", placeholder: "2.5" },
    { parameter_name: "Tiempo de Protrombina", parameter_code: "PT", unit: "segundos", placeholder: "25" },
  ],
  // 18 - Fibrinógeno
  18: [
    { parameter_name: "Fibrinógeno", parameter_code: "FIB", unit: "mg/dL", reference_min: "200", reference_max: "400", placeholder: "320" },
  ],
  // 19 - PCR
  19: [
    { parameter_name: "Proteína C Reactiva", parameter_code: "PCR", unit: "mg/L", reference_max: "10.0", placeholder: "3.5" },
  ],
  // 20 - PCR Ultrasensible
  20: [
    { parameter_name: "PCR Ultrasensible", parameter_code: "HSCRP", unit: "mg/L", reference_text: "Bajo riesgo: <1.0, Moderado: 1.0-3.0, Alto: >3.0", placeholder: "1.5" },
  ],
  // 21 - Factor Reumatoide
  21: [
    { parameter_name: "Factor Reumatoide", parameter_code: "RF", unit: "UI/mL", reference_max: "14", placeholder: "8" },
  ],
  // 22 - VSG
  22: [
    { parameter_name: "VSG", parameter_code: "ESR", unit: "mm/h", reference_max: "20", placeholder: "12" },
  ],
  // 23 - ANA
  23: [
    { parameter_name: "Anticuerpos Antinucleares", parameter_code: "ANA", unit: "", reference_text: "Negativo", placeholder: "Negativo" },
    { parameter_name: "Título ANA", parameter_code: "ANAT", unit: "", reference_text: "< 1:80 es negativo", placeholder: "1:40" },
    { parameter_name: "Patrón", parameter_code: "ANAP", unit: "", reference_text: "Solo si es positivo", placeholder: "No aplica" },
  ],
}

export function getExamFields(examTypeId: number | null): ExamField[] {
  if (!examTypeId) return []
  return examFieldsMap[examTypeId] || []
}




