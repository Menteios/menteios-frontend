import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateWordBuffer, generatePdfFile } from './documentGenerator.js'
import {
  initDatabase,
  getPacientes,
  addPaciente,
  deletePaciente,
  getCitas,
  addCita,
  deleteCita,
} from './database.js'

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

// Nombre de archivo "de sistema": espacios a guion bajo para que el
// resultado (ej. "Hoja_de_seguimiento.docx") sea prolijo tanto en
// Descargas como en la carpeta que el usuario elija para la exportación
// en lote.
function nombreDeArchivo(machoteData, extension) {
  const base = (machoteData?.nombreArchivo || 'documento').trim().replace(/\s+/g, '_')
  return `${base}.${extension}`
}

// --- Handlers de IPC para Reportes (machotes clínicos) --------------------
// Cada uno devuelve un objeto { success, ... } — nunca un string/null
// suelto — para que el renderer distinga con claridad éxito de error
// real. La generación del contenido (docx/pdfkit) vive en
// documentGenerator.js; acá solo se coordina la escritura a disco, la
// apertura automática y el manejo de errores.
//
// Word y PDF ya no preguntan dónde guardar: se generan directo en
// Descargas (app.getPath('downloads')) — a diferencia de os.tmpdir(),
// esa carpeta persiste después de cerrar la app, así el usuario puede
// volver a encontrar el archivo aunque ya se haya abierto en Word/
// Vista Previa. Después de escribir el archivo, shell.openPath lo abre
// con la aplicación que macOS tenga asociada, para edición inmediata.
async function handleDownloadWord(_event, machoteData) {
  try {
    const filePath = path.join(app.getPath('downloads'), nombreDeArchivo(machoteData, 'docx'))
    const buffer = await generateWordBuffer(machoteData)
    fs.writeFileSync(filePath, buffer)

    const errorAlAbrir = await shell.openPath(filePath)
    if (errorAlAbrir) {
      console.warn('[menteios:download-word] Documento generado pero no se pudo abrir automáticamente:', errorAlAbrir)
    }

    console.log('[menteios:download-word] Documento generado en:', filePath)
    return { success: true, filePath }
  } catch (error) {
    console.error('[menteios:download-word] Error al generar el documento:', error)
    return { success: false, error: error.message }
  }
}

async function handleDownloadPdf(_event, machoteData) {
  try {
    const filePath = path.join(app.getPath('downloads'), nombreDeArchivo(machoteData, 'pdf'))
    await generatePdfFile(machoteData, filePath)

    const errorAlAbrir = await shell.openPath(filePath)
    if (errorAlAbrir) {
      console.warn('[menteios:download-pdf] Documento generado pero no se pudo abrir automáticamente:', errorAlAbrir)
    }

    console.log('[menteios:download-pdf] Documento generado en:', filePath)
    return { success: true, filePath }
  } catch (error) {
    console.error('[menteios:download-pdf] Error al generar el documento:', error)
    return { success: false, error: error.message }
  }
}

async function handleBulkExport(_event, arrayMachotes) {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Selecciona la carpeta destino para exportar',
      properties: ['openDirectory', 'createDirectory'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      console.log('[menteios:bulk-export] Cancelado por el usuario.')
      return { success: false, canceled: true }
    }

    const carpetaDestino = result.filePaths[0]

    // Exportación en lote genera un .docx por machote — el formato "oficial
    // editable" tiene más sentido para varios documentos a la vez que un
    // PDF por archivo; se puede sumar la versión PDF más adelante sin
    // tocar el resto de este handler.
    for (const machote of arrayMachotes) {
      const filePath = path.join(carpetaDestino, nombreDeArchivo(machote, 'docx'))
      const buffer = await generateWordBuffer(machote)
      fs.writeFileSync(filePath, buffer)
    }

    console.log(`[menteios:bulk-export] ${arrayMachotes.length} documento(s) exportado(s) a:`, carpetaDestino)
    return { success: true, folderPath: carpetaDestino, count: arrayMachotes.length }
  } catch (error) {
    console.error('[menteios:bulk-export] Error al exportar en lote:', error)
    return { success: false, error: error.message }
  }
}

// --- Handlers de IPC para Pacientes (persistencia real en SQLite) ---------
// Mismo formato de respuesta { success, ... } que el resto de canales: el
// renderer siempre distingue éxito real de error, nunca recibe un throw
// crudo por IPC.
async function handleGetPacientes() {
  try {
    return { success: true, pacientes: getPacientes() }
  } catch (error) {
    console.error('[menteios:get-pacientes] Error al leer pacientes:', error)
    return { success: false, error: error.message }
  }
}

async function handleAddPaciente(_event, paciente) {
  try {
    addPaciente(paciente)
    return { success: true }
  } catch (error) {
    console.error('[menteios:add-paciente] Error al insertar paciente:', error)
    return { success: false, error: error.message }
  }
}

async function handleDeletePaciente(_event, id) {
  try {
    deletePaciente(id)
    return { success: true }
  } catch (error) {
    console.error('[menteios:delete-paciente] Error al eliminar paciente:', error)
    return { success: false, error: error.message }
  }
}

// --- Handlers de IPC para Citas (persistencia real en SQLite) -------------
async function handleGetCitas() {
  try {
    return { success: true, citas: getCitas() }
  } catch (error) {
    console.error('[menteios:get-citas] Error al leer citas:', error)
    return { success: false, error: error.message }
  }
}

async function handleAddCita(_event, cita) {
  try {
    addCita(cita)
    return { success: true }
  } catch (error) {
    console.error('[menteios:add-cita] Error al insertar cita:', error)
    return { success: false, error: error.message }
  }
}

async function handleDeleteCita(_event, id) {
  try {
    deleteCita(id)
    return { success: true }
  } catch (error) {
    console.error('[menteios:delete-cita] Error al eliminar cita:', error)
    return { success: false, error: error.message }
  }
}

app.whenReady().then(() => {
  initDatabase()
  createWindow()

  ipcMain.handle('menteios:download-word', handleDownloadWord)
  ipcMain.handle('menteios:download-pdf', handleDownloadPdf)
  ipcMain.handle('menteios:bulk-export', handleBulkExport)
  ipcMain.handle('menteios:get-pacientes', handleGetPacientes)
  ipcMain.handle('menteios:add-paciente', handleAddPaciente)
  ipcMain.handle('menteios:delete-paciente', handleDeletePaciente)
  ipcMain.handle('menteios:get-citas', handleGetCitas)
  ipcMain.handle('menteios:add-cita', handleAddCita)
  ipcMain.handle('menteios:delete-cita', handleDeleteCita)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
