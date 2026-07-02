import { useState } from 'react'
import { TreeLogo, MenteiosWordmark } from '../components/MenteiosLogo'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [recordarme, setRecordarme] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    // Puro front por ahora: sin llamada a API todavía.
    console.log({ usuario, password, recordarme })
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
              name="usuario"
              placeholder="Usuario"
              autoComplete="username"
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
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
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-brand-700 placeholder-gray-400 outline-none transition focus:border-brand-500"
              />

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
            className="w-full rounded-2xl bg-brand-700 py-3.5 font-medium text-white transition hover:bg-brand-800"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <a href="#" className="font-semibold text-brand-700 hover:underline">
            Crea una
          </a>
        </p>
      </div>
    </div>
  )
}
