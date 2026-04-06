// Utilidades de autenticación

export interface LaboratoryInfo {
  id: number
  name: string
  logo: string | null
  logo_url: string | null
  color: string | null
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
  email_verified_at: string | null
  created_at: string
  updated_at: string
  profile_picture?: string | null
  profile_picture_url?: string | null
  laboratory?: LaboratoryInfo
  /** Algunas respuestas de `/auth/me` envían la org aquí en lugar de anidar `laboratory` */
  organization_id?: number | null
  laboratory_id?: number | null
}

/**
 * ID de organización/laboratorio para payloads (muestras, exámenes, etc.).
 * Prioriza `laboratory.id`, luego campos planos que a veces envía el backend.
 */
export function resolveOrganizationId(
  user: User | null | undefined
): number | undefined {
  if (!user) return undefined
  if (typeof user.laboratory?.id === "number") return user.laboratory.id
  if (typeof user.organization_id === "number") return user.organization_id
  if (typeof user.laboratory_id === "number") return user.laboratory_id
  const raw = user as Record<string, unknown>
  const org = raw.organization
  if (org && typeof org === "object" && org !== null && "id" in org) {
    const id = (org as { id: unknown }).id
    if (typeof id === "number") return id
  }
  return undefined
}

export interface AuthResponse {
  success: boolean
  message: string
  user: User
  authorization: {
    token: string
    type: string
  }
}

// Guardar el token en localStorage
export function saveAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

// Obtener el token de localStorage
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

// Guardar los datos del usuario
export function saveUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_data", JSON.stringify(user))
  }
}

// Obtener los datos del usuario
export function getUser(): User | null {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user_data")
    return userData ? JSON.parse(userData) : null
  }
  return null
}

// Limpiar la sesión (logout)
export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  }
}

// Verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}




