# Menteios — Frontend

Aplicación de escritorio de Menteios construida con **Electron + React + Vite + Tailwind CSS**. Es un frontend funcional (sin backend todavía): toda la información vive en `src/mockData.js`, con forma de respuesta de API, lista para reemplazarse por llamadas reales sin tocar los componentes.

Pantallas implementadas: **Login**, **Inicio (Resumen general)**, **Pacientes** y **Citas**.

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
├── electron/
│   ├── main.js                     # Proceso principal de Electron (crea la ventana)
│   └── preload.js                   # Puente reservado para IPC futuro (main ↔ renderer)
├── src/
│   ├── assets/                       # Imágenes estáticas importadas por componentes
│   ├── components/
│   │   ├── icons/
│   │   │   └── DashboardIcons.jsx      # Set de íconos SVG inline (sidebar, acciones, calendario)
│   │   ├── AgendaPanel.jsx             # Panel derecho de Citas: agenda del día seleccionado
│   │   ├── AppointmentsTable.jsx       # Tabla "Próximas citas" (Home)
│   │   ├── Calendar.jsx                # Calendario mensual interactivo (Citas)
│   │   ├── CitaFormModal.jsx           # Modal "Nueva cita"
│   │   ├── ConfirmDeleteCitaModal.jsx  # Modal de confirmación al cancelar una cita
│   │   ├── MenteiosLogo.jsx            # Logo del árbol + wordmark, en SVG inline
│   │   ├── Modal.jsx                   # Wrapper genérico de modal (backdrop + tarjeta blanca)
│   │   ├── PacienteDetailModal.jsx     # Modal de solo lectura (ver paciente)
│   │   ├── PacienteFormModal.jsx       # Modal de formulario (crear/editar paciente)
│   │   ├── Sidebar.jsx                 # Navegación lateral (Inicio, Pacientes, Citas, Sesiones, Reportes)
│   │   ├── SummaryCard.jsx             # Tarjeta de métrica clicable (Home)
│   │   └── Toast.jsx                   # Notificación flotante de confirmación
│   ├── layouts/
│   │   └── DashboardLayout.jsx         # Sidebar + área de contenido, compartido por todas las pantallas post-login
│   ├── pages/
│   │   ├── Citas.jsx                   # Pantalla de Citas (calendario + agenda + alta/baja)
│   │   ├── ComingSoon.jsx              # Placeholder para secciones sin diseñar aún (Sesiones, Reportes)
│   │   ├── Home.jsx                    # Resumen general (dashboard)
│   │   ├── Login.jsx                   # Pantalla de login
│   │   └── Pacientes.jsx               # Pantalla de Pacientes (buscador + CRUD vía modales)
│   ├── utils/
│   │   └── date.js                     # Helpers de fecha (nombres de mes, construcción de ISO date)
│   ├── App.jsx                          # Enrutamiento por estado + fuente de verdad de `citas`
│   ├── main.jsx                          # Monta React en el DOM (#root)
│   ├── mockData.js                        # Datos simulados: pacientes, citas, métricas del Home
│   └── index.css                           # Import de Tailwind + paleta de color de marca
├── index.html                              # HTML raíz que carga src/main.jsx
├── vite.config.js                           # Config de Vite + plugin de Tailwind
└── package.json                              # Scripts, dependencias y config de electron-builder
```

## Cómo funciona

### 1. Electron (`electron/main.js`)

El proceso principal crea una `BrowserWindow` de 1280×820px (mínimo 960×640 — se agrandó desde el tamaño original de 480×760 pensado solo para el Login, ya que el dashboard necesita más espacio horizontal) y decide qué cargar según el modo:

- **Desarrollo** (`app.isPackaged === false`): carga `http://localhost:5173`, es decir, el servidor de Vite corriendo en paralelo. Así tienes Hot Module Reload dentro de la ventana de Electron.
- **Producción** (app empaquetada): carga el `dist/index.html` generado por `vite build`.

La ventana se abre con `contextIsolation: true` y `nodeIntegration: false` (buenas prácticas de seguridad de Electron: el renderer no tiene acceso directo a Node/Electron APIs). `electron/preload.js` es el punto donde, si en el futuro se necesita comunicación entre la ventana y el proceso principal (por ejemplo guardar datos localmente), se expone mediante `contextBridge` — hoy está vacío a propósito.

### 2. Vite + Tailwind (`vite.config.js`, `src/index.css`)

- `vite.config.js` usa `base: './'` para que las rutas de los assets generados en el build sean **relativas**. Esto es necesario porque Electron carga `dist/index.html` con el protocolo `file://`, no `http://`, y las rutas absolutas (`/assets/...`) no resolverían.
- Tailwind v4 no usa `tailwind.config.js`: se activa importando `@import 'tailwindcss'` en `src/index.css`, y la paleta de marca (tonos verde-azulado/teal) se define ahí mismo con un bloque `@theme` (`--color-brand-500` … `--color-brand-800`), que Tailwind convierte automáticamente en utilidades como `bg-brand-700` o `text-brand-600`.

### 3. Enrutamiento y estado compartido (`src/App.jsx`)

No hay un router de verdad (no hace falta con solo estas pantallas): la navegación es un `useState('inicio')` en `App.jsx` que decide qué página renderizar dentro de `DashboardLayout`. `PAGE_RENDERERS` mapea cada id del Sidebar a su pantalla:

```js
const PAGE_RENDERERS = {
  inicio: (ctx) => <Home onNavigate={ctx.navigate} citas={ctx.citas} />,
  pacientes: () => <Pacientes />,
  citas: (ctx) => <Citas citas={ctx.citas} onAddCita={ctx.addCita} onDeleteCita={ctx.deleteCita} />,
  sesiones: () => <ComingSoon title="Sesiones" />,
  reportes: () => <ComingSoon title="Reportes" />,
}
```

Los tabs sin pantalla propia (`sesiones`, `reportes`) caen en `ComingSoon`, nunca en `Home` — así el Sidebar siempre resalta la sección correcta y nunca se ve contenido de otra pantalla por error.

**`citas` vive en `App.jsx`, no en cada pantalla.** Es la única fuente de verdad: tanto `Home` (tabla "Próximas citas" + tarjeta "Citas del día") como `Citas` (calendario + agenda) leen del mismo array, así que crear o cancelar una cita en una pantalla se refleja al instante en la otra, sin recargar ni duplicar estado.

### 4. Login (`src/pages/Login.jsx`)

Componente controlado: `useState` para `usuario`, `password` y `recordarme`. `handleSubmit` hace `event.preventDefault()` y por ahora solo hace `console.log` — no hay backend todavía.

### 5. Inicio / Dashboard (`src/pages/Home.jsx`)

- 4 tarjetas de métricas (`SummaryCard`), clicables: cada una navega a su sección vía `onNavigate(targetTab)`.
- La tarjeta **"Citas del día" se calcula en tiempo real** — `citas.filter((cita) => cita.fecha === HOY).length` — no es un número fijo. `HOY` es una constante exportada desde `mockData.js` que simula "la fecha de hoy" (el mock vive en junio de 2026; se reemplaza por `new Date()` cuando haya backend real).
- La tabla "Próximas citas" ordena el array compartido por `fecha` y `hora` (`ordenarPorFechaYHora`) antes de renderizarlo, así que una cita nueva aparece en su posición cronológica correcta, no al final.

### 6. Pacientes (`src/pages/Pacientes.jsx`)

- Buscador (`searchTerm`) que filtra la lista en tiempo real por `nombre`.
- CRUD completo vía modales: **crear** (`PacienteFormModal` en modo `create`), **editar** (mismo modal, precargado con `initialValues`, con `key` por paciente para forzar reset del formulario al cambiar de paciente) y **ver detalle** (`PacienteDetailModal`, solo lectura).
- Al guardar, se dispara un `Toast` que se autooculta con `setTimeout(3000)`.

### 7. Citas (`src/pages/Citas.jsx`)

- **`Calendar.jsx`**: grid mensual generado 100% en código a partir de `Date` nativo (sin fechas hardcodeadas). Marca con un punto los días que tienen citas (`citasFechas`, un `Set` derivado con `useMemo`), resalta el día seleccionado, y permite navegar de mes/año con flechas o los `<select>` superiores (con wraparound de año en los extremos).
- **`AgendaPanel.jsx`**: lista las citas del día seleccionado (filtradas y ordenadas por hora). Cada fila tiene un botón de eliminar (ícono de basura) que solo aparece al pasar el cursor (`group-hover`).
- **Alta de cita**: `CitaFormModal` — selector de paciente (poblado desde `mockData.pacientes`), fecha, hora y tipo de terapia. El tipo de terapia incluye la opción **"Otro (Especificar...)"**, que revela un input de texto libre con una animación suave (`grid-rows-[0fr]→[1fr]`); el valor final que se guarda es el texto escrito, no la etiqueta del select.
- **Baja de cita**: el ícono de basura no borra directamente — guarda el `id` en `appointmentToDelete` y abre `ConfirmDeleteCitaModal` con el nombre del paciente. Solo se borra (`.filter()` sobre el estado compartido) al confirmar.

### 8. Logo (`src/components/MenteiosLogo.jsx`)

Como no había un archivo de imagen final de la marca, el árbol de manos + símbolo Ψ y el wordmark "MENTEIOS" están recreados como **SVG inline dentro del componente** (sin `<img>`, sin rutas a archivos externos). Esto evita el problema típico de "icono roto" cuando falta un asset, y garantiza que se vea igual en el navegador y dentro de la ventana de Electron. Cuando exista el archivo de marca oficial, se puede reemplazar por un `<img src={...} />` sin tocar el resto de la app (la API del componente — sus props — no cambia).

### 9. Datos simulados (`src/mockData.js`)

| Export | Forma | Usado por |
|---|---|---|
| `pacientes` | `{ id, nombre, edad, diagnostico, areaTrabajar, planesEjecucion, estado }` | `Pacientes.jsx`, selector de paciente en `CitaFormModal` |
| `citas` | `{ id, pacienteId, pacienteNombre, fecha (ISO), hora, monto, tipoTerapia }` | Estado inicial de `citas` en `App.jsx` |
| `TIPOS_TERAPIA` | `string[]` | Píldoras de color en `AppointmentsTable`/`Pacientes`, opciones del select en `CitaFormModal` |
| `metricasHome` | `{ totalPacientes, sesionesEstaSemana, reportes }` | Tarjetas del Home (excepto "Citas del día", que se calcula, no se guarda) |
| `HOY` | `string` (fecha ISO) | Referencia de "hoy" del mock — usada por Home (métrica) y Citas (día seleccionado por defecto) |

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
