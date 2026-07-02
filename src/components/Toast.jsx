import { CheckCircleIcon, XIcon } from './icons/DashboardIcons'

export default function Toast({ show, message, onClose }) {
  if (!show) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg">
      <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
      {message}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="text-emerald-500 transition hover:text-emerald-700"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
