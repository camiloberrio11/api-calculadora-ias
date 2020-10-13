'use strict'
const { respuestaGenerica, obtenerDiaSemana, obtenerNumeroSemana, destructurarHora, diferenciaMinutosDosFechas } = require('../utils/general')
const ServicioTecnico = require('../model/ServicioTecnico')
async function validarHorasServicioTecnico (params) {
  const { res, idTenico, idServicio, fechaCompletaInicio, fechaCompletaFin } = params
  try {
    const numSemana = obtenerNumeroSemana(fechaCompletaInicio)
    const minutosDelServicio = diferenciaMinutosDosFechas(fechaCompletaInicio, fechaCompletaFin)
    const horasNormalesExtras = await obtenerHorasNormalesExtras(numSemana, idTenico, fechaCompletaInicio, fechaCompletaFin, minutosDelServicio)
    const horasNocturasExtras = await obtenerHorasNocturasExtras(numSemana, idTenico, fechaCompletaInicio, fechaCompletaFin, horasNormalesExtras.minutosCurso)
    return respuestaGenerica(200, `Se ha guardado el servicio ${idServicio}`, null, true, res)
  } catch (error) {
    const { message } = error
    return respuestaGenerica(500, null, message, false, res)
  }
}

async function obtenerHorasNormalesExtras (numSemana, idTecnico, fechaInicio, fechaFin, minutosCurso) {
  const diaServicio = obtenerDiaSemana(fechaInicio)
  const { hora: horaInicio } = destructurarHora(fechaInicio)
  const { hora: horaFin } = destructurarHora(fechaFin)
  let horasTrabajadas = 0
  if (diaServicio > 0 && diaServicio < 7 && minutosCurso > 0 && (horaInicio >= 7 && horaInicio <= 20)) {
    const sumaTotal = await sumaHorasPorIdTecnicoNumSemana(idTecnico, numSemana)
    if (sumaTotal > 48) {
      const [fechaSet] = fechaFin.split('T')
      const diferenciaMinutos = diferenciaMinutosDosFechas(fechaInicio, `${fechaSet}T20:00:00.000Z`)
      if (diferenciaMinutos < minutosCurso) {
        horasTrabajadas = diferenciaMinutos / 60
        minutosCurso = minutosCurso - diferenciaMinutos
      } else {
        const diferenciaMinutosFin = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
        horasTrabajadas = diferenciaMinutosFin / 60
        minutosCurso = minutosCurso - diferenciaMinutosFin
      }
    }
  }
  return {
    horasTrabajadas,
    minutosCurso
  }
}

async function obtenerHorasNocturasExtras (numSemana, idTecnico, fechaInicio, fechaFin, minutosCurso) {
  const diaServicio = obtenerDiaSemana(fechaInicio)
  const { hora: horaInicio } = destructurarHora(fechaInicio)
  const { hora: horaFin } = destructurarHora(fechaFin)
  let horasTrabajadas = 0
  if (diaServicio > 0 && diaServicio < 7 && minutosCurso > 0 && (horaInicio > 20 || horaInicio < 7)) {
    const sumaTotal = await sumaHorasPorIdTecnicoNumSemana(idTecnico, numSemana)
    if (sumaTotal > 48) {
      const [fechaSet] = fechaFin.split('T')
      const diferenciaMinutos = diferenciaMinutosDosFechas(fechaInicio, `${fechaSet}T20:00:00.000Z`)
      if (diferenciaMinutos < minutosCurso) {
        horasTrabajadas = diferenciaMinutos / 60
        minutosCurso = minutosCurso - diferenciaMinutos
      } else {
        const diferenciaMinutosFin = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
        horasTrabajadas = diferenciaMinutosFin / 60
        minutosCurso = minutosCurso - diferenciaMinutosFin
      }
    }
  }
  return {
    horasTrabajadas,
    minutosCurso
  }
}
async function sumaHorasPorIdTecnicoNumSemana (idTecnico, numSemana) {
  const existe = await ServicioTecnico.find({ IdTecnico: idTecnico, NumeroSemana: numSemana })
  let sumaTotal = 0
  if (existe.length > 0) {
    for (const item of existe) {
      sumaTotal = sumaTotal + +item.HorasNormales + item.HorasNocturnas + item.HorasDominicales + item.HorasNormalesExtras + item.HorasNocturasExtras + item.HorasDominicalesExtras
    }
  }
  return sumaTotal
}

async function obtenerReporteServicioXIdTecnico (params) {
  const { res, idtecnico, numsemana } = params
  try {
    const listadoServicios = await ServicioTecnico.find({ IdTecnico: idtecnico, NumeroSemana: numsemana }, { _id: false })
    if (listadoServicios.length < 1) {
      return respuestaGenerica(200, `No se han encontrado resultados para la semana ${numsemana}`, null, false, res)
    }
    return respuestaGenerica(200, listadoServicios, null, true, res)
  } catch (error) {
    const { message } = error
    return respuestaGenerica(500, null, message, false, res)
  }
}

module.exports = {
  validarHorasServicioTecnico,
  obtenerReporteServicioXIdTecnico
}
