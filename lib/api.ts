// Utilidades para hacer peticiones al API con autenticación

import { getAuthToken, clearAuth } from "./auth"

export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean
}

/**
 * Función helper para hacer peticiones al API
 * Automáticamente incluye el token de autenticación si está disponible
 * Maneja errores 401 cerrando la sesión automáticamente
 */
export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { requiresAuth = false, headers = {}, ...restOptions } = options

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  }

  // Si la petición requiere autenticación, agregar el token
  if (requiresAuth) {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No hay token de autenticación disponible")
    }
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  })

  // Manejar error 401 - Token expirado o inválido
  if (response.status === 401) {
    // Limpiar autenticación
    clearAuth()
    
    // Redirigir al login
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
    
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Error en la petición",
    }))
    throw new Error(error.message || `Error ${response.status}`)
  }

  return response.json()
}

/**
 * Petición GET autenticada
 */
export function apiGet<T>(url: string, requiresAuth = true): Promise<T> {
  return apiRequest<T>(url, { method: "GET", requiresAuth })
}

/**
 * Petición POST autenticada
 */
export function apiPost<T>(
  url: string,
  data: unknown,
  requiresAuth = true
): Promise<T> {
  return apiRequest<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth,
  })
}

/**
 * Petición PUT autenticada
 */
export function apiPut<T>(
  url: string,
  data: unknown,
  requiresAuth = true
): Promise<T> {
  return apiRequest<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
    requiresAuth,
  })
}

/**
 * Petición DELETE autenticada
 */
export function apiDelete<T>(url: string, requiresAuth = true): Promise<T> {
  return apiRequest<T>(url, { method: "DELETE", requiresAuth })
}

