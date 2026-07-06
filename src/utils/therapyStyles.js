// Mapeo de tipo de terapia -> clases Tailwind de la píldora. Vive separado
// de mockData.js (que solo debe describir datos, no presentación) y se
// reutiliza en AppointmentsTable, Sesiones, etc.
export const THERAPY_STYLES = {
  'Cognitivo-conductual': 'bg-sky-50 text-sky-600',
  'Terapia breve': 'bg-amber-50 text-amber-600',
  Psicoanálisis: 'bg-violet-50 text-violet-600',
  Gestalt: 'bg-emerald-50 text-emerald-600',
}
