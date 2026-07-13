import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateWordBuffer, generatePdfFile } from './documentGenerator.js'

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
// Cada uno devuelve un objeto { success, ... } — nunca un string/null
// suelto — para que el renderer distinga con claridad tres casos:
// éxito, cancelado por el usuario, y error real. La generación del
// contenido (docx/pdfkit) vive en documentGenerator.js; acá solo se
// coordina el diálogo nativo, la escritura a disco y el manejo de errores.
async function handleDownloadWord(_event, machoteData) {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Guardar documento Word',
      defaultPath: nombreDeArchivo(machoteData, 'docx'),
      filters: [{ name: 'Documento Word', extensions: ['docx'] }],
    })

    if (result.canceled || !result.filePath) {
      console.log('[menteios:download-word] Cancelado por el usuario.')
      return { success: false, canceled: true }
    }

    const buffer = await generateWordBuffer(machoteData)
    fs.writeFileSync(result.filePath, buffer)

    console.log('[menteios:download-word] Documento generado en:', result.filePath)
    return { success: true, filePath: result.filePath }
  } catch (error) {
    console.error('[menteios:download-word] Error al generar el documento:', error)
    return { success: false, error: error.message }
  }
}

async function handleDownloadPdf(_event, machoteData) {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Guardar documento PDF',
      defaultPath: nombreDeArchivo(machoteData, 'pdf'),
      filters: [{ name: 'Documento PDF', extensions: ['pdf'] }],
    })

    if (result.canceled || !result.filePath) {
      console.log('[menteios:download-pdf] Cancelado por el usuario.')
      return { success: false, canceled: true }
    }

    await generatePdfFile(machoteData, result.filePath)

    console.log('[menteios:download-pdf] Documento generado en:', result.filePath)
    return { success: true, filePath: result.filePath }
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
