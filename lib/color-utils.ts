// Utilidades para manejo de colores del laboratorio

// Función helper para convertir hex a RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Función helper para convertir hex a rgba con opacidad
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
  }
  return hex
}

// Función para oscurecer un color (para efectos hover)
export function darkenColor(hex: string, amount: number = 20): string {
  const rgb = hexToRgb(hex)
  if (rgb) {
    return `rgb(${Math.max(0, rgb.r - amount)}, ${Math.max(0, rgb.g - amount)}, ${Math.max(0, rgb.b - amount)})`
  }
  return hex
}

// Función para aclarar un color (para fondos claros)
export function lightenColor(hex: string, amount: number = 20): string {
  const rgb = hexToRgb(hex)
  if (rgb) {
    return `rgb(${Math.min(255, rgb.r + amount)}, ${Math.min(255, rgb.g + amount)}, ${Math.min(255, rgb.b + amount)})`
  }
  return hex
}

// Función para obtener una variación del color con opacidad (útil para fondos)
export function getColorWithOpacity(hex: string, opacity: number): string {
  return hexToRgba(hex, opacity)
}
