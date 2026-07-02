import { useState } from 'react'
import { SearchIcon, PlusIcon, PencilIcon, EyeIcon } from '../components/icons/DashboardIcons'
import Toast from '../components/Toast'
import PacienteFormModal from '../components/PacienteFormModal'
import PacienteDetailModal from '../components/PacienteDetailModal'
import { pacientes as pacientesIniciales } from '../mockData'

const ESTADO_STYLES = {
  Activo: 'bg-emerald-50 text-emerald-600',
  Inactivo: 'bg-gray-100 text-gray-500',
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState(pacientesIniciales)
  const [searchTerm, setSearchTerm] = useState('')
  const [showToast, setShowToast] = useState(false)
  // null | { mode: 'create' } | { mode: 'edit', pacienteId }
  const [formModal, setFormModal] = useState(null)
  const [detailPacienteId, setDetailPacienteId] = useState(null)

  const pacientesFiltrados = pacientes.filter((paciente) =>
    paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pacienteEnEdicion =
    formModal?.mode === 'edit' ? pacientes.find((p) => p.id === formModal.pacienteId) : null

  const pacienteEnDetalle = pacientes.find((p) => p.id === detailPacienteId) ?? null

  function notificarGuardado() {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  function handleCrearPaciente(datos) {
    setPacientes((prev) => [...prev, { id: Date.now(), estado: 'Activo', ...datos }])
    setFormModal(null)
    notificarGuardado()
  }

  function handleActualizarPaciente(datos) {
    setPacientes((prev) =>
      prev.map((p) => (p.id === formModal.pacienteId ? { ...p, ...datos } : p)),
    )
    setFormModal(null)
    notificarGuardado()
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900">Pacientes</h1>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar paciente..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-brand-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setFormModal({ mode: 'create' })}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo paciente
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {pacientesFiltrados.map((paciente) => (
          <PacienteCard
            key={paciente.id}
            paciente={paciente}
            onEdit={() => setFormModal({ mode: 'edit', pacienteId: paciente.id })}
            onView={() => setDetailPacienteId(paciente.id)}
          />
        ))}

        {pacientesFiltrados.length === 0 && (
          <p className="rounded-2xl border border-gray-100 bg-white px-6 py-8 text-center text-sm text-gray-400">
            No se encontraron pacientes con ese nombre.
          </p>
        )}
      </div>

      {formModal && (
        <PacienteFormModal
          key={formModal.mode === 'edit' ? formModal.pacienteId : 'create'}
          open
          mode={formModal.mode}
          initialValues={pacienteEnEdicion}
          onClose={() => setFormModal(null)}
          onSubmit={formModal.mode === 'edit' ? handleActualizarPaciente : handleCrearPaciente}
        />
      )}

      <PacienteDetailModal
        open={detailPacienteId !== null}
        paciente={pacienteEnDetalle}
        onClose={() => setDetailPacienteId(null)}
      />

      <Toast
        show={showToast}
        message="Paciente guardado correctamente"
        onClose={() => setShowToast(false)}
      />
    </>
  )
}

function PacienteCard({ paciente, onEdit, onView }) {
  return (
    <article className="flex items-center justify-between gap-6 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
      <div className="grid flex-1 grid-cols-2 gap-x-10 gap-y-2 text-sm">
        <p className="col-span-2 text-base">
          <span className="text-brand-600">Nombre: </span>
          <span className="font-semibold text-gray-900">{paciente.nombre}</span>
        </p>
        <p className="text-gray-700">
          <span className="text-brand-600">Edad: </span>
          {paciente.edad} años
        </p>
        <p className="text-gray-700">
          <span className="text-brand-600">Diagnóstico: </span>
          {paciente.diagnostico}
        </p>
        <p className="text-gray-700">
          <span className="text-brand-600">Área a trabajar: </span>
          {paciente.areaTrabajar}
        </p>
        <p className="text-gray-700">
          <span className="text-brand-600">Planes de ejecución: </span>
          {paciente.planesEjecucion}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${ESTADO_STYLES[paciente.estado] ?? 'bg-gray-100 text-gray-500'}`}
        >
          {paciente.estado}
        </span>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar a ${paciente.nombre}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-brand-300 hover:text-brand-600"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onView}
          aria-label={`Ver a ${paciente.nombre}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-brand-300 hover:text-brand-600"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}
