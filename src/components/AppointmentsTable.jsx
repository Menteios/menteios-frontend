const THERAPY_STYLES = {
  'Cognitivo-conductual': 'bg-sky-50 text-sky-600',
  'Terapia breve': 'bg-amber-50 text-amber-600',
  Psicoanálisis: 'bg-violet-50 text-violet-600',
  Gestalt: 'bg-emerald-50 text-emerald-600',
}

export default function AppointmentsTable({ appointments }) {
  return (
    <table className="mt-4 w-full border-collapse text-left text-sm">
      <thead>
        <tr className="rounded-lg bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-400">
          <th className="rounded-l-lg px-4 py-3 font-medium">Nombre</th>
          <th className="px-4 py-3 font-medium">Fecha</th>
          <th className="px-4 py-3 font-medium">Monto</th>
          <th className="rounded-r-lg px-4 py-3 font-medium">Terapia</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {appointments.map((appointment) => (
          <tr key={appointment.id}>
            <td className="px-4 py-4 font-medium text-gray-800">{appointment.nombre}</td>
            <td className="px-4 py-4 text-gray-500">{appointment.fecha}</td>
            <td className="px-4 py-4 text-gray-500">${appointment.monto}</td>
            <td className="px-4 py-4">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${THERAPY_STYLES[appointment.terapia] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {appointment.terapia}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
