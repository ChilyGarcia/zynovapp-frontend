# Uso del Contexto de Autenticación

## Descripción

El contexto de autenticación (`AuthContext`) proporciona información del usuario autenticado en toda la aplicación. Después del login, automáticamente hace una petición a `/api/auth/me` para obtener los datos actualizados del usuario.

## Cómo usar el contexto

### 1. Importar el hook

```typescript
import { useAuth } from "@/contexts/auth-context"
```

### 2. Usar el hook en tu componente

```typescript
export default function MiComponente() {
  const { user, isLoading, isAuthenticated, logout, refreshUser } = useAuth()

  // Esperar mientras carga
  if (isLoading) {
    return <div>Cargando...</div>
  }

  // Verificar si está autenticado
  if (!isAuthenticated) {
    return <div>No autenticado</div>
  }

  return (
    <div>
      <h1>Hola, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Rol: {user.role}</p>
    </div>
  )
}
```

## Propiedades disponibles

### `user: User | null`
Datos del usuario autenticado:
- `id`: ID del usuario
- `name`: Nombre completo
- `email`: Email
- `role`: Rol (patient, laboratory)
- `is_active`: Estado activo
- `email_verified_at`: Fecha de verificación del email
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

### `isLoading: boolean`
Indica si se están cargando los datos del usuario

### `isAuthenticated: boolean`
Indica si hay un usuario autenticado (`user !== null`)

### `logout: () => Promise<void>`
Función asíncrona para cerrar sesión. Llama al endpoint `/api/auth/logout` del backend enviando el token, y luego limpia el token y datos del usuario del localStorage.

### `refreshUser: () => Promise<void>`
Función para actualizar los datos del usuario desde el servidor

## Ejemplo: Mostrar contenido según el rol

```typescript
"use client"

import { useAuth } from "@/contexts/auth-context"

export default function LabsPage() {
  const { user } = useAuth()

  return (
    <div>
      {user?.role === "patient" && (
        <div>Contenido para pacientes</div>
      )}
      
      {user?.role === "laboratory" && (
        <div>Contenido para laboratorios</div>
      )}
    </div>
  )
}
```

## Ejemplo: Botón de cerrar sesión

```typescript
"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    // logout ahora es asíncrono, llama al backend antes de limpiar
    await logout()
    router.push("/")
  }

  return (
    <Button onClick={handleLogout} variant="outline">
      Cerrar sesión
    </Button>
  )
}
```

**Nota**: La función `logout()` ahora es asíncrona porque:
1. Primero hace POST a `/api/auth/logout` enviando el token en el header `Authorization: Bearer {token}`
2. Luego limpia el token y datos del usuario del `localStorage`
3. Actualiza el estado global del contexto

## Flujo de autenticación

1. Usuario hace login en `/`
2. Se guarda el token en `localStorage`
3. Se hace petición a `/api/auth/me` para obtener datos del usuario
4. Los datos se guardan en el contexto global
5. Se redirige al dashboard
6. Todas las páginas tienen acceso a `user` a través de `useAuth()`

## Peticiones autenticadas

Para hacer peticiones que requieren autenticación, usa los helpers en `lib/api.ts`:

```typescript
import { apiGet, apiPost } from "@/lib/api"

// GET autenticado
const profile = await apiGet("/api/user/profile")

// POST autenticado
const result = await apiPost("/api/labs/submit", {
  examType: "hemograma",
  values: { ... }
})
```

El token se incluye automáticamente en el header `Authorization: Bearer {token}`.

