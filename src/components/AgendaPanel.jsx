import { MESES } from '../utils/date'

export default function AgendaPanel({ selectedDate, citasDelDia }) {
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
            <div key={cita.id} className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {cita.pacienteNombre} - {cita.hora}
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
