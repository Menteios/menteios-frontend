export default function Modal({ open, onClose, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-xl`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
