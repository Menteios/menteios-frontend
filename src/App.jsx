import { useState } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import Pacientes from './pages/Pacientes'
import ComingSoon from './pages/ComingSoon'

// 'inicio' es la pantalla de entrada (Resumen general) y corresponde al
// primer ítem del Sidebar. Cada id renderiza su propia pantalla — nada cae
// de vuelta al Home por defecto. `navigate` se pasa a cada renderer para que
// las vistas puedan cambiar de pestaña ellas mismas (ej: tarjetas del Home).
const PAGE_RENDERERS = {
  inicio: (navigate) => <Home onNavigate={navigate} />,
  pacientes: () => <Pacientes />,
  citas: () => <ComingSoon title="Citas del día" />,
  sesiones: () => <ComingSoon title="Sesiones" />,
  reportes: () => <ComingSoon title="Reportes" />,
}

function App() {
  const [activeTab, setActiveTab] = useState('inicio')
  const renderPage = PAGE_RENDERERS[activeTab] ?? PAGE_RENDERERS.inicio

  return (
    <DashboardLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {renderPage(setActiveTab)}
    </DashboardLayout>
  )
}

export default App
