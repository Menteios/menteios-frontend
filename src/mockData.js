/**
 * Mock data layer. Shaped the way the future API/DB responses are expected
 * to look, so wiring up real endpoints later means swapping these exports
 * for fetch/query calls — no changes needed in the components that consume them.
 */

export const pacientes = [
  {
    id: 1,
    nombre: 'María García',
    correo: 'maria.garcia@example.com',
    telefono: '+54 9 11 2345-6789',
    tipoTerapia: 'Cognitivo-conductual',
    fechaRegistro: '2025-11-03',
  },
  {
    id: 2,
    nombre: 'Carlos López',
    correo: 'carlos.lopez@example.com',
    telefono: '+54 9 11 3456-7890',
    tipoTerapia: 'Terapia breve',
    fechaRegistro: '2025-12-15',
  },
  {
    id: 3,
    nombre: 'Ana Martínez',
    correo: 'ana.martinez@example.com',
    telefono: '+54 9 11 4567-8901',
    tipoTerapia: 'Psicoanálisis',
    fechaRegistro: '2026-01-20',
  },
  {
    id: 4,
    nombre: 'Pedro Sánchez',
    correo: 'pedro.sanchez@example.com',
    telefono: '+54 9 11 5678-9012',
    tipoTerapia: 'Gestalt',
    fechaRegistro: '2026-02-10',
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
