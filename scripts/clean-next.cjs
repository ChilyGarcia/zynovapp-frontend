/**
 * Elimina .next antes de arrancar el servidor de desarrollo para evitar
 * manifiestos o chunks a medias (404 en /_next/static/... en Windows).
 * Quita el script "predev" de package.json si el arranque te resulta demasiado lento.
 */
const fs = require("fs")
const path = require("path")

const root = path.join(__dirname, "..")
const nextDir = path.join(root, ".next")
const cacheDir = path.join(root, "node_modules", ".cache")

try {
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true })
    process.stdout.write("[dev] Carpeta .next eliminada para un arranque limpio.\n")
  }
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true })
    process.stdout.write("[dev] Caché de node_modules/.cache eliminada.\n")
  }
} catch (err) {
  process.stderr.write(
    `[dev] No se pudo limpiar (¿tienes otro next dev en marcha?). Cierra ese proceso y vuelve a ejecutar npm run dev.\n${err.message}\n`
  )
}
