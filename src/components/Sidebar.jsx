import { TreeLogo, MenteiosWordmark } from './MenteiosLogo'
import { HomeIcon, UsersIcon, CalendarIcon, SessionsIcon, ReportsIcon, LogoutIcon } from './icons/DashboardIcons'

// Mock nav config — will map 1:1 to routes once real navigation/DB-backed pages exist.
const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: HomeIcon },
  { id: 'pacientes', label: 'Pacientes', icon: UsersIcon },
  { id: 'citas', label: 'Citas del día', icon: CalendarIcon },
  { id: 'sesiones', label: 'Sesiones', icon: SessionsIcon },
  { id: 'reportes', label: 'Reportes', icon: ReportsIcon },
]

export default function Sidebar({ activeTab, onSelectTab, usuarioActual, onLogout }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col items-center justify-between border-r border-gray-100 bg-white px-6 py-8">
      <div className="flex w-full flex-col items-center gap-8">
        <TreeLogo className="h-24 w-32" />

        <nav className="flex w-full flex-col gap-1.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        {usuarioActual && (
          <div className="flex w-full items-center justify-between gap-2 rounded-xl bg-gray-50 px-4 py-3">
            <span className="truncate text-sm font-medium text-gray-700" title={usuarioActual.nombre}>
              {usuarioActual.nombre}
            </span>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Cerrar sesión"
              className="shrink-0 text-gray-400 transition hover:text-red-600"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        <MenteiosWordmark />
      </div>
    </aside>
  )
}
