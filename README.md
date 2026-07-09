# Menteios — Frontend

Aplicación de escritorio de Menteios para la gestión de un consultorio de psicología, construida con **Electron + React + Vite + Tailwind CSS**. Es un frontend funcional: toda la información vive en `src/mockData.js` y en el estado de `App.jsx`, con la forma exacta que tendría una respuesta de API real, lista para reemplazarse por llamadas a un backend sin tocar los componentes.

Pantallas implementadas: **Login**, **Inicio (Resumen general)**, **Pacientes**, **Citas**, **Sesiones** y **Reportes**.

## Stack

| Capa | Tecnología | Rol |
|---|---|---|
| UI | React 19 | Componentes de la interfaz |
| Bundler / dev server | Vite 8 | Compila y sirve el frontend con HMR |
| Estilos | Tailwind CSS 4 (`@tailwindcss/vite`) | Utilidades CSS, sin archivo `tailwind.config.js` (Tailwind v4 se configura en CSS) |
| Escritorio | Electron 43 | Ventana nativa que carga el frontend |
| Empaquetado | electron-builder | Genera el instalable de producción |

## Estructura del proyecto

```
menteios-frontend/
├── docs/
│   └── MANUAL_USUARIO.md/.docx       # Manual para el personal del consultorio (no técnico)
├── electron/
│   ├── main.js                        # Proceso principal de Electron (crea la ventana)
│   └── preload.js                      # Puente reservado para IPC futuro (main ↔ renderer)
├── src/
│   ├── assets/                          # Imágenes estáticas importadas por componentes
│   ├── components/
│   │   ├── icons/
│   │   │   └── DashboardIcons.jsx         # Set de íconos SVG inline (sidebar, acciones, calendario, WhatsApp, Word/PDF)
│   │   ├── AgendaPanel.jsx                 # Panel derecho de Citas: agenda del día + WhatsApp + cancelar
│   │   ├── AppointmentsTable.jsx           # Tabla "Próximas citas" (Home)
│   │   ├── Calendar.jsx                    # Calendario mensual interactivo (Citas)
│   │   ├── CitaFormModal.jsx               # Modal "Nueva cita"
│   │   ├── ConfirmDeleteModal.jsx          # Modal de confirmación genérico (Citas y Pacientes)
│   │   ├── MenteiosLogo.jsx                # Logo del árbol + wordmark, en SVG inline
│   │   ├── Modal.jsx                       # Wrapper genérico de modal (backdrop + tarjeta blanca)
│   │   ├── PacienteDetailModal.jsx         # Modal de solo lectura (ver paciente)
│   │   ├── PacienteFormModal.jsx           # Modal de formulario (crear/editar paciente)
│   │   ├── RevenueSummary.jsx              # Barra de ingresos por sesiones completadas (Home y Sesiones)
│   │   ├── SessionNoteModal.jsx            # Modal "Escribir nota de sesión" (guardar borrador / completar)
│   │   ├── Sidebar.jsx                     # Navegación lateral (Inicio, Pacientes, Citas, Sesiones, Reportes)
│   │   ├── SummaryCard.jsx                 # Tarjeta de métrica clicable (Home)
│   │   └── Toast.jsx                       # Notificación flotante de confirmación
│   ├── layouts/
│   │   └── DashboardLayout.jsx             # Sidebar + área de contenido, compartido por todas las pantallas post-login
│   ├── pages/
│   │   ├── Citas.jsx                       # Calendario + agenda + alta/baja de citas
│   │   ├── Home.jsx                        # Resumen general (dashboard)
│   │   ├── Login.jsx                       # Pantalla de login
│   │   ├── Pacientes.jsx                   # Buscador + CRUD de pacientes vía modales
│   │   ├── Reportes.jsx                    # Gestor de machotes/plantillas clínicas
│   │   └── Sesiones.jsx                    # Historial clínico + notas + ingresos
│   ├── utils/
│   │   ├── date.js                          # Helpers de fecha (meses, rango semanal, formateo corto)
│   │   └── therapyStyles.js                  # Mapeo tipo de terapia → clases Tailwind (píldoras de color)
│   ├── App.jsx                                # Enrutamiento por estado + única fuente de verdad (citas/pacientes)
│   ├── main.jsx                                # Monta React en el DOM (#root)
│   ├── mockData.js                              # Datos simulados: pacientes, citas, tipos de terapia
│   └── index.css                                 # Import de Tailwind + paleta de color de marca
├── index.html                                     # HTML raíz que carga src/main.jsx
├── vite.config.js                                  # Config de Vite + plugin de Tailwind
└── package.json                                     # Scripts, dependencias y config de electron-builder
```

## Cómo funciona

### 1. Electron (`electron/main.js`)

El proceso principal crea una `BrowserWindow` de 1280×820px (mínimo 960×640) y decide qué cargar según el modo:

- **Desarrollo** (`app.isPackaged === false`): carga `http://localhost:5173`, el servidor de Vite corriendo en paralelo. Así tienes Hot Module Reload dentro de la ventana de Electron.
- **Producción** (app empaquetada): carga el `dist/index.html` generado por `vite build`.

La ventana se abre con `contextIsolation: true` y `nodeIntegration: false` (buenas prácticas de seguridad: el renderer no tiene acceso directo a Node/Electron). `win.webContents.setWindowOpenHandler` intercepta los enlaces que se abrirían en una ventana nueva (por ejemplo el botón de WhatsApp de Citas) y los manda al navegador del sistema con `shell.openExternal`, en vez de abrir una ventana de Electron sin controles. `electron/preload.js` queda reservado para cuando haga falta exponer una API vía `contextBridge` — hoy está vacío a propósito.

### 2. Vite + Tailwind (`vite.config.js`, `src/index.css`)

- `vite.config.js` usa `base: './'` para que las rutas de los assets del build sean **relativas** — necesario porque Electron carga `dist/index.html` con el protocolo `file://`, no `http://`.
- Tailwind v4 no usa `tailwind.config.js`: se activa con `@import 'tailwindcss'` en `src/index.css`, y la paleta de marca (verde-azulado/teal) se define ahí con un bloque `@theme` (`--color-brand-500` … `--color-brand-800`), que Tailwind convierte en utilidades como `bg-brand-700` o `text-brand-600`.

### 3. Enrutamiento y estado compartido (`src/App.jsx`)

No hay un router de terceros — la navegación es un `useState('inicio')` que decide qué pantalla renderizar dentro de `DashboardLayout`. `PAGE_RENDERERS` mapea cada id del Sidebar a su pantalla, y cada renderer recibe un mismo objeto `ctx` (navegación + estado global) del que toma solo lo que necesita:

```js
const PAGE_RENDERERS = {
  inicio: (ctx) => <Home onNavigate={ctx.navigate} citas={ctx.globalCitas} pacientes={ctx.pacientes} />,
  pacientes: (ctx) => <Pacientes pacientes={ctx.pacientes} onAddPaciente={ctx.handleAddPaciente} ... />,
  citas: (ctx) => <Citas citas={ctx.globalCitas} pacientes={ctx.pacientes} ... />,
  sesiones: (ctx) => <Sesiones citas={ctx.globalCitas} ... />,
  reportes: () => <Reportes />,
}
```

**`globalCitas` y `pacientes` viven únicamente en `App.jsx`.** Ningún componente mantiene una copia local ni importa esos arrays directo de `mockData.js` — todos los reciben por props. Esto significa que una cita creada en Citas aparece al instante en la tabla del Home y en el historial de Sesiones; que borrar un paciente en Pacientes elimina en cascada (por `pacienteId`) todas sus citas/sesiones de todas las pantallas; y que completar una sesión con un monto editado recalcula los ingresos en Home y Sesiones a la vez — sin ningún paso extra de sincronización.

Todas las mutaciones pasan por handlers nombrados y aislados en `App.jsx` (`handleAddCita`, `handleDeleteCita`, `handleAddPaciente`, `handleUpdatePaciente`, `handleDeletePaciente`, `handleSaveNotaBorrador`, `handleCompletarSesion`, `handleDeleteSesion`), cada uno con una firma simple (`id`, `datos`) — el día que haya backend real, solo hay que cambiar el cuerpo de estas funciones por `fetch`/`ipcRenderer`, sin tocar ninguna pantalla.

### 4. Login (`src/pages/Login.jsx`)

Componente controlado: `useState` para `usuario`, `password` y `recordarme`. La contraseña exige mínimo 8 caracteres, 1 mayúscula, 1 número y 1 signo (`PASSWORD_REQUIREMENTS`); un checklist en vivo (verde/gris por requisito) aparece al enfocar el campo, y `handleSubmit` bloquea el envío con una advertencia si no se cumplen todos los requisitos. Por ahora solo hace `console.log` de los datos — no hay backend todavía.

> Esta pantalla aún no está conectada a la navegación real de `App.jsx` (que hoy arranca directo en el Dashboard) — queda pendiente definir el flujo de autenticación.

### 5. Inicio / Dashboard (`src/pages/Home.jsx`)

- 4 tarjetas de métricas (`SummaryCard`), clicables — cada una navega a su sección vía `onNavigate(targetTab)`.
- Todas se calculan en tiempo real a partir del estado global, nunca hardcodeadas: "Pacientes" es `pacientes.length`; "Citas del día" filtra `citas` por `fecha === HOY`; "Sesiones" filtra por la semana de `HOY` (`getWeekRange`) — la misma fórmula que usa la tarjeta "Esta semana" de Sesiones, para que ambas pantallas nunca muestren cifras distintas.
- `RevenueSummary` muestra los ingresos por sesiones completadas (`citas.filter(estadoSesion === 'Completada').reduce(+monto)`).
- La tabla "Próximas citas" ordena el array compartido por `fecha` y `hora` antes de renderizarlo.

### 6. Pacientes (`src/pages/Pacientes.jsx`)

- Buscador (`searchTerm`) que filtra la lista en tiempo real por `nombre`.
- El campo **Nombre** del formulario solo admite letras (con tildes/ñ) y espacios — se filtra cualquier número o símbolo apenas se escribe.
- CRUD completo vía modales: **crear** y **editar** (`PacienteFormModal`, con `key` por paciente para resetear el formulario al cambiar de paciente), **ver detalle** (`PacienteDetailModal`, solo lectura) y **eliminar** (`ConfirmDeleteModal` + cascada sobre `citas`).
- Cada paciente tiene `telefono` (alimenta el botón de WhatsApp de Citas) y `costoCita` (monto por defecto al agendar una cita nueva).
- Al guardar, se dispara un `Toast` que se autooculta con `setTimeout(3000)`.

### 7. Citas (`src/pages/Citas.jsx`)

- **`Calendar.jsx`**: grid mensual generado en código a partir de `Date` nativo. Marca con un punto los días con citas (`citasFechas`, un `Set` derivado), resalta el día seleccionado, y permite navegar de mes/año con flechas o `<select>` (con wraparound de año).
- **`AgendaPanel.jsx`**: lista las citas del día seleccionado. Cada fila tiene un botón de **WhatsApp** (abre `wa.me/{telefono}` en el navegador del sistema) y uno de **eliminar** (visible al pasar el cursor).
- **Alta de cita**: `CitaFormModal` — selector de paciente, fecha, hora y tipo de terapia (con opción "Otro (Especificar...)" que revela un input libre). El monto hereda por defecto el `costoCita` del paciente (editable), y el teléfono se copia del paciente para que el botón de WhatsApp funcione también en citas nuevas.
- **Baja de cita**: confirmación previa vía `ConfirmDeleteModal` antes de borrar del estado compartido.

### 8. Sesiones (`src/pages/Sesiones.jsx`)

- 4 tarjetas de métricas 100% calculadas (Total, Esta semana, Completadas, Pendientes) + `RevenueSummary`.
- Historial de tarjetas con badges de tipo de terapia y estado (`Completada`/`Pendiente`). **Toda tarjeta es clickeable**, incluidas las ya completadas, para poder corregir su nota o monto después.
- `SessionNoteModal`: campo de costo (heredado de la cita, editable) + notas clínicas, con **dos acciones separadas**: "Solo Guardar Nota" (guarda nota/monto sin tocar `estadoSesion`) y "Guardar y Completar" (además marca `Completada`).
- Botón de eliminar por tarjeta + confirmación — la sesión desaparece al instante del calendario de Citas y de la tabla del Home.

### 9. Reportes (`src/pages/Reportes.jsx`)

Gestor de machotes/plantillas clínicas (consentimientos informados, formatos de evaluación, registros de seguimiento, etc.), con:

- Buscador que filtra por nombre de archivo o descripción.
- Selección múltiple por checkbox; el botón "Exportar" se habilita solo con selección y muestra el contador.
- Edición inline de nombre y descripción (doble clic o botón de lápiz), persistida vía `.map()` sobre el estado local (`useState`).
- Botones de descarga Word/PDF por fila con íconos genéricos propios (no los logotipos oficiales de Microsoft/Adobe, que son marcas registradas).
- Handlers aislados `handleDownloadWord(id, datosActuales)`, `handleDownloadPdf(id, datosActuales)` y `handleBulkExport(arrayDeSeleccionados)` — hoy solo hacen `console.log`, listos para conectar `fs`/`docx`/`pdfkit` de Electron sin tocar la interfaz.

### 10. Logo (`src/components/MenteiosLogo.jsx`)

El árbol de manos + símbolo Ψ y el wordmark "MENTEIOS" están recreados como **SVG inline** (sin `<img>`, sin rutas a archivos externos), ya que no existe todavía el archivo de marca oficial. Esto evita el "ícono roto" cuando falta un asset y garantiza que se vea igual en el navegador y dentro de Electron. Se puede reemplazar por un `<img src={...} />` sin tocar el resto de la app en cuanto exista el archivo real — la API del componente (sus props) no cambia.

### 11. Datos simulados (`src/mockData.js`)

| Export | Forma | Usado por |
|---|---|---|
| `pacientes` | `{ id, nombre, edad, diagnostico, areaTrabajar, planesEjecucion, estado, telefono, costoCita }` | `Pacientes.jsx`, selector de paciente en `CitaFormModal` |
| `citas` | `{ id, pacienteId, pacienteNombre, fecha (ISO), hora, monto, tipoTerapia, telefono, estadoSesion, duracion, notasClinicas }` | Estado inicial de `globalCitas` en `App.jsx` |
| `TIPOS_TERAPIA` | `string[]` | Píldoras de color en `AppointmentsTable`/`Sesiones`, opciones del select en `CitaFormModal` |
| `metricasHome` | `{ reportes }` | Tarjeta "Reportes" del Home (el resto de las métricas se calculan en vivo, no se guardan) |
| `HOY` | `string` (fecha ISO) | Referencia de "hoy" del mock — usada por Home, Citas y Sesiones |

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta solo Vite (para probar en el navegador) |
| `npm run electron:dev` | Levanta Vite **y** Electron juntos (flujo de desarrollo recomendado) |
| `npm run electron` | Abre solo Electron — requiere que `npm run dev` ya esté corriendo en otra terminal |
| `npm run build` | Compila el frontend a `dist/` |
| `npm run electron:build` | Compila el frontend y empaqueta la app de escritorio con electron-builder (carpeta `release/`) |
| `npm run lint` | Corre Oxlint sobre el código |
| `npm run preview` | Sirve el build de `dist/` en el navegador (sin Electron) |

## Cómo correrlo localmente

```bash
npm install
npm run electron:dev
```

Esto instala dependencias, levanta el servidor de Vite y abre la ventana de Electron apuntando a él automáticamente.

## Documentación adicional

`docs/MANUAL_USUARIO.md` (y su versión `.docx`) es el manual dirigido al personal del consultorio — explica cada pantalla en lenguaje no técnico, paso a paso.
