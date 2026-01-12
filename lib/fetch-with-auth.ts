// Helper para hacer fetch con manejo automático de errores 401

import { clearAuth } from "./auth"

import { getAuthToken } from "./auth"

/**
 * Wrapper de fetch que maneja automáticamente errores 401 (token expirado)
 * Cuando detecta un 401, limpia la sesión y redirige al login
 * Agrega automáticamente el token de autenticación a las peticiones
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = getAuthToken()
  
  // Preparar headers
  const headers = new Headers(init?.headers)
  
  // Si hay token, agregar header de autorización
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  
  // Si no es FormData, agregar Content-Type
  // (FormData establece automáticamente su Content-Type con boundary)
  if (!(init?.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }
  }
  
  // Crear opciones de fetch con headers actualizados
  const fetchOptions: RequestInit = {
    ...init,
    headers,
  }
  
  const response = await fetch(input, fetchOptions)

  // Si es 401, el token expiró o es inválido
  if (response.status === 401) {
    // Limpiar autenticación
    clearAuth()
    
    // Redirigir al login
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
    
    // Lanzar error para que el código que llamó pueda manejarlo
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.")
  }

  return response
}

/**
 * Helper para verificar si una respuesta es 401 y manejarla
 * Usa esto cuando no puedas usar fetchWithAuth directamente
 */
export function handle401(response: Response): void {
  if (response.status === 401) {
    clearAuth()
    
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
    
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.")
  }
}




