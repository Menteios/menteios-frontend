import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'

// Módulo aislado de persistencia — nadie fuera de este archivo importa
// `better-sqlite3` directamente. `db` vive en memoria del proceso
// principal una vez inicializado; el renderer nunca lo toca directo,
// solo a través de los canales IPC en main.js.
let db = null

// `app.getPath('userData')` solo está garantizado después de que la app
// esté "ready" — por eso la inicialización es explícita (se llama desde
// `app.whenReady()` en main.js) y no un efecto de solo importar este
// archivo. La carpeta de userData es específica de cada instalación
// (ej. ~/Library/Application Support/menteios-frontend en Mac), así que
// el .db queda en un lugar seguro y persistente en producción.
export function initDatabase() {
  if (db) return db

  const dbPath = path.join(app.getPath('userData'), 'menteios.db')
  db = new Database(dbPath)

  // SQLite trae las foreign keys DESACTIVADAS por default en cada nueva
  // conexión — no es algo que se guarde en el archivo .db, hay que
  // pedirlo cada vez que se abre. Sin este PRAGMA, el ON DELETE CASCADE
  // de `citas` de más abajo quedaría declarado pero nunca se ejecutaría.
  db.pragma('foreign_keys = ON')

  // NOT NULL explícito en `id`: a diferencia de INTEGER PRIMARY KEY (que
  // sí es NOT NULL automáticamente al ser alias del rowid), un TEXT
  // PRIMARY KEY en SQLite NO impone NOT NULL por sí solo — hay que
  // declararlo aparte para que de verdad sea obligatorio.
  //
  // `pacientes` trae todos los campos que ya usa la pantalla de
  // Pacientes (edad, diagnóstico, área a trabajar, plan de ejecución,
  // estado) — no solo los 4 mínimos del primer esquema — para que
  // `getPacientes()` alimente la tabla real sin perder columnas.
  db.exec(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      edad INTEGER,
      diagnostico TEXT,
      areaTrabajar TEXT,
      planesEjecucion TEXT,
      estado TEXT,
      telefono TEXT,
      costoCita REAL
    );

    CREATE TABLE IF NOT EXISTS citas (
      id TEXT PRIMARY KEY NOT NULL,
      pacienteId TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT,
      tipoTerapia TEXT,
      duracion TEXT,
      estadoSesion TEXT,
      notasClinicas TEXT,
      monto REAL,
      FOREIGN KEY (pacienteId) REFERENCES pacientes(id) ON DELETE CASCADE
    );
  `)

  return db
}

// --- Pacientes ------------------------------------------------------------
export function getPacientes() {
  return db.prepare('SELECT * FROM pacientes').all()
}

export function addPaciente(paciente) {
  db.prepare(
    `INSERT INTO pacientes (id, nombre, edad, diagnostico, areaTrabajar, planesEjecucion, estado, telefono, costoCita)
     VALUES (@id, @nombre, @edad, @diagnostico, @areaTrabajar, @planesEjecucion, @estado, @telefono, @costoCita)`,
  ).run({
    id: paciente.id,
    nombre: paciente.nombre,
    edad: paciente.edad ?? null,
    diagnostico: paciente.diagnostico ?? null,
    areaTrabajar: paciente.areaTrabajar ?? null,
    planesEjecucion: paciente.planesEjecucion ?? null,
    estado: paciente.estado ?? 'Activo',
    telefono: paciente.telefono ?? null,
    costoCita: paciente.costoCita ?? null,
  })
  return paciente
}

// El DELETE FROM pacientes dispara el ON DELETE CASCADE de `citas` — no
// hace falta borrar las citas del paciente a mano acá.
export function deletePaciente(id) {
  db.prepare('DELETE FROM pacientes WHERE id = ?').run(id)
}

// --- Citas ------------------------------------------------------------------
// `pacienteNombre` y `telefono` no se guardan en `citas` (serían datos
// duplicados que podrían desincronizarse si el paciente cambia de nombre
// o de teléfono) — se traen con un JOIN a `pacientes` en cada lectura,
// igual que espera la UI (AgendaPanel usa `cita.telefono` para el botón
// de WhatsApp, las tablas usan `cita.pacienteNombre`).
export function getCitas() {
  return db
    .prepare(
      `SELECT
         citas.id,
         citas.pacienteId,
         citas.fecha,
         citas.hora,
         citas.tipoTerapia,
         citas.duracion,
         citas.estadoSesion,
         citas.notasClinicas,
         citas.monto,
         pacientes.nombre AS pacienteNombre,
         pacientes.telefono AS telefono
       FROM citas
       JOIN pacientes ON pacientes.id = citas.pacienteId
       ORDER BY citas.fecha, citas.hora`,
    )
    .all()
}

export function addCita(cita) {
  db.prepare(
    `INSERT INTO citas (id, pacienteId, fecha, hora, tipoTerapia, duracion, estadoSesion, notasClinicas, monto)
     VALUES (@id, @pacienteId, @fecha, @hora, @tipoTerapia, @duracion, @estadoSesion, @notasClinicas, @monto)`,
  ).run({
    id: cita.id,
    pacienteId: cita.pacienteId,
    fecha: cita.fecha,
    hora: cita.hora ?? null,
    tipoTerapia: cita.tipoTerapia ?? null,
    duracion: cita.duracion ?? '50 min',
    estadoSesion: cita.estadoSesion ?? 'Pendiente',
    notasClinicas: cita.notasClinicas ?? '',
    monto: cita.monto ?? null,
  })
  return cita
}

export function deleteCita(id) {
  db.prepare('DELETE FROM citas WHERE id = ?').run(id)
}
