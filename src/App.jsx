import { useState } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import Pacientes from './pages/Pacientes'
import Citas from './pages/Citas'
import ComingSoon from './pages/ComingSoon'
import { citas as citasIniciales } from './mockData'

// 'inicio' es la pantalla de entrada (Resumen general) y corresponde al
// primer ítem del Sidebar. Cada id renderiza su propia pantalla — nada cae
// de vuelta al Home por defecto. Cada renderer recibe el mismo `ctx`
// (navegación + citas compartidas) y toma solo lo que necesita, para que
// una cita creada en Citas se refleje también en la tabla del Home.
const PAGE_RENDERERS = {
  inicio: (ctx) => <Home onNavigate={ctx.navigate} citas={ctx.citas} />,
  pacientes: () => <Pacientes />,
  citas: (ctx) => <Citas citas={ctx.citas} onAddCita={ctx.addCita} />,
  sesiones: () => <ComingSoon title="Sesiones" />,
  reportes: () => <ComingSoon title="Reportes" />,
}

function App() {
  const [activeTab, setActiveTab] = useState('inicio')
  const [citas, setCitas] = useState(citasIniciales)
  const renderPage = PAGE_RENDERERS[activeTab] ?? PAGE_RENDERERS.inicio

  function addCita(datos) {
    setCitas((prev) => [...prev, { id: Date.now(), ...datos }])
  }

  return (
    <DashboardLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {renderPage({ navigate: setActiveTab, citas, addCita })}
    </DashboardLayout>
  )
}

export default App
