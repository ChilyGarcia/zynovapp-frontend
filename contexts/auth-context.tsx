"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getAuthToken, saveUser, clearAuth, type User } from "@/lib/auth"
import { API_ENDPOINTS } from "@/lib/api-config"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Función para obtener los datos del usuario desde el backend
  const refreshUser = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(API_ENDPOINTS.me, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Manejar 401 - Token expirado
      if (response.status === 401) {
        console.log("Token expirado, cerrando sesión...")
        clearAuth()
        setUser(null)
        setIsLoading(false)
        if (typeof window !== "undefined") {
          window.location.href = "/"
        }
        return
      }

      if (!response.ok) {
        throw new Error("Error al obtener datos del usuario")
      }

      const data = await response.json()
      
      if (data.success && data.user) {
        setUser(data.user)
        saveUser(data.user)
      } else {
        throw new Error("Respuesta inválida del servidor")
      }
    } catch (error) {
      console.error("Error al obtener usuario:", error)
      // Si falla, limpiar la sesión
      clearAuth()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Función para cerrar sesión
  const logout = useCallback(async () => {
    const token = getAuthToken()
    
    // Si hay token, llamar al endpoint de logout del backend
    if (token) {
      try {
        await fetch(API_ENDPOINTS.logout, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        // Continuar con el logout local incluso si falla el backend
      } catch (error) {
        console.error("Error al cerrar sesión en el backend:", error)
        // Continuar con el logout local de todas formas
      }
    }
    
    // Limpiar datos locales
    clearAuth()
    setUser(null)
  }, [])

  // Al montar el componente, verificar si hay token y obtener usuario
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    setUser,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

