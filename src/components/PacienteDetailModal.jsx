import Modal from './Modal'

export default function PacienteDetailModal({ open, paciente, onClose }) {
  if (!open || !paciente) return null

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Detalle del paciente</h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          {paciente.estado}
        </span>
      </div>

      <dl className="mt-6 flex flex-col gap-5 text-sm">
        <DetailRow label="Nombre" value={paciente.nombre} />
        <DetailRow label="Edad" value={`${paciente.edad} años`} />
        <DetailRow label="Diagnóstico" value={paciente.diagnostico} />
        <DetailRow label="Área a trabajar" value={paciente.areaTrabajar} />
        <DetailRow label="Plan de ejecución" value={paciente.planesEjecucion} />
        <DetailRow label="Teléfono" value={paciente.telefono} />
        <DetailRow label="Costo de cita" value={`$${paciente.costoCita}`} />
      </dl>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-brand-600">{label}</dt>
      <dd className="mt-1 text-base text-gray-800">{value}</dd>
    </div>
  )
}
