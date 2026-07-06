import { MoneyIcon } from './icons/DashboardIcons'

// Ingresos reales: solo cuenta el `monto` de citas con estadoSesion
// 'Completada'. Es un valor 100% derivado de `citas` (el mismo estado
// unificado que usan Home/Citas/Sesiones), así que se recalcula solo ante
// cualquier alta, edición o eliminación — no hay nada que sincronizar.
export default function RevenueSummary({ citas }) {
  const total = citas
    .filter((cita) => cita.estadoSesion === 'Completada')
    .reduce((suma, cita) => suma + (Number(cita.monto) || 0), 0)

  return (
    <div className="mt-6 flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
        <MoneyIcon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-emerald-700">Ingresos por sesiones completadas</p>
        <p className="text-2xl font-semibold text-emerald-900">
          ${total.toLocaleString('es-AR')}
        </p>
      </div>
    </div>
  )
}
