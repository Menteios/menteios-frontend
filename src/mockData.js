/**
 * Mock data layer. Shaped the way the future API/DB responses are expected
 * to look, so wiring up real endpoints later means swapping these exports
 * for fetch/query calls — no changes needed in the components that consume them.
 */

// Referencia de "hoy" para el mock, ya que los datos ficticios viven en
// junio de 2026. Cuando se conecte al backend real, esto se reemplaza por
// la fecha del sistema (ej. new Date().toISOString().slice(0, 10)).
export const HOY = '2026-06-09'

export const pacientes = [
  {
    id: 1,
    nombre: 'María García',
    edad: 34,
    diagnostico: 'Trastorno de ansiedad generalizada',
    areaTrabajar: 'Manejo del estrés y regulación emocional',
    planesEjecucion: '12 sesiones - Técnicas cognitivo-conductuales',
    estado: 'Activo',
    costoCita: 800,
  },
  {
    id: 2,
    nombre: 'Carlos López',
    edad: 28,
    diagnostico: 'Depresión leve',
    areaTrabajar: 'Autoestima y habilidades sociales',
    planesEjecucion: '8 sesiones - Activación conductual',
    estado: 'Activo',
    costoCita: 650,
  },
  {
    id: 3,
    nombre: 'Ana Martínez',
    edad: 41,
    diagnostico: 'Fobia específica',
    areaTrabajar: 'Exposición gradual y desensibilización',
    planesEjecucion: '10 sesiones - Terapia de exposición',
    estado: 'Activo',
    costoCita: 800,
  },
  {
    id: 4,
    nombre: 'Pedro Sánchez',
    edad: 37,
    diagnostico: 'Trastorno de estrés postraumático',
    areaTrabajar: 'Regulación emocional y manejo del estrés',
    planesEjecucion: '15 sesiones - EMDR',
    estado: 'Activo',
    costoCita: 700,
  },
]

// `estadoSesion`, `duracion` y `notasClinicas` son opcionales por diseño:
// una cita recién agendada (ej. desde CitaFormModal) no los trae todavía.
// Se completan cuando la sesión ocurre y el profesional guarda su nota
// (ver handleSaveNotaBorrador/handleCompletarSesion en src/App.jsx).
// `monto` se hereda por defecto del `costoCita` del paciente al agendar.
export const citas = [
  {
    id: 1,
    pacienteId: 1,
    pacienteNombre: 'María García',
    fecha: '2026-06-09',
    hora: '10:00',
    monto: 800,
    tipoTerapia: 'Cognitivo-conductual',
    estadoSesion: 'Completada',
    duracion: '50 min',
    notasClinicas: 'Avance en técnicas de respiración. Tarea: diario de pensamientos.',
  },
  {
    id: 2,
    pacienteId: 2,
    pacienteNombre: 'Carlos López',
    fecha: '2026-06-09',
    hora: '12:00',
    monto: 650,
    tipoTerapia: 'Terapia breve',
    estadoSesion: 'Completada',
    duracion: '50 min',
    notasClinicas: 'Identificación de patrones de evitación social.',
  },
  {
    id: 3,
    pacienteId: 3,
    pacienteNombre: 'Ana Martínez',
    fecha: '2026-06-10',
    hora: '09:30',
    monto: 800,
    tipoTerapia: 'Psicoanálisis',
    estadoSesion: 'Pendiente',
    duracion: '50 min',
    notasClinicas: 'Exploración de conflictos inconscientes y su impacto emocional.',
  },
  {
    id: 4,
    pacienteId: 4,
    pacienteNombre: 'Pedro Sánchez',
    fecha: '2026-06-10',
    hora: '11:00',
    monto: 700,
    tipoTerapia: 'Gestalt',
    estadoSesion: 'Pendiente',
    duracion: '50 min',
    notasClinicas: 'Procesamiento de recuerdos traumáticos. Fase de estabilización.',
  },
  {
    id: 5,
    pacienteId: 1,
    pacienteNombre: 'María García',
    fecha: '2026-06-13',
    hora: '09:00',
    monto: 800,
    tipoTerapia: 'Cognitivo-conductual',
    estadoSesion: 'Pendiente',
    duracion: '50 min',
    notasClinicas: '',
  },
  {
    id: 6,
    pacienteId: 3,
    pacienteNombre: 'Ana Martínez',
    fecha: '2026-06-13',
    hora: '11:30',
    monto: 800,
    tipoTerapia: 'Psicoanálisis',
    estadoSesion: 'Pendiente',
    duracion: '50 min',
    notasClinicas: '',
  },
  {
    id: 7,
    pacienteId: 2,
    pacienteNombre: 'Carlos López',
    fecha: '2026-06-15',
    hora: '10:00',
    monto: 650,
    tipoTerapia: 'Terapia breve',
    estadoSesion: 'Pendiente',
    duracion: '50 min',
    notasClinicas: '',
  },
  {
    id: 8,
    pacienteId: 4,
    pacienteNombre: 'Pedro Sánchez',
    fecha: '2026-06-17',
    hora: '15:00',
    monto: 700,
    tipoTerapia: 'Gestalt',
    estadoSesion: 'Pendiente',
    duracion: '50 min',
    notasClinicas: '',
  },
]

// Tipos de terapia disponibles al agendar una cita — se reutiliza el mismo
// vocabulario que ya usan AppointmentsTable/Pacientes para mantener las
// píldoras de color consistentes en toda la app.
export const TIPOS_TERAPIA = ['Cognitivo-conductual', 'Terapia breve', 'Psicoanálisis', 'Gestalt']

// "citasDelDia", "totalPacientes" y "sesionesEstaSemana" ya no viven acá: se
// calculan en tiempo real a partir de los arrays `citas`/`pacientes` (ver
// src/pages/Home.jsx y src/pages/Sesiones.jsx), para que nunca se
// desincronicen de la fuente de verdad compartida en App.jsx. Solo queda
// "reportes" porque todavía no existe un array de reportes que contar.
export const metricasHome = {
  reportes: 15,
}
