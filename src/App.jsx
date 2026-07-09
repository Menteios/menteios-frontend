import { useState } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import Pacientes from './pages/Pacientes'
import Citas from './pages/Citas'
import Sesiones from './pages/Sesiones'
import ComingSoon from './pages/ComingSoon'
import { citas as citasIniciales, pacientes as pacientesIniciales } from './mockData'

// 'inicio' es la pantalla de entrada (Resumen general) y corresponde al
// primer ítem del Sidebar. Cada id renderiza su propia pantalla — nada cae
// de vuelta al Home por defecto. Cada renderer recibe el mismo `ctx`
// (navegación + estado global) y toma solo lo que necesita, para que un
// cambio en cualquier pantalla (crear/cancelar cita, completar una sesión,
// editar un monto, eliminar un paciente) se refleje al instante en el
// resto — una sola fuente de verdad (`globalCitas`) para Home, Citas y
// Sesiones, y otra (`pacientes`) conectada por `pacienteId`. Ningún
// componente tiene su propio useState de citas/pacientes ni los importa
// de mockData.js directamente.
const PAGE_RENDERERS = {
  inicio: (ctx) => <Home onNavigate={ctx.navigate} citas={ctx.globalCitas} pacientes={ctx.pacientes} />,
  pacientes: (ctx) => (
    <Pacientes
      pacientes={ctx.pacientes}
      onAddPaciente={ctx.handleAddPaciente}
      onUpdatePaciente={ctx.handleUpdatePaciente}
      onDeletePaciente={ctx.handleDeletePaciente}
    />
  ),
  citas: (ctx) => (
    <Citas
      citas={ctx.globalCitas}
      pacientes={ctx.pacientes}
      onAddCita={ctx.handleAddCita}
      onDeleteCita={ctx.handleDeleteCita}
    />
  ),
  sesiones: (ctx) => (
    <Sesiones
      citas={ctx.globalCitas}
      onSaveNotaBorrador={ctx.handleSaveNotaBorrador}
      onCompletarSesion={ctx.handleCompletarSesion}
      onDeleteSesion={ctx.handleDeleteSesion}
    />
  ),
  reportes: () => <ComingSoon title="Reportes" />,
}

function App() {
  const [activeTab, setActiveTab] = useState('inicio')
  // Única fuente de verdad para citas/sesiones de toda la app. Home, Citas
  // y Sesiones reciben `globalCitas` por props — ninguno mantiene copia
  // local ni la vuelve a importar de mockData.js.
  const [globalCitas, setGlobalCitas] = useState(citasIniciales)
  const [pacientes, setPacientes] = useState(pacientesIniciales)
  const renderPage = PAGE_RENDERERS[activeTab] ?? PAGE_RENDERERS.inicio

  // --- Citas -----------------------------------------------------------
  // Toda cita nace como una sesión 'Pendiente' de 50 min sin notas — los
  // mismos defaults que ya trae el mock — para que se comporte igual en
  // Sesiones (tarjeta clicable) sin importar desde qué pantalla se creó.
  function handleAddCita(datos) {
    setGlobalCitas((prev) => [
      ...prev,
      { id: Date.now(), estadoSesion: 'Pendiente', duracion: '50 min', notasClinicas: '', ...datos },
    ])
  }

  function handleDeleteCita(citaId) {
    setGlobalCitas((prev) => prev.filter((cita) => cita.id !== citaId))
  }

  // --- Pacientes ---------------------------------------------------------
  function handleAddPaciente(datos) {
    setPacientes((prev) => [...prev, { id: Date.now(), estado: 'Activo', ...datos }])
  }

  function handleUpdatePaciente(pacienteId, datos) {
    setPacientes((prev) => prev.map((paciente) => (paciente.id === pacienteId ? { ...paciente, ...datos } : paciente)))
  }

  // Integridad referencial: eliminar un paciente también elimina en cascada
  // toda cita/sesión que le pertenezca (unidas por pacienteId). Como Home,
  // Citas y Sesiones leen del mismo `globalCitas`, el paciente desaparece
  // de las tres pantallas a la vez, sin lógica adicional en ellas.
  function handleDeletePaciente(pacienteId) {
    setPacientes((prev) => prev.filter((paciente) => paciente.id !== pacienteId))
    setGlobalCitas((prev) => prev.filter((cita) => cita.pacienteId !== pacienteId))
  }

  // --- Sesiones (notas clínicas + monto) -----------------------------------
  // Guarda nota y monto sin tocar estadoSesion — la sesión sigue 'Pendiente'.
  // RevenueSummary solo suma citas 'Completada', así que esto no afecta los
  // ingresos todavía, pero deja el monto correcto listo para cuando se
  // complete.
  function handleSaveNotaBorrador(citaId, texto, monto) {
    setGlobalCitas((prev) =>
      prev.map((cita) => (cita.id === citaId ? { ...cita, notasClinicas: texto, monto } : cita)),
    )
  }

  // Guarda nota y monto, y marca la sesión como 'Completada'. Como
  // RevenueSummary (Home y Sesiones) deriva el total de `globalCitas` en
  // cada render con exactamente la misma fórmula
  // (filter Completada + reduce monto), el nuevo monto se refleja en ambas
  // pantallas sin pasos extra de sincronización.
  function handleCompletarSesion(citaId, texto, monto) {
    setGlobalCitas((prev) =>
      prev.map((cita) =>
        cita.id === citaId
          ? { ...cita, notasClinicas: texto, monto, estadoSesion: 'Completada' }
          : cita,
      ),
    )
  }

  // Una "sesión" y una "cita" son el mismo registro en `globalCitas`, así
  // que eliminar una sesión desde Sesiones usa el mismo .filter() sobre la
  // misma fuente de verdad que ya consumen Home y Citas — desaparece del
  // calendario y de "Próximas citas" en el mismo instante, sin lógica extra.
  function handleDeleteSesion(citaId) {
    setGlobalCitas((prev) => prev.filter((cita) => cita.id !== citaId))
  }

  return (
    <DashboardLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {renderPage({
        navigate: setActiveTab,
        globalCitas,
        pacientes,
        handleAddCita,
        handleDeleteCita,
        handleAddPaciente,
        handleUpdatePaciente,
        handleDeletePaciente,
        handleSaveNotaBorrador,
        handleCompletarSesion,
        handleDeleteSesion,
      })}
    </DashboardLayout>
  )
}

export default App
