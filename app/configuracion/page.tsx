"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { API_ENDPOINTS } from "@/lib/api-config"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { darkenColor } from "@/lib/color-utils"
import NavbarComponent from "@/components/navbar/navbar-component"
import FooterComponent from "@/components/footer/footer-component"
import SidebarComponent from "@/components/sidebar/sidebar-component"
import { Loader2, CheckCircle2, AlertCircle, Upload, X, Settings, User, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConfiguracionPage() {
  const { user, refreshUser, laboratoryColor, laboratoryLogo } = useAuth()
  const router = useRouter()
  
  // Color por defecto si no hay color del laboratorio
  const defaultColor = "#6366F1" // purple-500
  const activeColor = laboratoryColor || defaultColor
  
  // Estados para perfil
  const [profileName, setProfileName] = useState("")
  const [profileEmail, setProfileEmail] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [originalName, setOriginalName] = useState("")
  const [originalEmail, setOriginalEmail] = useState("")
  
  // Estados para laboratorio
  const [labName, setLabName] = useState("")
  const [labPhone, setLabPhone] = useState("")
  const [labColor, setLabColor] = useState("#FF5733")
  const [labCity, setLabCity] = useState("")
  const [labLogo, setLabLogo] = useState<File | null>(null)
  const [labLogoPreview, setLabLogoPreview] = useState<string | null>(null)
  
  // Estados generales
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveProfileError, setSaveProfileError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveProfileSuccess, setSaveProfileSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profilePictureInputRef = useRef<HTMLInputElement>(null)
  
  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      const name = user.name || ""
      const email = user.email || ""
      setProfileName(name)
      setProfileEmail(email)
      setOriginalName(name)
      setOriginalEmail(email)
      // Mostrar la foto de perfil actual del usuario
      if (user.profile_picture_url) {
        setProfilePicturePreview(user.profile_picture_url)
      }
      
      if (user.role === "laboratory" && user.laboratory) {
        setLabName(user.laboratory.name || "")
        setLabPhone("") // El teléfono no viene en la respuesta actual
        setLabColor(user.laboratory.color || "#FF5733")
        setLabCity("") // La ciudad no viene en la respuesta actual
        setLabLogoPreview(user.laboratory.logo_url || null)
      }
      
      setIsLoading(false)
    }
  }, [user])
  
  // Manejar selección de logo
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setSaveError("Por favor, selecciona un archivo de imagen válido")
        return
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSaveError("El archivo debe ser menor a 5MB")
        return
      }
      
      setLabLogo(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLabLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      setSaveError(null)
    }
  }
  
  // Eliminar logo seleccionado
  const handleRemoveLogo = () => {
    setLabLogo(null)
    setLabLogoPreview(user?.laboratory?.logo_url || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  // Manejar selección de foto de perfil
  const handleProfilePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setSaveProfileError("Por favor, selecciona un archivo de imagen válido")
        return
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSaveProfileError("El archivo debe ser menor a 5MB")
        return
      }
      
      setProfilePicture(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      setSaveProfileError(null)
    }
  }
  
  // Eliminar foto de perfil seleccionada
  const handleRemoveProfilePicture = () => {
    setProfilePicture(null)
    // Restaurar la foto actual del usuario si existe
    setProfilePicturePreview(user?.profile_picture_url || null)
    if (profilePictureInputRef.current) {
      profilePictureInputRef.current.value = ""
    }
  }
  
  // Guardar configuración del perfil
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    setSaveProfileError(null)
    setSaveProfileSuccess(false)
    
    try {
      // Verificar si hay cambios comparando con los valores originales
      const hasNameChange = profileName.trim() !== originalName.trim()
      const hasEmailChange = profileEmail.trim() !== originalEmail.trim()
      const hasPictureChange = profilePicture !== null
      
      // Si no hay cambios, no hacer nada
      if (!hasNameChange && !hasEmailChange && !hasPictureChange) {
        setSaveProfileError("No hay cambios para guardar")
        setIsSavingProfile(false)
        return
      }
      
      // Si hay foto de perfil, usar FormData (multipart/form-data)
      if (hasPictureChange) {
        // Verificar que el archivo existe antes de crear el FormData
        if (!profilePicture) {
          throw new Error("No se seleccionó ninguna foto de perfil")
        }
        
        const formData = new FormData()
        
        // Según la especificación del usuario:
        // Caso 1: "Actualizar con foto de perfil" - name, email, profile_picture (todos juntos)
        // Caso 2: "Actualizar solo la foto" - solo profile_picture
        
        // IMPORTANTE: Cuando hay foto, usar los valores actuales del formulario
        // Si no hay valores nuevos, usar los valores originales para evitar el error
        // "No se proporcionaron datos para actualizar"
        const nameToSend = (profileName && profileName.trim()) || originalName.trim()
        const emailToSend = (profileEmail && profileEmail.trim()) || originalEmail.trim()
        
        // Siempre enviar name y email cuando hay foto (usar valores actuales o originales)
        // Esto asegura que el backend reciba datos para actualizar
        if (nameToSend) {
          formData.append("name", nameToSend)
        }
        if (emailToSend) {
          formData.append("email", emailToSend)
        }
        // La foto siempre se envía
        formData.append("profile_picture", profilePicture)
        
        // Debug: Verificar que el FormData tenga datos
        if (process.env.NODE_ENV === 'development') {
          const entries: Array<[string, string | File]> = []
          formData.forEach((value, key) => {
            entries.push([key, value])
          })
          console.log("FormData preparado:", {
            entries: entries.map(([key, value]) => ({
              key,
              value: value instanceof File ? `${value.name} (${value.size} bytes, ${value.type})` : value
            })),
            hasPicture: formData.has("profile_picture")
          })
        }
        
        const response = await fetchWithAuth(API_ENDPOINTS.authProfile, {
          method: "PUT",
          body: formData,
        })
        
        // Leer la respuesta una sola vez
        const result = await response.json().catch(() => null)
        
        if (!response.ok) {
          let errorMessage = "Error al actualizar el perfil"
          if (result) {
            errorMessage = result.message || result.error || errorMessage
            // Si hay errores de validación, mostrarlos
            if (result.errors) {
              const validationErrors = Object.values(result.errors).flat().join(", ")
              errorMessage = validationErrors || errorMessage
            }
          } else {
            errorMessage = `Error ${response.status}: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }
        
        // Verificar que la respuesta sea exitosa (algunos servidores no devuelven {success: true})
        if (result && result.success === false) {
          throw new Error(result.message || "Error al actualizar el perfil")
        }
        
        // Si no hay foto pero hay otros datos, usar JSON
      } else {
        // Caso: Actualizar solo datos sin foto (JSON)
        // Según especificación: "Actualizar solo el nombre" - solo name en JSON
        const payload: Record<string, string> = {}
        
        if (hasNameChange && profileName.trim()) {
          payload.name = profileName.trim()
        }
        if (hasEmailChange && profileEmail.trim()) {
          payload.email = profileEmail.trim()
        }
        
        // Solo enviar si hay datos que actualizar
        if (Object.keys(payload).length > 0) {
          const response = await fetchWithAuth(API_ENDPOINTS.authProfile, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
          
          // Leer la respuesta una sola vez
          const result = await response.json().catch(() => null)
          
          if (!response.ok) {
            let errorMessage = "Error al actualizar el perfil"
            if (result) {
              errorMessage = result.message || result.error || errorMessage
              // Si hay errores de validación, mostrarlos
              if (result.errors) {
                const validationErrors = Object.values(result.errors).flat().join(", ")
                errorMessage = validationErrors || errorMessage
              }
            } else {
              errorMessage = `Error ${response.status}: ${response.statusText}`
            }
            throw new Error(errorMessage)
          }
          
          // Verificar que la respuesta sea exitosa
          if (result && result.success === false) {
            throw new Error(result.message || "Error al actualizar el perfil")
          }
        }
      }
      
      // Actualizar datos del usuario
      await refreshUser()
      
      // Actualizar el preview con la nueva foto del servidor
      // Esperar un momento para que el servidor procese la imagen
      if (hasPictureChange) {
        setTimeout(async () => {
          await refreshUser()
          // El useEffect se ejecutará automáticamente y actualizará el preview
        }, 1000)
      }
      
      // Limpiar estados después de guardar
      setProfilePicture(null)
      
      // Actualizar valores originales con los nuevos valores guardados
      setOriginalName(profileName)
      setOriginalEmail(profileEmail)
      
      setSaveProfileSuccess(true)
      setTimeout(() => {
        setSaveProfileSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error("Error al guardar perfil:", error)
      setSaveProfileError(error instanceof Error ? error.message : "Error al guardar el perfil")
    } finally {
      setIsSavingProfile(false)
    }
  }
  
  // Guardar configuración del laboratorio
  const handleSaveLaboratory = async () => {
    if (user?.role !== "laboratory") {
      setSaveError("Solo los laboratorios pueden configurar estos datos")
      return
    }
    
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    
    try {
      // Si hay logo, usar FormData (multipart/form-data)
      if (labLogo) {
        const formData = new FormData()
        
        if (labName) formData.append("name", labName)
        if (labPhone) formData.append("phone", labPhone)
        if (labColor) formData.append("color", labColor)
        if (labCity) formData.append("city", labCity)
        formData.append("logo", labLogo)
        
        const response = await fetchWithAuth(API_ENDPOINTS.laboratoryProfile, {
          method: "PUT",
          body: formData,
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Error al actualizar el perfil" }))
          throw new Error(errorData.message || "Error al actualizar el perfil del laboratorio")
        }
        
        // Si no hay logo pero hay otros datos, usar JSON
      } else {
        const payload: Record<string, string> = {}
        
        if (labName) payload.name = labName
        if (labPhone) payload.phone = labPhone
        if (labColor) payload.color = labColor
        if (labCity) payload.city = labCity
        
        // Solo enviar si hay datos que actualizar
        if (Object.keys(payload).length > 0) {
          const response = await fetchWithAuth(API_ENDPOINTS.laboratoryProfile, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Error al actualizar el perfil" }))
            throw new Error(errorData.message || "Error al actualizar el perfil del laboratorio")
          }
        }
      }
      
      // Actualizar datos del usuario
      await refreshUser()
      
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      setSaveError(error instanceof Error ? error.message : "Error al guardar la configuración")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Si no está autenticado, redirigir
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])
  
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: activeColor }} />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavbarComponent />
      
      <div className="flex flex-1">
        <SidebarComponent />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-8 h-8" style={{ color: activeColor }} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-500">Gestiona tu perfil y configuración</p>
              </div>
            </div>
            
            {/* Mensaje de éxito del perfil */}
            {saveProfileSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Perfil actualizado correctamente</span>
              </div>
            )}
            
            {/* Mensaje de éxito del laboratorio */}
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Configuración del laboratorio guardada correctamente</span>
              </div>
            )}
            
            {/* Mensaje de error del perfil */}
            {saveProfileError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{saveProfileError}</span>
                <button
                  onClick={() => setSaveProfileError(null)}
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Mensaje de error del laboratorio */}
            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{saveError}</span>
                <button
                  onClick={() => setSaveError(null)}
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Perfil de Usuario */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" style={{ color: activeColor }} />
                  <CardTitle>Perfil de Usuario</CardTitle>
                </div>
                <CardDescription>Información básica de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Foto de perfil */}
                <div className="space-y-2">
                  <Label>Foto de Perfil</Label>
                  <div className="space-y-4">
                    {/* Preview de la foto actual */}
                    {(profilePicturePreview || user?.profile_picture_url) && (
                      <div className="relative inline-block">
                        <img
                          src={profilePicturePreview || user?.profile_picture_url || ""}
                          alt="Foto de perfil"
                          className="h-24 w-24 object-cover rounded-full border-2"
                          style={{ borderColor: activeColor + "40" }}
                          onError={(e) => {
                            // Si falla la carga, ocultar la imagen
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                          }}
                        />
                        {profilePicture && (
                          <button
                            onClick={handleRemoveProfilePicture}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            title="Eliminar nueva foto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Input de archivo */}
                    <div className="flex items-center gap-4">
                      <input
                        ref={profilePictureInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureSelect}
                        className="hidden"
                        id="profile-picture-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => profilePictureInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {profilePicture ? "Cambiar Foto" : "Subir Foto de Perfil"}
                      </Button>
                      {profilePicture && (
                        <span className="text-sm text-gray-600">{profilePicture.name}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profileName">Nombre</Label>
                  <Input
                    id="profileName"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profileEmail">Correo electrónico</Label>
                  <Input
                    id="profileEmail"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Input
                    value={user.role === "laboratory" ? "Laboratorio" : "Paciente"}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">El rol no se puede modificar</p>
                </div>
                
                {/* Botón de guardar */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="min-w-32 text-white"
                    style={{
                      backgroundColor: activeColor,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSavingProfile) {
                        e.currentTarget.style.backgroundColor = darkenColor(activeColor, 20)
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSavingProfile) {
                        e.currentTarget.style.backgroundColor = activeColor
                      }
                    }}
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Configuración de Laboratorio */}
            {user.role === "laboratory" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" style={{ color: activeColor }} />
                    <CardTitle>Configuración del Laboratorio</CardTitle>
                  </div>
                  <CardDescription>Personaliza la información y apariencia de tu laboratorio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Nombre del laboratorio */}
                  <div className="space-y-2">
                    <Label htmlFor="labName">Nombre del Laboratorio</Label>
                    <Input
                      id="labName"
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      placeholder="Nombre de tu laboratorio"
                    />
                  </div>
                  
                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="labPhone">Teléfono</Label>
                    <Input
                      id="labPhone"
                      type="tel"
                      value={labPhone}
                      onChange={(e) => setLabPhone(e.target.value)}
                      placeholder="1234567890"
                    />
                  </div>
                  
                  {/* Ciudad */}
                  <div className="space-y-2">
                    <Label htmlFor="labCity">Ciudad</Label>
                    <Input
                      id="labCity"
                      value={labCity}
                      onChange={(e) => setLabCity(e.target.value)}
                      placeholder="Bogotá"
                    />
                  </div>
                  
                  {/* Color */}
                  <div className="space-y-2">
                    <Label htmlFor="labColor">Color del Laboratorio</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="labColor"
                        type="color"
                        value={labColor}
                        onChange={(e) => setLabColor(e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={labColor}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^#([A-Fa-f0-9]{6})$/.test(value) || value === "") {
                            setLabColor(value || "#FF5733")
                          }
                        }}
                        placeholder="#FF5733"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Este color se usará en el sidebar y botones de la aplicación
                    </p>
                    {/* Preview del color */}
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-12 h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: labColor }}
                      />
                      <span className="text-sm text-gray-600">Vista previa del color</span>
                    </div>
                  </div>
                  
                  {/* Logo */}
                  <div className="space-y-2">
                    <Label>Logo del Laboratorio</Label>
                    <div className="space-y-4">
                      {/* Preview del logo actual */}
                      {labLogoPreview && (
                        <div className="relative inline-block">
                          <img
                            src={labLogoPreview}
                            alt="Logo del laboratorio"
                            className="h-24 w-auto object-contain border border-gray-200 rounded-lg p-2 bg-white"
                          />
                          {labLogo && (
                            <button
                              onClick={handleRemoveLogo}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              title="Eliminar nuevo logo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Input de archivo */}
                      <div className="flex items-center gap-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoSelect}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {labLogo ? "Cambiar Logo" : "Subir Logo"}
                        </Button>
                        {labLogo && (
                          <span className="text-sm text-gray-600">{labLogo.name}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
                      </p>
                    </div>
                  </div>
                  
                  {/* Botón de guardar */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={handleSaveLaboratory}
                      disabled={isSaving}
                      className="min-w-32 text-white"
                      style={{
                        backgroundColor: activeColor,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSaving) {
                          const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(activeColor)
                          if (rgb) {
                            const r = Math.max(0, parseInt(rgb[1], 16) - 20)
                            const g = Math.max(0, parseInt(rgb[2], 16) - 20)
                            const b = Math.max(0, parseInt(rgb[3], 16) - 20)
                            e.currentTarget.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
                          }
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.backgroundColor = activeColor
                        }
                      }}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      
      <FooterComponent />
    </div>
  )
}
