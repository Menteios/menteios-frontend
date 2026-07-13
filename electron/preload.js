import { contextBridge, ipcRenderer } from 'electron'

// Puente seguro entre el renderer (React) y el proceso principal. Con
// contextIsolation: true, el renderer nunca ve `ipcRenderer` ni ningún
// módulo de Node directamente — solo estos tres métodos de
// `window.menteiosAPI`, cada uno mapeado 1:1 a un canal `ipcMain.handle`
// en electron/main.js. `invoke` devuelve una Promise con la respuesta del
// proceso principal (ej. la ruta que eligió el usuario, o null si canceló).
contextBridge.exposeInMainWorld('menteiosAPI', {
  downloadWord: (machoteData) => ipcRenderer.invoke('menteios:download-word', machoteData),
  downloadPdf: (machoteData) => ipcRenderer.invoke('menteios:download-pdf', machoteData),
  bulkExport: (arrayMachotes) => ipcRenderer.invoke('menteios:bulk-export', arrayMachotes),
  getPacientes: () => ipcRenderer.invoke('menteios:get-pacientes'),
  addPaciente: (paciente) => ipcRenderer.invoke('menteios:add-paciente', paciente),
  deletePaciente: (id) => ipcRenderer.invoke('menteios:delete-paciente', id),
  getCitas: () => ipcRenderer.invoke('menteios:get-citas'),
  addCita: (cita) => ipcRenderer.invoke('menteios:add-cita', cita),
  deleteCita: (id) => ipcRenderer.invoke('menteios:delete-cita', id),
})
