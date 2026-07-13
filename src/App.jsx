import { useEffect, useState } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import Pacientes from './pages/Pacientes'
import Citas from './pages/Citas'
import Sesiones from './pages/Sesiones'
import Reportes from './pages/Reportes'

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
  reportes: () => <Reportes />,
}

function App() {
  const [activeTab, setActiveTab] = useState('inicio')
  // Única fuente de verdad para citas/sesiones de toda la app. Home, Citas
  // y Sesiones reciben `globalCitas` por props — ninguno mantiene copia
  // local ni la vuelve a importar de mockData.js. Arranca vacío: se llena
  // con datos reales de menteios.db apenas monta (ver useEffect de abajo),
  // ya no con los arreglos fijos de mockData.js.
  const [globalCitas, setGlobalCitas] = useState([])
  const [pacientes, setPacientes] = useState([])
  const renderPage = PAGE_RENDERERS[activeTab] ?? PAGE_RENDERERS.inicio

  // Carga inicial desde SQLite (vía electron/database.js + los canales IPC
  // de electron/main.js). Pacientes y citas se piden en paralelo porque son
  // independientes; cada uno solo pisa su propio estado si la respuesta
  // vino con éxito, para no vaciar la pantalla ante un error de lectura.
  useEffect(() => {
    window.menteiosAPI.getPacientes().then((respuesta) => {
      if (respuesta.success) setPacientes(respuesta.pacientes)
      else console.error('No se pudieron cargar los pacientes:', respuesta.error)
    })

    window.menteiosAPI.getCitas().then((respuesta) => {
      if (respuesta.success) setGlobalCitas(respuesta.citas)
      else console.error('No se pudieron cargar las citas:', respuesta.error)
    })
  }, [])

  // --- Citas -----------------------------------------------------------
  // Toda cita nace como una sesión 'Pendiente' de 50 min sin notas — los
  // mismos defaults que ya traía el mock — para que se comporte igual en
  // Sesiones (tarjeta clicable) sin importar desde qué pantalla se creó.
  // Se guarda primero en menteios.db vía IPC; el estado local solo se
  // actualiza si la escritura fue exitosa, para que la UI nunca muestre
  // una cita que en realidad no quedó persistida.
  async function handleAddCita(datos) {
    const nuevaCita = {
      id: crypto.randomUUID(),
      estadoSesion: 'Pendiente',
      duracion: '50 min',
      notasClinicas: '',
      ...datos,
    }

    const respuesta = await window.menteiosAPI.addCita(nuevaCita)
    if (respuesta.success) {
      setGlobalCitas((prev) => [...prev, nuevaCita])
    } else {
      console.error('No se pudo guardar la cita:', respuesta.error)
    }
  }

  async function handleDeleteCita(citaId) {
    const respuesta = await window.menteiosAPI.deleteCita(citaId)
    if (respuesta.success) {
      setGlobalCitas((prev) => prev.filter((cita) => cita.id !== citaId))
    } else {
      console.error('No se pudo eliminar la cita:', respuesta.error)
    }
  }

  // --- Pacientes ---------------------------------------------------------
  async function handleAddPaciente(datos) {
    const nuevoPaciente = { id: crypto.randomUUID(), estado: 'Activo', ...datos }

    const respuesta = await window.menteiosAPI.addPaciente(nuevoPaciente)
    if (respuesta.success) {
      setPacientes((prev) => [...prev, nuevoPaciente])
    } else {
      console.error('No se pudo guardar el paciente:', respuesta.error)
    }
  }

  function handleUpdatePaciente(pacienteId, datos) {
    setPacientes((prev) => prev.map((paciente) => (paciente.id === pacienteId ? { ...paciente, ...datos } : paciente)))
  }

  // Integridad referencial: eliminar un paciente también elimina en cascada
  // toda cita/sesión que le pertenezca — acá vía el ON DELETE CASCADE real
  // de SQLite (electron/database.js), y en el estado local con el mismo
  // filtro de siempre para que Home, Citas y Sesiones se actualicen juntas.
  async function handleDeletePaciente(pacienteId) {
    const respuesta = await window.menteiosAPI.deletePaciente(pacienteId)
    if (respuesta.success) {
      setPacientes((prev) => prev.filter((paciente) => paciente.id !== pacienteId))
      setGlobalCitas((prev) => prev.filter((cita) => cita.pacienteId !== pacienteId))
    } else {
      console.error('No se pudo eliminar el paciente:', respuesta.error)
    }
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
