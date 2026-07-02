import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import SummaryCard from '../components/SummaryCard'
import AppointmentsTable from '../components/AppointmentsTable'
import { UsersIcon, CalendarIcon, SessionsIcon, ReportsIcon } from '../components/icons/DashboardIcons'

// Mock data — shaped like it will eventually arrive from the API/DB, so
// swapping this for a fetch/query later only touches this block.
const SUMMARY_METRICS = [
  { id: 'pacientes', label: 'Pacientes', value: 48, badge: '+3 este mes', badgeTone: 'green', icon: UsersIcon },
  { id: 'citas', label: 'Citas del día', value: 7, badge: '2 pendientes', badgeTone: 'blue', icon: CalendarIcon },
  { id: 'sesiones', label: 'Sesiones', value: 124, badge: '+12 esta semana', badgeTone: 'green', icon: SessionsIcon },
  { id: 'reportes', label: 'Reportes', value: 15, badge: 'Actualizado hoy', badgeTone: 'blue', icon: ReportsIcon },
]

const UPCOMING_APPOINTMENTS = [
  { id: 1, nombre: 'María García', fecha: '09 Jun 2026', monto: 800, terapia: 'Cognitivo-conductual' },
  { id: 2, nombre: 'Carlos López', fecha: '09 Jun 2026', monto: 650, terapia: 'Terapia breve' },
  { id: 3, nombre: 'Ana Martínez', fecha: '10 Jun 2026', monto: 800, terapia: 'Psicoanálisis' },
  { id: 4, nombre: 'Pedro Sánchez', fecha: '10 Jun 2026', monto: 700, terapia: 'Gestalt' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('citas')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 px-10 py-10">
        <h1 className="text-2xl font-semibold text-gray-900">Resumen general</h1>

        <section className="mt-6 grid grid-cols-4 gap-4">
          {SUMMARY_METRICS.map((metric) => (
            <SummaryCard key={metric.id} {...metric} />
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Próximas citas</h2>
          <AppointmentsTable appointments={UPCOMING_APPOINTMENTS} />
        </section>
      </main>
    </div>
  )
}
