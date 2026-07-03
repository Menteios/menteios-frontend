import Modal from './Modal'

export default function ConfirmDeleteCitaModal({ open, cita, onCancel, onConfirm }) {
  if (!open || !cita) return null

  return (
    <Modal open={open} onClose={onCancel} maxWidth="max-w-sm">
      <h2 className="text-lg font-semibold text-gray-900">Cancelar cita</h2>
      <p className="mt-3 text-sm text-gray-600">
        ¿Estás seguro de que deseas cancelar la cita de{' '}
        <span className="font-semibold text-gray-900">{cita.pacienteNombre}</span>?
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onConfirm(cita)}
          className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>
    </Modal>
  )
}
