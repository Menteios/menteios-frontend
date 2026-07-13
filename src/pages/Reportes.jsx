import { useMemo, useState } from 'react'
import { SearchIcon, DownloadIcon, PencilIcon, WordFileIcon, PdfFileIcon } from '../components/icons/DashboardIcons'
import Toast from '../components/Toast'

// Dataset inicial de machotes/plantillas clínicas oficiales. `useState` (en
// vez de una const fija) porque este listado eventualmente se cargará y
// modificará desde el backend — hoy nace de este array, mañana de un
// fetch/query, y las ediciones del usuario ya quedan aplicadas con .map().
const MACHOTES_INICIALES = [
  {
    id: 1,
    nombreArchivo: 'Hoja de seguimiento',
    descripcion:
      'Contiene el objetivo de la sesion, lo verbalizado por el paciente en sesion, conduta obsevada, atencion, informacion referida por la familia y recomendaciones.',
  },
  {
    id: 2,
    nombreArchivo: 'Formato solicitud llenado de cuestionarios',
    descripcion:
      'La psicóloga solicita a los docentes que completen las Escalas de Evaluación del alumno con base en sus observaciones en el aula, para apoyar su proceso de evaluación y diagnóstico clínico, agradeciendo de antemano su colaboración.',
  },
  {
    id: 3,
    nombreArchivo: 'Solicitud de permiso para realizar observacion aulica',
    descripcion:
      'La psicóloga solicita a los docentes completar las Escalas de Evaluación del alumno para apoyar su proceso de evualación y diagnóstico clínico.',
  },
  {
    id: 4,
    nombreArchivo: 'Registro de sesion con equipo escolar, familiar y especialista externa',
    descripcion: 'Contiene los acuerdos y compromisos.',
  },
]

export default function Reportes() {
  const [machotes, setMachotes] = useState(MACHOTES_INICIALES)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [borrador, setBorrador] = useState({ nombreArchivo: '', descripcion: '' })
  const [toast, setToast] = useState({ show: false, message: '' })

  function mostrarToast(message) {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 3000)
  }

  // Handlers aislados: delegan en `window.menteiosAPI` (expuesto por
  // electron/preload.js vía contextBridge) y solo traducen la respuesta
  // estructurada `{ success, canceled, error, ... }` del proceso principal
  // en feedback visual — la generación real del .docx/.pdf vive del lado
  // de Electron (electron/documentGenerator.js).
  //
  // `window.menteiosAPI` solo existe dentro de Electron; si se corre
  // `npm run dev` en el navegador (sin Electron), se avisa por consola en
  // vez de romper la pantalla.
  async function handleDownloadWord(id, datosActuales) {
    if (!window.menteiosAPI) {
      console.warn('menteiosAPI no disponible: corré la app con npm run electron:dev')
      return
    }
    const respuesta = await window.menteiosAPI.downloadWord(datosActuales)
    if (respuesta.success) {
      console.log(`Word (id ${id}) guardado en:`, respuesta.filePath)
      mostrarToast('Documento Word generado y abierto')
    } else if (!respuesta.canceled) {
      console.error(`Word (id ${id}) falló:`, respuesta.error)
      mostrarToast('No se pudo generar el documento Word')
    }
  }

  async function handleDownloadPdf(id, datosActuales) {
    if (!window.menteiosAPI) {
      console.warn('menteiosAPI no disponible: corré la app con npm run electron:dev')
      return
    }
    const respuesta = await window.menteiosAPI.downloadPdf(datosActuales)
    if (respuesta.success) {
      console.log(`PDF (id ${id}) guardado en:`, respuesta.filePath)
      mostrarToast('Documento PDF generado y abierto')
    } else if (!respuesta.canceled) {
      console.error(`PDF (id ${id}) falló:`, respuesta.error)
      mostrarToast('No se pudo generar el documento PDF')
    }
  }

  async function handleBulkExport(arrayDeSeleccionados) {
    if (!window.menteiosAPI) {
      console.warn('menteiosAPI no disponible: corré la app con npm run electron:dev')
      return
    }
    const respuesta = await window.menteiosAPI.bulkExport(arrayDeSeleccionados)
    if (respuesta.success) {
      console.log('Exportación en lote guardada en:', respuesta.folderPath)
      mostrarToast(`${respuesta.count} documento(s) exportado(s) correctamente`)
    } else if (!respuesta.canceled) {
      console.error('Exportación en lote falló:', respuesta.error)
      mostrarToast('No se pudo completar la exportación en lote')
    }
  }

  const machotesFiltrados = useMemo(() => {
    const texto = searchTerm.trim().toLowerCase()
    if (!texto) return machotes

    return machotes.filter(
      (machote) =>
        machote.nombreArchivo.toLowerCase().includes(texto) ||
        machote.descripcion.toLowerCase().includes(texto),
    )
  }, [machotes, searchTerm])

  function handleToggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function handleStartEdit(machote) {
    setEditingId(machote.id)
    setBorrador({ nombreArchivo: machote.nombreArchivo, descripcion: machote.descripcion })
  }

  function handleCommitEdit() {
    setMachotes((prev) =>
      prev.map((machote) =>
        machote.id === editingId
          ? { ...machote, nombreArchivo: borrador.nombreArchivo, descripcion: borrador.descripcion }
          : machote,
      ),
    )
    setEditingId(null)
  }

  function handleKeyDownEdit(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleCommitEdit()
    }
  }

  function handleExportarClick() {
    const seleccionados = machotes.filter((machote) => selectedIds.includes(machote.id))
    handleBulkExport(seleccionados)
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900">Reportes</h1>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-brand-500"
          />
        </div>

        <button
          type="button"
          onClick={handleExportarClick}
          disabled={selectedIds.length === 0}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          <DownloadIcon className="h-4 w-4" />
          Exportar{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
        </button>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="w-12 px-6 py-3" />
              <th className="px-6 py-3 font-medium">Nombre del archivo</th>
              <th className="px-6 py-3 font-medium">Descripción</th>
              <th className="px-6 py-3 font-medium">Formato de descarga</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {machotesFiltrados.map((machote) => (
              <MachoteRow
                key={machote.id}
                machote={machote}
                isSelected={selectedIds.includes(machote.id)}
                isEditing={editingId === machote.id}
                borrador={borrador}
                onToggleSelect={() => handleToggleSelect(machote.id)}
                onStartEdit={() => handleStartEdit(machote)}
                onChangeBorrador={setBorrador}
                onCommitEdit={handleCommitEdit}
                onKeyDownEdit={handleKeyDownEdit}
                onDownloadWord={() => handleDownloadWord(machote.id, machote)}
                onDownloadPdf={() => handleDownloadPdf(machote.id, machote)}
              />
            ))}

            {machotesFiltrados.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                  No se encontraron documentos con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />
    </>
  )
}

function MachoteRow({
  machote,
  isSelected,
  isEditing,
  borrador,
  onToggleSelect,
  onStartEdit,
  onChangeBorrador,
  onCommitEdit,
  onKeyDownEdit,
  onDownloadWord,
  onDownloadPdf,
}) {
  const INPUT_CLASSES =
    'w-full rounded-lg border border-brand-300 bg-white px-2 py-1 text-sm text-gray-800 outline-none focus:border-brand-500'

  return (
    <tr className={isSelected ? 'bg-brand-50/40' : undefined}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          aria-label={`Seleccionar ${machote.nombreArchivo}`}
          className="h-4 w-4 rounded border-gray-300 accent-brand-700"
        />
      </td>

      <td className="px-6 py-4 font-medium text-gray-800" onDoubleClick={onStartEdit}>
        {isEditing ? (
          <input
            autoFocus
            value={borrador.nombreArchivo}
            onChange={(event) => onChangeBorrador((prev) => ({ ...prev, nombreArchivo: event.target.value }))}
            onBlur={onCommitEdit}
            onKeyDown={onKeyDownEdit}
            className={INPUT_CLASSES}
          />
        ) : (
          machote.nombreArchivo
        )}
      </td>

      <td className="max-w-md px-6 py-4 text-gray-500" onDoubleClick={onStartEdit}>
        {isEditing ? (
          <input
            value={borrador.descripcion}
            onChange={(event) => onChangeBorrador((prev) => ({ ...prev, descripcion: event.target.value }))}
            onBlur={onCommitEdit}
            onKeyDown={onKeyDownEdit}
            className={INPUT_CLASSES}
          />
        ) : (
          machote.descripcion
        )}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownloadWord}
            aria-label={`Descargar ${machote.nombreArchivo} en Word`}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 transition hover:bg-sky-100"
          >
            <WordFileIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onDownloadPdf}
            aria-label={`Descargar ${machote.nombreArchivo} en PDF`}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
          >
            <PdfFileIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={isEditing ? onCommitEdit : onStartEdit}
            aria-label={`Editar ${machote.nombreArchivo}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-brand-600"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
