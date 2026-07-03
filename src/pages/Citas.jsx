import { useMemo, useState } from 'react'
import Calendar from '../components/Calendar'
import AgendaPanel from '../components/AgendaPanel'
import CitaFormModal from '../components/CitaFormModal'
import ConfirmDeleteCitaModal from '../components/ConfirmDeleteCitaModal'
import { PlusIcon } from '../components/icons/DashboardIcons'
import { HOY } from '../mockData'

export default function Citas({ citas, onAddCita, onDeleteCita }) {
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(5) // Junio
  const [selectedDate, setSelectedDate] = useState(HOY)
  const [showModal, setShowModal] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState(null)

  const citasFechas = useMemo(() => new Set(citas.map((cita) => cita.fecha)), [citas])

  const citasDelDia = useMemo(
    () =>
      citas
        .filter((cita) => cita.fecha === selectedDate)
        .sort((a, b) => a.hora.localeCompare(b.hora)),
    [citas, selectedDate],
  )

  const citaEnConfirmacion = citas.find((cita) => cita.id === appointmentToDelete) ?? null

  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  function handleNuevaCita(datos) {
    onAddCita(datos)
    setShowModal(false)
  }

  function handleConfirmarEliminacion(cita) {
    onDeleteCita(cita.id)
    setAppointmentToDelete(null)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Citas</h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <PlusIcon className="h-4 w-4" />
          Nueva cita
        </button>
      </div>

      <div className="mt-6 flex items-start gap-6">
        <div className="flex-1">
          <Calendar
            year={currentYear}
            month={currentMonth}
            selectedDate={selectedDate}
            citasFechas={citasFechas}
            onSelectDate={setSelectedDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onChangeMonth={setCurrentMonth}
            onChangeYear={setCurrentYear}
          />
        </div>

        <AgendaPanel
          selectedDate={selectedDate}
          citasDelDia={citasDelDia}
          onDeleteCita={(cita) => setAppointmentToDelete(cita.id)}
        />
      </div>

      {showModal && (
        <CitaFormModal
          open
          defaultFecha={selectedDate}
          onClose={() => setShowModal(false)}
          onSubmit={handleNuevaCita}
        />
      )}

      <ConfirmDeleteCitaModal
        open={appointmentToDelete !== null}
        cita={citaEnConfirmacion}
        onCancel={() => setAppointmentToDelete(null)}
        onConfirm={handleConfirmarEliminacion}
      />
    </>
  )
}
