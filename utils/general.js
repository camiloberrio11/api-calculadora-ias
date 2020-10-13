'use strict'
const respuestaGenerica = (estadoHttp, respuestaData, error, exitoso, res) => {
  return res.status(estadoHttp).json({
    Errors: [error],
    Resultado: respuestaData,
    EsExitoso: exitoso
  })
}

const obtenerNumeroSemana = (dateAll) => {
  let [date] = dateAll.split('T')
  date = new Date(date)
  let tdt = new Date(date.valueOf())
  const dayn = (date.getDay() + 6) % 7
  tdt.setDate(tdt.getDate() - dayn + 3)
  const firstThursday = tdt.valueOf()
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

const diferenciaMinutosDosFechas = (fecha1, fecha2) => {
  const startTime = new Date(fecha1)
  const endTime = new Date(fecha2)
  let difference = endTime.getTime() - startTime.getTime()
  difference = Math.round(difference / 60000)
  return difference
}

const nuevaFechaActual = () => {
  const today = new Date()
  let fix = today.setHours(today.getHours() - 5)
  fix = new Date(fix)
  fix = fix.toISOString()
  return fix
}

const destructurarHora = horaTime => {
  const [fecha, horas] = horaTime.split('T')
  const [hora, minutos] = horas.split(':')
  return {
    hora: +hora,
    minutos: +minutos
  }
}

const obtenerDiaSemana = (date) => {
  const newDate = new Date(date)
  return newDate.getDay()
}

const diferenciaDiasFecha = (date1, date2) => {
  const dt1 = new Date(date1)
  const dt2 = new Date(date2)
  return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
}

module.exports = {
  respuestaGenerica,
  obtenerNumeroSemana,
  diferenciaMinutosDosFechas,
  nuevaFechaActual,
  destructurarHora,
  obtenerDiaSemana,
  diferenciaDiasFecha
}
