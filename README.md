# Menteios — Frontend

Aplicación de escritorio de Menteios construida con **Electron + React + Vite + Tailwind CSS**. Esta primera entrega implementa la pantalla de **Login**.

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
│   ├── main.js          # Proceso principal de Electron (crea la ventana)
│   └── preload.js        # Puente reservado para IPC futuro (main ↔ renderer)
├── src/
│   ├── assets/            # Imágenes estáticas importadas por componentes
│   ├── components/
│   │   └── MenteiosLogo.jsx   # Logo del árbol + wordmark, en SVG inline
│   ├── pages/
│   │   └── Login.jsx          # Pantalla de login
│   ├── App.jsx             # Punto de entrada de React, renderiza <Login />
│   ├── main.jsx             # Monta React en el DOM (#root)
│   └── index.css             # Import de Tailwind + paleta de color de marca
├── index.html              # HTML raíz que carga src/main.jsx
├── vite.config.js           # Config de Vite + plugin de Tailwind
└── package.json              # Scripts, dependencias y config de electron-builder
```

## Cómo funciona

### 1. Electron (`electron/main.js`)

El proceso principal crea una `BrowserWindow` de 480×760px (mínimo 420×680) y decide qué cargar según el modo:

- **Desarrollo** (`app.isPackaged === false`): carga `http://localhost:5173`, es decir, el servidor de Vite corriendo en paralelo. Así tienes Hot Module Reload dentro de la ventana de Electron.
- **Producción** (app empaquetada): carga el `dist/index.html` generado por `vite build`.

La ventana se abre con `contextIsolation: true` y `nodeIntegration: false` (buenas prácticas de seguridad de Electron: el renderer no tiene acceso directo a Node/Electron APIs). `electron/preload.js` es el punto donde, si en el futuro se necesita comunicación entre la ventana y el proceso principal (por ejemplo guardar datos localmente), se expone mediante `contextBridge` — hoy está vacío a propósito.

### 2. Vite + Tailwind (`vite.config.js`, `src/index.css`)

- `vite.config.js` usa `base: './'` para que las rutas de los assets generados en el build sean **relativas**. Esto es necesario porque Electron carga `dist/index.html` con el protocolo `file://`, no `http://`, y las rutas absolutas (`/assets/...`) no resolverían.
- Tailwind v4 no usa `tailwind.config.js`: se activa importando `@import 'tailwindcss'` en `src/index.css`, y la paleta de marca (tonos verde-azulado/teal) se define ahí mismo con un bloque `@theme` (`--color-brand-500` … `--color-brand-800`), que Tailwind convierte automáticamente en utilidades como `bg-brand-700` o `text-brand-600`.

### 3. Componente de Login (`src/pages/Login.jsx`)

- Es un componente controlado: `useState` para `usuario`, `password` y `recordarme` (checkbox).
- `handleSubmit` hace `event.preventDefault()` y por ahora solo hace `console.log` de los valores — no hay llamada a backend todavía, ya que este entregable es puro frontend funcional.
- Layout con Tailwind: contenedor `min-h-screen flex flex-col items-center justify-center` para centrar todo vertical y horizontalmente; el bloque de formulario tiene `max-w-sm` para no estirarse en ventanas grandes.

### 4. Logo (`src/components/MenteiosLogo.jsx`)

Como todavía no había un archivo de imagen final de la marca, el árbol de manos + símbolo Ψ y el wordmark "MENTEIOS" están recreados como **SVG inline dentro del componente** (sin `<img>`, sin rutas a archivos externos). Esto evita el problema típico de "icono roto" cuando falta un asset, y garantiza que se vea igual en el navegador y dentro de la ventana de Electron. Cuando exista el archivo de marca oficial, se puede reemplazar por un `<img src={...} />` sin tocar el resto de la app (la API del componente — sus props — no cambia).

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
