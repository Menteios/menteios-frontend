import { useState } from 'react'
import Modal from './Modal'
import { XIcon } from './icons/DashboardIcons'

const INPUT_CLASSES =
  'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-brand-500'

export default function PacienteFormModal({ open, mode, initialValues, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    nombre: initialValues?.nombre ?? '',
    edad: initialValues?.edad != null ? String(initialValues.edad) : '',
    diagnostico: initialValues?.diagnostico ?? '',
    areaTrabajar: initialValues?.areaTrabajar ?? '',
    planesEjecucion: initialValues?.planesEjecucion ?? '',
  }))

  if (!open) return null

  const isEdit = mode === 'edit'

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ ...form, edad: Number(form.edad) })
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Editar paciente' : 'Nuevo paciente'}
        </h2>
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
        <Field label="Nombre">
          <input
            required
            value={form.nombre}
            onChange={handleChange('nombre')}
            className={INPUT_CLASSES}
          />
        </Field>

        <Field label="Edad">
          <input
            required
            type="number"
            min="0"
            value={form.edad}
            onChange={handleChange('edad')}
            className={INPUT_CLASSES}
          />
        </Field>

        <Field label="Diagnóstico">
          <input
            required
            value={form.diagnostico}
            onChange={handleChange('diagnostico')}
            className={INPUT_CLASSES}
          />
        </Field>

        <Field label="Área a trabajar">
          <input
            required
            value={form.areaTrabajar}
            onChange={handleChange('areaTrabajar')}
            className={INPUT_CLASSES}
          />
        </Field>

        <Field label="Plan de ejecución">
          <input
            required
            value={form.planesEjecucion}
            onChange={handleChange('planesEjecucion')}
            placeholder="ej: 12 sesiones - Técnicas cognitivo-conductuales"
            className={INPUT_CLASSES}
          />
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
            {isEdit ? 'Guardar cambios' : 'Guardar'}
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
