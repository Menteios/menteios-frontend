import { useState } from 'react'
import { TreeLogo, MenteiosWordmark } from '../components/MenteiosLogo'
import { CheckCircleIcon, CircleIcon } from '../components/icons/DashboardIcons'

// Requisitos de seguridad de la contraseña — acá sí tienen sentido (a
// diferencia de Login, donde solo se verifica contra lo que ya está
// guardado): esto es lo que se le exige a una cuenta NUEVA antes de
// crearla. Cada uno es una función pura sobre el texto, así se reutiliza
// igual para pintar el checklist en vivo y para bloquear el submit — nunca
// se desincronizan entre sí.
const PASSWORD_REQUIREMENTS = [
  { key: 'minLength', label: 'Mínimo 8 caracteres', test: (pw) => pw.length >= 8 },
  { key: 'hasUppercase', label: 'Al menos 1 mayúscula', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'hasNumber', label: 'Al menos 1 número', test: (pw) => /[0-9]/.test(pw) },
  { key: 'hasSymbol', label: 'Al menos 1 signo (ej: ! @ # $ %)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
]

function isPasswordValid(password) {
  return PASSWORD_REQUIREMENTS.every((req) => req.test(password))
}

// `onSignupSuccess` viene de App.jsx: al resolver, setea `usuarioActual`
// directo (auto-login apenas se registra) — a la persona no le hace
// sentido crear la cuenta y que le vuelvan a pedir el mismo email/
// contraseña que acaba de escribir.
export default function Signup({ onSignupSuccess, onNavigateToLogin }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const passwordValida = isPasswordValid(password)
  const mostrarChecklist = passwordFocused || (error && !passwordValida)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!window.menteiosAPI) {
      setError('Esta pantalla necesita correr dentro de la app de escritorio.')
      return
    }

    if (!passwordValida) {
      setError('La contraseña no cumple con los requisitos de seguridad.')
      return
    }

    setError('')
    setCargando(true)

    const respuesta = await window.menteiosAPI.authSignup(nombre, email, password)

    if (respuesta.success) {
      onSignupSuccess(respuesta.user)
      return
    }

    setCargando(false)
    setError(respuesta.error ?? 'No se pudo crear la cuenta.')
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
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              autoComplete="name"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-brand-700 placeholder-gray-400 outline-none transition focus:border-brand-500"
            />

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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className={`w-full rounded-2xl border px-4 py-3.5 text-brand-700 placeholder-gray-400 outline-none transition ${
                  error && !passwordValida ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'
                }`}
              />

              {mostrarChecklist && (
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <ul className="flex flex-col gap-1">
                    {PASSWORD_REQUIREMENTS.map((req) => {
                      const cumplida = req.test(password)
                      return (
                        <li
                          key={req.key}
                          className={`flex items-center gap-2 text-xs ${
                            cumplida ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        >
                          {cumplida ? (
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                          ) : (
                            <CircleIcon className="h-3.5 w-3.5" />
                          )}
                          {req.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {error && <p className="px-1 text-sm font-medium text-red-600">{error}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-2xl bg-brand-700 py-3.5 font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-semibold text-brand-700 hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  )
}
