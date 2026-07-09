import { MESES } from '../utils/date'
import { TrashIcon, WhatsAppIcon } from './icons/DashboardIcons'

export default function AgendaPanel({ selectedDate, citasDelDia, onDeleteCita }) {
  const [, month, day] = selectedDate.split('-').map(Number)
  const titulo = `${day} de ${MESES[month - 1]}`

  return (
    <aside className="w-72 shrink-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">{titulo}</h2>

      <div className="mt-4 flex flex-col gap-3">
        {citasDelDia.length === 0 ? (
          <p className="text-sm text-gray-400">No hay citas programadas para este día.</p>
        ) : (
          citasDelDia.map((cita) => (
            <div
              key={cita.id}
              className="group flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700"
            >
              <span>
                {cita.pacienteNombre} - {cita.hora}
              </span>
              <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => window.open(`https://wa.me/${cita.telefono}`, '_blank')}
                  aria-label={`Enviar WhatsApp a ${cita.pacienteNombre}`}
                  className="text-green-500 hover:text-green-600"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCita(cita)}
                  aria-label={`Cancelar cita de ${cita.pacienteNombre}`}
                  className="text-red-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
