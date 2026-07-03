import { useMemo } from 'react'
import SummaryCard from '../components/SummaryCard'
import AppointmentsTable from '../components/AppointmentsTable'
import { UsersIcon, CalendarIcon, SessionsIcon, ReportsIcon } from '../components/icons/DashboardIcons'
import { HOY, metricasHome } from '../mockData'

// Presentation metadata para cada tarjeta de resumen. `value` puede ser un
// número fijo de `metricasHome` o una función que la calcula en tiempo real
// a partir del estado compartido (ej. citasDelDia via .filter()).
const METRIC_CARDS_CONFIG = [
  {
    key: 'totalPacientes',
    label: 'Pacientes',
    badge: '+3 este mes',
    badgeTone: 'green',
    icon: UsersIcon,
    targetTab: 'pacientes',
    getValue: () => metricasHome.totalPacientes,
  },
  {
    key: 'citasDelDia',
    label: 'Citas del día',
    badge: '2 pendientes',
    badgeTone: 'blue',
    icon: CalendarIcon,
    targetTab: 'citas',
    getValue: (citas) => citas.filter((cita) => cita.fecha === HOY).length,
  },
  {
    key: 'sesionesEstaSemana',
    label: 'Sesiones',
    badge: '+12 esta semana',
    badgeTone: 'green',
    icon: SessionsIcon,
    targetTab: 'sesiones',
    getValue: () => metricasHome.sesionesEstaSemana,
  },
  {
    key: 'reportes',
    label: 'Reportes',
    badge: 'Actualizado hoy',
    badgeTone: 'blue',
    icon: ReportsIcon,
    targetTab: 'reportes',
    getValue: () => metricasHome.reportes,
  },
]

function ordenarPorFechaYHora(citas) {
  return [...citas].sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha)
    return a.hora.localeCompare(b.hora)
  })
}

export default function Home({ onNavigate, citas }) {
  const citasOrdenadas = useMemo(() => ordenarPorFechaYHora(citas), [citas])

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900">Resumen general</h1>

      <section className="mt-6 grid grid-cols-4 gap-4">
        {METRIC_CARDS_CONFIG.map(({ key, targetTab, getValue, ...config }) => (
          <SummaryCard
            key={key}
            value={getValue(citas)}
            onClick={() => onNavigate(targetTab)}
            {...config}
          />
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Próximas citas</h2>
        <AppointmentsTable appointments={citasOrdenadas} />
      </section>
    </>
  )
}
