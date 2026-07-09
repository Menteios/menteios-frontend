import { useMemo, useState } from 'react'
import SessionNoteModal from '../components/SessionNoteModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import RevenueSummary from '../components/RevenueSummary'
import { SessionsIcon, ClockIcon, CheckCircleIcon, CircleIcon, TrashIcon } from '../components/icons/DashboardIcons'
import { THERAPY_STYLES } from '../utils/therapyStyles'
import { formatFechaCorta, getWeekRange } from '../utils/date'
import { HOY } from '../mockData'

const ESTADO_SESION_STYLES = {
  Completada: 'bg-emerald-50 text-emerald-600',
  Pendiente: 'bg-amber-50 text-amber-600',
}

// Cada tarjeta calcula su número en tiempo real a partir del array global de
// citas — nada queda hardcodeado, así que al crear/editar/eliminar una cita
// en cualquier otra pantalla estos totales se recalculan solos.
const METRIC_CARDS_CONFIG = [
  {
    key: 'total',
    label: 'Total sesiones',
    icon: SessionsIcon,
    getValue: (citas) => citas.length,
  },
  {
    key: 'semana',
    label: 'Esta semana',
    icon: ClockIcon,
    getValue: (citas) => {
      const { start, end } = getWeekRange(HOY)
      return citas.filter((cita) => cita.fecha >= start && cita.fecha <= end).length
    },
  },
  {
    key: 'completadas',
    label: 'Completadas',
    icon: CheckCircleIcon,
    getValue: (citas) => citas.filter((cita) => cita.estadoSesion === 'Completada').length,
  },
  {
    key: 'pendientes',
    label: 'Pendientes',
    icon: CircleIcon,
    getValue: (citas) => citas.filter((cita) => cita.estadoSesion === 'Pendiente').length,
  },
]

function ordenarPorFechaYHora(citas) {
  return [...citas].sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha)
    return a.hora.localeCompare(b.hora)
  })
}

export default function Sesiones({ citas, onSaveNotaBorrador, onCompletarSesion, onDeleteSesion }) {
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [sessionToDelete, setSessionToDelete] = useState(null)

  const sesionesOrdenadas = useMemo(() => ordenarPorFechaYHora(citas), [citas])
  const sesionSeleccionada = citas.find((cita) => cita.id === selectedSessionId) ?? null
  const sesionEnConfirmacion = citas.find((cita) => cita.id === sessionToDelete) ?? null

  function handleGuardarBorrador(citaId, notas, monto) {
    onSaveNotaBorrador(citaId, notas, monto)
    setSelectedSessionId(null)
  }

  function handleCompletarSesion(citaId, notas, monto) {
    onCompletarSesion(citaId, notas, monto)
    setSelectedSessionId(null)
  }

  function handleConfirmarEliminacion() {
    onDeleteSesion(sesionEnConfirmacion.id)
    setSessionToDelete(null)
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900">Sesiones</h1>

      <section className="mt-6 grid grid-cols-4 gap-4">
        {METRIC_CARDS_CONFIG.map(({ key, icon: Icon, label, getValue }) => (
          <div key={key} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{getValue(citas)}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </section>

      <RevenueSummary citas={citas} />

      <section className="mt-6 flex flex-col gap-4">
        {sesionesOrdenadas.map((sesion) => (
          <SesionCard
            key={sesion.id}
            sesion={sesion}
            onWriteNote={() => setSelectedSessionId(sesion.id)}
            onDelete={() => setSessionToDelete(sesion.id)}
          />
        ))}
      </section>

      {selectedSessionId !== null && (
        <SessionNoteModal
          key={selectedSessionId}
          open
          cita={sesionSeleccionada}
          onClose={() => setSelectedSessionId(null)}
          onSaveNotaBorrador={handleGuardarBorrador}
          onCompletarSesion={handleCompletarSesion}
        />
      )}

      <ConfirmDeleteModal
        open={sessionToDelete !== null}
        title="Eliminar sesión"
        message="¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer."
        onCancel={() => setSessionToDelete(null)}
        onConfirm={handleConfirmarEliminacion}
      />
    </>
  )
}

function SesionCard({ sesion, onWriteNote, onDelete }) {
  const esPendiente = sesion.estadoSesion === 'Pendiente'
  const EstadoIcon = esPendiente ? CircleIcon : CheckCircleIcon

  const encabezado = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-gray-900">{sesion.pacienteNombre}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${THERAPY_STYLES[sesion.tipoTerapia] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {sesion.tipoTerapia}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_SESION_STYLES[sesion.estadoSesion] ?? 'bg-gray-100 text-gray-600'}`}
        >
          <EstadoIcon className="h-3.5 w-3.5" />
          {sesion.estadoSesion}
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-500">
        {formatFechaCorta(sesion.fecha)} &middot; {sesion.hora} &middot; {sesion.duracion}
      </p>

      {sesion.notasClinicas ? (
        <p className="mt-3 text-sm text-gray-600">{sesion.notasClinicas}</p>
      ) : (
        <p className="mt-3 text-sm italic text-gray-400">
          Clic para escribir la nota de esta sesión.
        </p>
      )}
    </>
  )

  // Toda tarjeta es editable, sea Pendiente o Completada — así se puede
  // corregir el monto o la nota de una sesión ya cerrada sin perder la
  // sincronización con el resto de la app.
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <button type="button" onClick={onWriteNote} className="flex-1 text-left">
        {encabezado}
      </button>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`Eliminar sesión de ${sesion.pacienteNombre}`}
        className="shrink-0 text-red-500 transition-colors hover:text-red-700"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
