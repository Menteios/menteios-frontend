import { useState } from 'react'
import Modal from './Modal'
import { XIcon, MoneyIcon } from './icons/DashboardIcons'

const INPUT_CLASSES =
  'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-brand-500'

// Dos acciones separadas y explícitas, cada una mapeada 1:1 a un handler
// aislado en App.jsx: "Solo Guardar Nota" nunca toca estadoSesion, y
// "Guardar y Completar" es la única que la cambia a 'Completada'. Ambas
// guardan también el monto editado — es lo que lee RevenueSummary para
// recalcular los ingresos en Sesiones y en el Home.
export default function SessionNoteModal({ open, cita, onClose, onSaveNotaBorrador, onCompletarSesion }) {
  const [notas, setNotas] = useState(cita?.notasClinicas ?? '')
  // Carga el monto ya asignado a la cita (que a su vez heredó el costoCita
  // del paciente al agendarse) — queda editable para descuentos puntuales.
  const [monto, setMonto] = useState(cita?.monto != null ? String(cita.monto) : '')

  if (!open || !cita) return null

  function handleCompletar(event) {
    event.preventDefault()
    onCompletarSesion(cita.id, notas.trim(), Number(monto))
  }

  function handleGuardarBorrador() {
    onSaveNotaBorrador(cita.id, notas.trim(), Number(monto))
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Escribir Nota de Sesión</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="text-gray-400 transition hover:text-gray-600"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-2 text-sm text-gray-500">
        Paciente: <span className="font-medium text-gray-800">{cita.pacienteNombre}</span>
      </p>

      <form onSubmit={handleCompletar} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-gray-600">Costo de la sesión</span>
          <div className="relative">
            <MoneyIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(event) => setMonto(event.target.value)}
              className={`${INPUT_CLASSES} pl-11`}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-gray-600">Notas clínicas</span>
          <textarea
            required
            rows={6}
            value={notas}
            onChange={(event) => setNotas(event.target.value)}
            placeholder="Resumen del avance, observaciones y tareas asignadas..."
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-brand-500"
          />
        </label>

        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardarBorrador}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Solo Guardar Nota
          </button>
          <button
            type="submit"
            className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            Guardar y Completar
          </button>
        </div>
      </form>
    </Modal>
  )
}
