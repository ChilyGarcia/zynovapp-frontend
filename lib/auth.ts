// Utilidades de autenticación

export interface User {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
  email_verified_at: string | null
  created_at: string
  updated_at: string
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




