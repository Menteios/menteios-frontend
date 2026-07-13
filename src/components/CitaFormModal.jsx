import { useState } from 'react'
import Modal from './Modal'
import { XIcon, MoneyIcon } from './icons/DashboardIcons'
import { TIPOS_TERAPIA } from '../mockData'

const INPUT_CLASSES =
  'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-brand-500'

const OTRO_TERAPIA = 'Otro (Especificar...)'
const OPCIONES_TERAPIA = [...TIPOS_TERAPIA, OTRO_TERAPIA]

// `pacientes` llega por props (estado vivo de App.jsx), nunca importado
// directo de mockData.js: si un paciente se elimina en cascada, este
// selector no debe seguir ofreciéndolo para agendar citas nuevas.
export default function CitaFormModal({ open, pacientes, defaultFecha, onClose, onSubmit }) {
  const [form, setForm] = useState(() => {
    const pacienteInicial = pacientes[0]
    return {
      pacienteId: pacienteInicial?.id ?? '',
      fecha: defaultFecha,
      hora: '',
      tipoTerapia: TIPOS_TERAPIA[0],
      tipoTerapiaOtro: '',
      // El monto hereda por defecto el costoCita del paciente seleccionado;
      // queda editable por si esa sesión puntual tiene un valor distinto.
      monto: pacienteInicial?.costoCita != null ? String(pacienteInicial.costoCita) : '',
    }
  })

  if (!open) return null

  const esOtraTerapia = form.tipoTerapia === OTRO_TERAPIA

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handlePacienteChange(event) {
    const pacienteId = event.target.value
    const paciente = pacientes.find((p) => p.id === pacienteId)
    setForm((prev) => ({
      ...prev,
      pacienteId,
      monto: paciente?.costoCita != null ? String(paciente.costoCita) : prev.monto,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const paciente = pacientes.find((p) => p.id === form.pacienteId)
    const tipoTerapiaFinal = esOtraTerapia ? form.tipoTerapiaOtro.trim() : form.tipoTerapia

    onSubmit({
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
      fecha: form.fecha,
      hora: form.hora,
      tipoTerapia: tipoTerapiaFinal,
      monto: Number(form.monto),
      telefono: paciente.telefono,
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
            onChange={handlePacienteChange}
            className={INPUT_CLASSES}
          >
            {pacientes.map((paciente) => (
              <option key={paciente.id} value={paciente.id}>
                {paciente.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Monto">
          <div className="relative">
            <MoneyIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.monto}
              onChange={handleChange('monto')}
              className={`${INPUT_CLASSES} pl-11`}
            />
          </div>
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
            {OPCIONES_TERAPIA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              esOtraTerapia ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <input
                type="text"
                required={esOtraTerapia}
                value={form.tipoTerapiaOtro}
                onChange={handleChange('tipoTerapiaOtro')}
                placeholder="Escribe el tipo de terapia..."
                className={INPUT_CLASSES}
              />
            </div>
          </div>
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
