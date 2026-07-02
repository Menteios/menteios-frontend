import SummaryCard from '../components/SummaryCard'
import AppointmentsTable from '../components/AppointmentsTable'
import { UsersIcon, CalendarIcon, SessionsIcon, ReportsIcon } from '../components/icons/DashboardIcons'
import { citas, metricasHome } from '../mockData'

// Presentation metadata for each summary card — pairs each numeric key from
// `metricasHome` (the backend-shaped data) with its label/icon/badge copy,
// plus the Sidebar tab it should navigate to when clicked.
const METRIC_CARDS_CONFIG = [
  { key: 'totalPacientes', label: 'Pacientes', badge: '+3 este mes', badgeTone: 'green', icon: UsersIcon, targetTab: 'pacientes' },
  { key: 'citasDelDia', label: 'Citas del día', badge: '2 pendientes', badgeTone: 'blue', icon: CalendarIcon, targetTab: 'citas' },
  { key: 'sesionesEstaSemana', label: 'Sesiones', badge: '+12 esta semana', badgeTone: 'green', icon: SessionsIcon, targetTab: 'sesiones' },
  { key: 'reportes', label: 'Reportes', badge: 'Actualizado hoy', badgeTone: 'blue', icon: ReportsIcon, targetTab: 'reportes' },
]

export default function Home({ onNavigate }) {
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900">Resumen general</h1>

      <section className="mt-6 grid grid-cols-4 gap-4">
        {METRIC_CARDS_CONFIG.map(({ key, targetTab, ...config }) => (
          <SummaryCard
            key={key}
            value={metricasHome[key]}
            onClick={() => onNavigate(targetTab)}
            {...config}
          />
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Próximas citas</h2>
        <AppointmentsTable appointments={citas} />
      </section>
    </>
  )
}
