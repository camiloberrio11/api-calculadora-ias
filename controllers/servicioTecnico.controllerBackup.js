'use strict'
const { respuestaGenerica, obtenerNumeroSemana, destructurarHora, diferenciaMinutosDosFechas } = require('../utils/general')
const ServicioTecnico = require('../model/ServicioTecnico')
async function validarHorasServicioTecnico (paramsServicio) {
  const { res, fechaCompletaInicio, fechaCompletaFin, idTenico, diaSemana } = paramsServicio
  try {
    let modelService = {}
    modelService.IdServicio = paramsServicio.idServicio
    modelService.NumeroSemana = obtenerNumeroSemana(new Date(paramsServicio.diaServicio))
    modelService.IdTecnico = idTenico
    const minutosCurso = diferenciaMinutosDosFechas(fechaCompletaInicio, fechaCompletaFin)
    // Campos calculados
    const horasDominicalesExtras = await obtenerHorasDominicalesExtras(fechaCompletaInicio, fechaCompletaFin, minutosCurso, diaSemana, idTenico)
    const horasNocturasExtras = await obtenerHorasNocturasExtras(fechaCompletaInicio, fechaCompletaFin, horasDominicalesExtras.nuevosMinutosCurso, diaSemana, idTenico)
    const horasNormalesExtras = await obtenerHorasNormalesExtras(fechaCompletaInicio, fechaCompletaFin, horasNocturasExtras.nuevosMinutosCurso, diaSemana, idTenico)
    const horasDominicales = obtenerHorasDominicales(fechaCompletaInicio, fechaCompletaFin, horasNormalesExtras.nuevosMinutosCurso, diaSemana)
    const horasNocturas = obtenerHorasNocturas(fechaCompletaInicio, fechaCompletaFin, horasDominicales.nuevosMinutosCurso, diaSemana)
    const horasNormales = obtenerHorasNormales(fechaCompletaInicio, fechaCompletaFin, horasNocturas.nuevosMinutosCurso, diaSemana)
    return respuestaGenerica(200, `Se ha guardado el servicio ${paramsServicio.idServicio}`, null, true, res)
  } catch (error) {
    const { message } = error
    return respuestaGenerica(500, null, message, false, res)
  }
}

function obtenerHorasNormales (fechaInicio, fechaFin, minutosEnCurso, diaSemana) {
  let horasTrabadas = 0
  let nuevosMinutosCurso = 0
  const { hora: horaInicio } = destructurarHora(fechaInicio)
  const { hora: horaFin } = destructurarHora(fechaFin)
  if (horaInicio >= 7 && horaFin <= 20 && diaSemana > 0 && diaSemana < 7 && minutosEnCurso > 0) {
    horasTrabadas = minutosEnCurso / 60
    nuevosMinutosCurso = minutosEnCurso - (horasTrabadas * 60)
  }
  return {
    horasNormales: horasTrabadas,
    nuevosMinutosCurso
  }
}

function obtenerHorasNocturas (fechaInicio, fechaFin, minutosEnCurso, diaSemana) {
  let horasTrabadas = 0
  let nuevosMinutosCurso = minutosEnCurso
  const { hora: horaInicio } = destructurarHora(fechaInicio)
  const { hora: horaFin } = destructurarHora(fechaFin)
  if (horaInicio > 20 && horaFin < 7 && diaSemana > 0 && diaSemana < 7 && minutosEnCurso > 0) {
    horasTrabadas = minutosEnCurso / 60
    nuevosMinutosCurso = minutosEnCurso - (horasTrabadas * 60)
  }
  return {
    horasNocturas: horasTrabadas,
    nuevosMinutosCurso
  }
}

function obtenerHorasDominicales (fechaInicio, fechaFin, minutosEnCurso, diaSemana) {
  let horasTrabadas = 0
  let nuevosMinutosCurso = minutosEnCurso
  if (diaSemana === 7 && minutosEnCurso > 0) {
    horasTrabadas = minutosEnCurso / 60
    nuevosMinutosCurso = minutosEnCurso - (horasTrabadas * 60)
  }
  return {
    horasDominicales: horasTrabadas,
    nuevosMinutosCurso
  }
}

async function obtenerHorasNormalesExtras (fechaInicio, fechaFin, minutosEnCurso, diaSemana, idTecnico) {
  let horasTrabadas = 0
  let nuevosMinutosCurso = minutosEnCurso
  const { hora: horaInicio } = destructurarHora(fechaInicio)
  const { hora: horaFin } = destructurarHora(fechaFin)
  if (diaSemana > 0 && diaSemana < 7 && horaInicio >= 7 && horaFin <= 20 && minutosEnCurso > 0) {
    const existeSemana = await calcularHorasTotalXSemanaXIdTecnico(diaSemana, idTecnico)
    if (existeSemana) {
      horasTrabadas = minutosEnCurso / 60
      nuevosMinutosCurso = minutosEnCurso - (horasTrabadas * 60)
    }
  }
  return {
    horasNormalesExtras: horasTrabadas,
    nuevosMinutosCurso
  }
}

async function obtenerHorasNocturasExtras (fechaInicio, fechaFin, minutosEnCurso, diaSemana, idTecnico) {
  let horasTrabadas = 0
  let nuevosMinutosCurso = minutosEnCurso
  const { hora: horaInicio } = destructurarHora(fechaInicio)
  const { hora: horaFin } = destructurarHora(fechaFin)
  if (diaSemana > 0 && diaSemana < 7 && horaInicio > 20 && horaFin < 7 && minutosEnCurso > 0) {
    const existeSemana = await calcularHorasTotalXSemanaXIdTecnico(diaSemana, idTecnico)
    if (existeSemana) {
      horasTrabadas = minutosEnCurso / 60
      nuevosMinutosCurso = minutosEnCurso - (horasTrabadas * 60)
    }
  }
  return {
    horasNocturasExtras: horasTrabadas,
    nuevosMinutosCurso
  }
}

async function obtenerHorasDominicalesExtras (fechaInicio, fechaFin, minutosEnCurso, diaSemana, idTecnico) {
  let horasTrabadas = 0
  let nuevosMinutosCurso = minutosEnCurso
  if (diaSemana === 7 && minutosEnCurso > 0) {
    const existeSemana = await calcularHorasTotalXSemanaXIdTecnico(diaSemana, idTecnico)
    if (existeSemana) {
      horasTrabadas = minutosEnCurso / 60
      nuevosMinutosCurso = minutosEnCurso - (horasTrabadas * 60)
    }
  }
  return {
    horasDominicalesExtras: horasTrabadas,
    nuevosMinutosCurso
  }
}

async function calcularHorasTotalXSemanaXIdTecnico (NumeroSemana, IdTecnico) {
  const exist = await ServicioTecnico.findOne({ IdTecnico, NumeroSemana })
  if (exist) {

  }
  return false
}

async function guardarServicio (model) {
  const servicioTecnico = new ServicioTecnico(model)
  await servicioTecnico.save()
}

// async function obtenerHorasPorSemanaIdTecnico (numSemana, idTecnico) {
//   let suma
//   const existeReporte = await ServicioTecnico.findOne({})
//   if (existeReporte) {
//     suma = +existeReporte.HorasNormales + existeReporte.HorasNocturnas + existeReporte + existeReporte.HorasDominicales + existeReporte.HorasNormalesExtras + existeReporte.HorasNocturasExtras + existeReporte.orasDominicalesExtras
//   }
//   return suma
// }

async function obtenerReporteServicioXIdTecnico (paramsServicio) {
  const { res, idtecnico, numsemana } = paramsServicio
  try {
    const existeServicio = await ServicioTecnico.findOne({ NumeroSemana: numsemana, IdTecnico: idtecnico })
    // sumar columnas y retornar unico resultado
    return respuestaGenerica(200, existeServicio, null, true, res)
  } catch (error) {
    const { message } = error
    return respuestaGenerica(500, null, message, false, res)
  }
}

module.exports = {
  validarHorasServicioTecnico,
  obtenerReporteServicioXIdTecnico
}
