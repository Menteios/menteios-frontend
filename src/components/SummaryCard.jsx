const BADGE_TONE_STYLES = {
  green: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-sky-50 text-sky-600',
}

export default function SummaryCard({ label, value, badge, badgeTone, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      <span
        className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_TONE_STYLES[badgeTone] ?? 'bg-gray-100 text-gray-600'}`}
      >
        {badge}
      </span>
    </div>
  )
}
