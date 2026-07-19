import { useEffect, useState } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
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
  // Sesión del terapeuta logueado — `null` significa "sin sesión", y es lo
  // que decide más abajo si se renderiza Login o el Dashboard. Vive acá
  // (no en Login.jsx) porque toda la app la necesita: es el `usuarioId`
  // que viaja en cada llamada a window.menteiosAPI de pacientes/citas.
  const [usuarioActual, setUsuarioActual] = useState(null)
  // Sin sesión, decide cuál de las dos pantallas de auth se muestra.
  // handleLogout la vuelve a 'login' explícitamente, así cerrar sesión
  // siempre lleva de vuelta al inicio del flujo, no a donde haya quedado
  // parada la navegación de auth la última vez.
  const [authView, setAuthView] = useState('login')
  // Única fuente de verdad para citas/sesiones de toda la app. Home, Citas
  // y Sesiones reciben `globalCitas` por props — ninguno mantiene copia
  // local ni la vuelve a importar de mockData.js. Arranca vacío: se llena
  // con datos reales de menteios.db apenas hay sesión (ver useEffect de
  // abajo), ya no con los arreglos fijos de mockData.js.
  const [globalCitas, setGlobalCitas] = useState([])
  const [pacientes, setPacientes] = useState([])
  const renderPage = PAGE_RENDERERS[activeTab] ?? PAGE_RENDERERS.inicio

  // Carga desde SQLite (vía electron/database.js + los canales IPC de
  // electron/main.js), scopeada al terapeuta logueado — `usuarioActual.id`
  // viaja en cada pedido, así el backend nunca devuelve pacientes/citas de
  // otra cuenta. Se repite cada vez que cambia `usuarioActual` (login
  // nuevo), no solo al montar.
  useEffect(() => {
    if (!usuarioActual) return

    window.menteiosAPI.getPacientes(usuarioActual.id).then((respuesta) => {
      if (respuesta.success) setPacientes(respuesta.pacientes)
      else console.error('No se pudieron cargar los pacientes:', respuesta.error)
    })

    window.menteiosAPI.getCitas(usuarioActual.id).then((respuesta) => {
      if (respuesta.success) setGlobalCitas(respuesta.citas)
      else console.error('No se pudieron cargar las citas:', respuesta.error)
    })
  }, [usuarioActual])

  function handleLoginSuccess(usuario) {
    setUsuarioActual(usuario)
  }

  // Registrarse deja logueada a la cuenta nueva de una — no tendría
  // sentido pedirle a alguien que recién escribió su email/contraseña que
  // los vuelva a escribir en Login para entrar.
  function handleSignupSuccess(usuario) {
    setUsuarioActual(usuario)
  }

  // Logout seguro: además de borrar la sesión, limpia pacientes/citas del
  // estado — si no, quedarían en memoria y se verían un instante (o
  // seguirían ahí si el siguiente login tarda) datos de la cuenta
  // anterior. También vuelve a 'inicio' para que la próxima sesión
  // arranque limpia, no en la pantalla donde quedó la anterior.
  function handleLogout() {
    setUsuarioActual(null)
    setPacientes([])
    setGlobalCitas([])
    setActiveTab('inicio')
    setAuthView('login')
  }

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

    const respuesta = await window.menteiosAPI.addCita(nuevaCita, usuarioActual.id)
    if (respuesta.success) {
      setGlobalCitas((prev) => [...prev, nuevaCita])
    } else {
      console.error('No se pudo guardar la cita:', respuesta.error)
    }
  }

  async function handleDeleteCita(citaId) {
    const respuesta = await window.menteiosAPI.deleteCita(citaId, usuarioActual.id)
    if (respuesta.success) {
      setGlobalCitas((prev) => prev.filter((cita) => cita.id !== citaId))
    } else {
      console.error('No se pudo eliminar la cita:', respuesta.error)
    }
  }

  // --- Pacientes ---------------------------------------------------------
  async function handleAddPaciente(datos) {
    const nuevoPaciente = { id: crypto.randomUUID(), estado: 'Activo', ...datos }

    const respuesta = await window.menteiosAPI.addPaciente(nuevoPaciente, usuarioActual.id)
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
    const respuesta = await window.menteiosAPI.deletePaciente(pacienteId, usuarioActual.id)
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

  // Sin sesión, la única pantalla posible es Login o Signup — nunca el
  // Dashboard. Nada de él se monta (ni siquiera oculto) hasta que
  // `usuarioActual` exista, así no hay forma de que un componente pida
  // pacientes/citas sin un usuarioId válido.
  if (!usuarioActual) {
    return authView === 'signup' ? (
      <Signup onSignupSuccess={handleSignupSuccess} onNavigateToLogin={() => setAuthView('login')} />
    ) : (
      <Login onLoginSuccess={handleLoginSuccess} onNavigateToSignup={() => setAuthView('signup')} />
    )
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      usuarioActual={usuarioActual}
      onLogout={handleLogout}
    >
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
