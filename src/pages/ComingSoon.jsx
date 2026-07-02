// Clean, self-contained placeholder for sections that don't have a dedicated
// screen yet. Swap for the real page component in PAGE_RENDERERS (src/App.jsx)
// once each section gets built out.
export default function ComingSoon({ title }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-100 bg-white text-center">
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-600">
        Próximamente
      </span>
      <h1 className="text-2xl font-semibold text-gray-900">
        Sección en construcción: {title}
      </h1>
      <p className="max-w-sm text-sm text-gray-400">
        Estamos trabajando en esta pantalla. Vuelve pronto para ver el contenido completo.
      </p>
    </div>
  )
}
