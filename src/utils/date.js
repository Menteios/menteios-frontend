export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const MESES_ABREVIADOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

export function toISODate(year, month, day) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

// Formatea una fecha ISO ('2026-06-09') a formato corto ('9 Jun 2026').
export function formatFechaCorta(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day} ${MESES_ABREVIADOS[Number(month) - 1]} ${year}`
}

// Devuelve el rango [lunes, domingo] (fechas ISO) de la semana que contiene
// `isoDate`. Se usa para métricas tipo "citas de esta semana" — recibe
// cualquier fecha de referencia, así que funciona igual con el HOY del mock
// o con `new Date().toISOString().slice(0, 10)` una vez haya backend real.
export function getWeekRange(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`)
  const weekday = date.getDay() // 0 = domingo ... 6 = sábado
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday

  const monday = new Date(date)
  monday.setDate(date.getDate() + diffToMonday)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const toISO = (d) => d.toISOString().slice(0, 10)
  return { start: toISO(monday), end: toISO(sunday) }
}
