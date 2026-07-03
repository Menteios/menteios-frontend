import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from './icons/DashboardIcons'
import { MESES, toISODate } from '../utils/date'

const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
const YEARS_RANGE = [2024, 2025, 2026, 2027, 2028]

const SELECT_CLASSES =
  'w-full appearance-none rounded-xl border border-gray-200 py-2.5 pl-4 pr-9 text-sm font-medium text-gray-700 outline-none transition focus:border-brand-500'

function buildCalendarCells(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7
  const trailingCount = totalCells - (firstWeekday + daysInMonth)

  const cells = []

  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inCurrentMonth: false, iso: null })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, inCurrentMonth: true, iso: toISODate(year, month, day) })
  }
  for (let day = 1; day <= trailingCount; day++) {
    cells.push({ day, inCurrentMonth: false, iso: null })
  }

  return cells
}

export default function Calendar({
  year,
  month,
  selectedDate,
  citasFechas,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onChangeMonth,
  onChangeYear,
}) {
  const cells = buildCalendarCells(year, month)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Mes anterior"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-brand-300 hover:text-brand-600"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        <div className="relative flex-1">
          <select
            value={month}
            onChange={(event) => onChangeMonth(Number(event.target.value))}
            className={SELECT_CLASSES}
          >
            {MESES.map((nombre, index) => (
              <option key={nombre} value={index}>
                {nombre}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative w-28 shrink-0">
          <select
            value={year}
            onChange={(event) => onChangeYear(Number(event.target.value))}
            className={SELECT_CLASSES}
          >
            {YEARS_RANGE.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Mes siguiente"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-brand-300 hover:text-brand-600"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-y-2 text-center">
        {DIAS_SEMANA.map((dia) => (
          <span key={dia} className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {dia}
          </span>
        ))}

        {cells.map((cell, index) => {
          if (!cell.inCurrentMonth) {
            return (
              <span key={index} className="py-2.5 text-sm text-gray-300">
                {cell.day}
              </span>
            )
          }

          const isSelected = cell.iso === selectedDate
          const hasCitas = citasFechas.has(cell.iso)

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectDate(cell.iso)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-sm font-medium transition ${
                isSelected ? 'bg-brand-700 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{cell.day}</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hasCitas ? (isSelected ? 'bg-white' : 'bg-brand-600') : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
