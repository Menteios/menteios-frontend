import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = !app.isPackaged
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    center: true,
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // false para poder usar `import` (ESM) en preload.js, igual que acá.
      // El renderer sigue sin acceso a Node: contextIsolation ya se encarga
      // de eso, que es la protección que realmente importa.
      sandbox: false,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL(devServerUrl)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

function nombreDeArchivo(machoteData, extension) {
  const base = (machoteData?.nombreArchivo || 'documento').trim()
  return `${base}.${extension}`
}

// --- Handlers de IPC para Reportes (machotes clínicos) --------------------
// Por ahora solo abren el diálogo nativo y registran en consola qué se
// habría generado. El día que se conecte la generación real de archivos
// (ej. librerías `docx` / `pdfkit` + `fs.writeFile`), ese código va acá,
// justo donde están los comentarios TODO — ni el preload ni el renderer
// necesitan cambiar.
async function handleDownloadWord(_event, machoteData) {
  const result = await dialog.showSaveDialog({
    title: 'Guardar documento Word',
    defaultPath: nombreDeArchivo(machoteData, 'docx'),
    filters: [{ name: 'Documento Word', extensions: ['docx'] }],
  })

  if (result.canceled || !result.filePath) {
    console.log('[menteios:download-word] Cancelado por el usuario.')
    return null
  }

  console.log('[menteios:download-word] Ruta seleccionada:', result.filePath)
  console.log('[menteios:download-word] Datos del machote:', machoteData)
  // TODO: generar el .docx real (ej. con la librería `docx`) y escribirlo
  // en `result.filePath` con `fs.writeFile`.

  return result.filePath
}

async function handleDownloadPdf(_event, machoteData) {
  const result = await dialog.showSaveDialog({
    title: 'Guardar documento PDF',
    defaultPath: nombreDeArchivo(machoteData, 'pdf'),
    filters: [{ name: 'Documento PDF', extensions: ['pdf'] }],
  })

  if (result.canceled || !result.filePath) {
    console.log('[menteios:download-pdf] Cancelado por el usuario.')
    return null
  }

  console.log('[menteios:download-pdf] Ruta seleccionada:', result.filePath)
  console.log('[menteios:download-pdf] Datos del machote:', machoteData)
  // TODO: generar el .pdf real (ej. con `pdfkit`) y escribirlo en
  // `result.filePath` con `fs.writeFile`.

  return result.filePath
}

async function handleBulkExport(_event, arrayMachotes) {
  // Exportar varios machotes a la vez necesita una carpeta destino, no un
  // único archivo — por eso acá se usa showOpenDialog con
  // `openDirectory` en vez de showSaveDialog.
  const result = await dialog.showOpenDialog({
    title: 'Selecciona la carpeta destino para exportar',
    properties: ['openDirectory', 'createDirectory'],
  })

  if (result.canceled || result.filePaths.length === 0) {
    console.log('[menteios:bulk-export] Cancelado por el usuario.')
    return null
  }

  const carpetaDestino = result.filePaths[0]
  console.log(`[menteios:bulk-export] Exportando ${arrayMachotes.length} documento(s) a:`, carpetaDestino)
  console.log('[menteios:bulk-export] Machotes seleccionados:', arrayMachotes)
  // TODO: por cada machote, generar su archivo dentro de `carpetaDestino`.

  return carpetaDestino
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.handle('menteios:download-word', handleDownloadWord)
  ipcMain.handle('menteios:download-pdf', handleDownloadPdf)
  ipcMain.handle('menteios:bulk-export', handleBulkExport)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
