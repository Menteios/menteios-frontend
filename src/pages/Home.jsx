import { useMemo } from 'react'
import SummaryCard from '../components/SummaryCard'
import AppointmentsTable from '../components/AppointmentsTable'
import RevenueSummary from '../components/RevenueSummary'
import { UsersIcon, CalendarIcon, SessionsIcon, ReportsIcon } from '../components/icons/DashboardIcons'
import { getWeekRange } from '../utils/date'
import { HOY, metricasHome } from '../mockData'

// Presentation metadata para cada tarjeta de resumen. `getValue` recibe el
// estado unificado ({ citas, pacientes }) y calcula el número en tiempo
// real — la misma lógica matemática que usan las tarjetas de Sesiones, así
// que ambas pantallas nunca pueden mostrar cifras distintas.
const METRIC_CARDS_CONFIG = [
  {
    key: 'totalPacientes',
    label: 'Pacientes',
    badge: '+3 este mes',
    badgeTone: 'green',
    icon: UsersIcon,
    targetTab: 'pacientes',
    getValue: ({ pacientes }) => pacientes.length,
  },
  {
    key: 'citasDelDia',
    label: 'Citas del día',
    badge: '2 pendientes',
    badgeTone: 'blue',
    icon: CalendarIcon,
    targetTab: 'citas',
    getValue: ({ citas }) => citas.filter((cita) => cita.fecha === HOY).length,
  },
  {
    key: 'sesionesEstaSemana',
    label: 'Sesiones',
    badge: 'Esta semana',
    badgeTone: 'green',
    icon: SessionsIcon,
    targetTab: 'sesiones',
    getValue: ({ citas }) => {
      const { start, end } = getWeekRange(HOY)
      return citas.filter((cita) => cita.fecha >= start && cita.fecha <= end).length
    },
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

export default function Home({ onNavigate, citas, pacientes }) {
  const citasOrdenadas = useMemo(() => ordenarPorFechaYHora(citas), [citas])

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900">Resumen general</h1>

      <section className="mt-6 grid grid-cols-4 gap-4">
        {METRIC_CARDS_CONFIG.map(({ key, targetTab, getValue, ...config }) => (
          <SummaryCard
            key={key}
            value={getValue({ citas, pacientes })}
            onClick={() => onNavigate(targetTab)}
            {...config}
          />
        ))}
      </section>

      <RevenueSummary citas={citas} />

      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Próximas citas</h2>
        <AppointmentsTable appointments={citasOrdenadas} />
      </section>
    </>
  )
}
