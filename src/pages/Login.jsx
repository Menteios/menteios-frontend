import { useState } from 'react'
import { TreeLogo, MenteiosWordmark } from '../components/MenteiosLogo'

// `onLoginSuccess` viene de App.jsx: al resolver, setea `usuarioActual` en
// el estado global, lo que dispara la carga de pacientes/citas de esa
// cuenta y saca esta pantalla de en medio (App.jsx deja de renderizar
// Login apenas hay un usuario logueado).
export default function Login({ onLoginSuccess, onNavigateToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [recordarme, setRecordarme] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!window.menteiosAPI) {
      setError('Esta pantalla necesita correr dentro de la app de escritorio.')
      return
    }

    setError('')
    setCargando(true)

    const respuesta = await window.menteiosAPI.authLogin(email, password)

    if (respuesta.success) {
      onLoginSuccess(respuesta.user)
      return
    }

    setCargando(false)
    setError(respuesta.error ?? 'No se pudo iniciar sesión.')
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <TreeLogo className="h-28 w-40" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Plataforma gestionada por</span>
            <MenteiosWordmark />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-4">
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-brand-700 placeholder-gray-400 outline-none transition focus:border-brand-500"
            />

            <div className="flex flex-col gap-2">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3.5 text-brand-700 placeholder-gray-400 outline-none transition ${
                  error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'
                }`}
              />

              {error && <p className="px-1 text-sm font-medium text-red-600">{error}</p>}

              <div className="flex justify-end">
                <a href="#" className="text-sm text-brand-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(event) => setRecordarme(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-brand-700"
              />
              Recordarme contraseña
            </label>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-2xl bg-brand-700 py-3.5 font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="font-semibold text-brand-700 hover:underline"
          >
            Crea una
          </button>
        </p>
      </div>
    </div>
  )
}
