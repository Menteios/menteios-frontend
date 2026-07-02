/**
 * Mock data layer. Shaped the way the future API/DB responses are expected
 * to look, so wiring up real endpoints later means swapping these exports
 * for fetch/query calls — no changes needed in the components that consume them.
 */

export const pacientes = [
  {
    id: 1,
    nombre: 'María García',
    edad: 34,
    diagnostico: 'Trastorno de ansiedad generalizada',
    areaTrabajar: 'Manejo del estrés y regulación emocional',
    planesEjecucion: '12 sesiones - Técnicas cognitivo-conductuales',
    estado: 'Activo',
  },
  {
    id: 2,
    nombre: 'Carlos López',
    edad: 28,
    diagnostico: 'Depresión leve',
    areaTrabajar: 'Autoestima y habilidades sociales',
    planesEjecucion: '8 sesiones - Activación conductual',
    estado: 'Activo',
  },
  {
    id: 3,
    nombre: 'Ana Martínez',
    edad: 41,
    diagnostico: 'Fobia específica',
    areaTrabajar: 'Exposición gradual y desensibilización',
    planesEjecucion: '10 sesiones - Terapia de exposición',
    estado: 'Activo',
  },
  {
    id: 4,
    nombre: 'Pedro Sánchez',
    edad: 37,
    diagnostico: 'Trastorno de estrés postraumático',
    areaTrabajar: 'Regulación emocional y manejo del estrés',
    planesEjecucion: '15 sesiones - EMDR',
    estado: 'Activo',
  },
]

export const citas = [
  {
    id: 1,
    pacienteId: 1,
    pacienteNombre: 'María García',
    fecha: '2026-06-09',
    monto: 800,
    tipoTerapia: 'Cognitivo-conductual',
  },
  {
    id: 2,
    pacienteId: 2,
    pacienteNombre: 'Carlos López',
    fecha: '2026-06-09',
    monto: 650,
    tipoTerapia: 'Terapia breve',
  },
  {
    id: 3,
    pacienteId: 3,
    pacienteNombre: 'Ana Martínez',
    fecha: '2026-06-10',
    monto: 800,
    tipoTerapia: 'Psicoanálisis',
  },
  {
    id: 4,
    pacienteId: 4,
    pacienteNombre: 'Pedro Sánchez',
    fecha: '2026-06-10',
    monto: 700,
    tipoTerapia: 'Gestalt',
  },
]

export const metricasHome = {
  totalPacientes: 48,
  citasDelDia: 7,
  sesionesEstaSemana: 124,
  reportes: 15,
}
