import { useState } from 'react'
import Modal from './Modal'
import { XIcon } from './icons/DashboardIcons'
import { pacientes, TIPOS_TERAPIA } from '../mockData'

const INPUT_CLASSES =
  'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-brand-500'

export default function CitaFormModal({ open, defaultFecha, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    pacienteId: pacientes[0]?.id ?? '',
    fecha: defaultFecha,
    hora: '',
    tipoTerapia: TIPOS_TERAPIA[0],
  }))

  if (!open) return null

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const paciente = pacientes.find((p) => p.id === Number(form.pacienteId))
    onSubmit({
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
      fecha: form.fecha,
      hora: form.hora,
      tipoTerapia: form.tipoTerapia,
    })
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Nueva cita</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="text-gray-400 transition hover:text-gray-600"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <Field label="Paciente">
          <select
            required
            value={form.pacienteId}
            onChange={handleChange('pacienteId')}
            className={INPUT_CLASSES}
          >
            {pacientes.map((paciente) => (
              <option key={paciente.id} value={paciente.id}>
                {paciente.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fecha">
          <input
            required
            type="date"
            value={form.fecha}
            onChange={handleChange('fecha')}
            className={INPUT_CLASSES}
          />
        </Field>

        <Field label="Hora">
          <input
            required
            type="time"
            value={form.hora}
            onChange={handleChange('hora')}
            className={INPUT_CLASSES}
          />
        </Field>

        <Field label="Tipo de terapia">
          <select
            required
            value={form.tipoTerapia}
            onChange={handleChange('tipoTerapia')}
            className={INPUT_CLASSES}
          >
            {TIPOS_TERAPIA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </Field>

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-gray-600">{label}</span>
      {children}
    </label>
  )
}
