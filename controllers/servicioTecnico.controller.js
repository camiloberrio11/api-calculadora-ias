'use strict'
const { respuestaGenerica, obtenerDiaSemana, obtenerNumeroSemana, destructurarHora, diferenciaMinutosDosFechas } = require('../utils/general')
const ServicioTecnico = require('../model/ServicioTecnico')
async function validarHorasServicioTecnico (params) {
  const { res, idTenico, idServicio, fechaCompletaInicio, fechaCompletaFin } = params
  try {
    const numSemana = obtenerNumeroSemana(fechaCompletaInicio)
    const minutosDelServicio = diferenciaMinutosDosFechas(fechaCompletaInicio, fechaCompletaFin)
    const obtenerNormalesExtras = await obtenerHorasNormalesExtras(numSemana, idTenico, fechaCompletaInicio, fechaCompletaFin, minutosDelServicio)
    const obtenerNocturasExtras = await obtenerHorasNocturasExtras(numSemana, idTenico, obtenerNormalesExtras.fechaInicio, fechaCompletaFin, obtenerNormalesExtras.minutosCurso)
    const obtenerDominicalesExtras = await obtenerHorasDominicalesExtras(numSemana, idTenico, obtenerNocturasExtras.fechaInicio, fechaCompletaFin, obtenerNocturasExtras.minutosCurso)
    const obtenerNormales = await obtenerHorasNormales(obtenerDominicalesExtras.fechaInicio, fechaCompletaFin, obtenerDominicalesExtras.minutosCurso)
    const obtenerNocturas = await obtenerHorasNocturas(numSemana, idTenico, obtenerNormales.fechaInicio, fechaCompletaFin, obtenerNormales.minutosCurso)
    const obtenerDomingos = await obtenerDominicales(numSemana, idTenico, obtenerNocturas.fechaInicio, fechaCompletaFin, obtenerNocturas.minutosCurso)
    const modelService = {
      IdServicio: idServicio,
      NumeroSemana: numSemana,
      IdTecnico: idTenico,
      HorasNormales: obtenerNormales.horasTrabajadas,
      HorasNocturnas: obtenerNocturas.horasTrabajadas,
      HorasDominicales: obtenerDomingos.horasTrabajadas,
      HorasNormalesExtras: obtenerNormalesExtras.horasTrabajadas,
      HorasNocturasExtras: obtenerNocturasExtras.horasTrabajadas,
      HorasDominicalesExtras: obtenerDominicalesExtras.horasTrabajadas
    }
    const nuevoServicio = new ServicioTecnico(modelService)
    await nuevoServicio.save()
    return respuestaGenerica(200, `Se ha guardado el servicio ${idServicio}`, null, true, res)
  } catch (error) {
    const { message } = error
    return respuestaGenerica(500, null, message, false, res)
  }
}

async function obtenerHorasNormalesExtras (numSemana, idTecnico, fechaInicio, fechaFin, minutosCurso) {
  const diaServicio = obtenerDiaSemana(fechaInicio)
  let horasTrabajadas = 0
  const { hora: horaInicio } = destructurarHora(fechaInicio)
  const sumaTotal = await sumaHorasPorIdTecnicoNumSemana(idTecnico, numSemana)
  if (sumaTotal >= 48) {
    if (minutosCurso > 0 && diaServicio > 0 && diaServicio < 7 && horaInicio >= 7 && horaInicio <= 20) {
      const [fechaSet] = fechaInicio.split('T')
      let diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, `${fechaSet}T20:00:00.000Z`)
      if (minutosCurso > diferenciaDiaInicio) {
        fechaInicio = `${fechaSet}T20:00:00.000Z`
      } else {
        diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
      }
      horasTrabajadas = diferenciaDiaInicio / 60
      minutosCurso = minutosCurso - diferenciaDiaInicio
    }
  }
  return {
    horasTrabajadas,
    minutosCurso,
    fechaInicio
  }
}

async function obtenerHorasNocturasExtras (numSemana, idTecnico, fechaInicio, fechaFin, minutosCurso) {
  const diaServicioInicio = obtenerDiaSemana(fechaInicio)
  const diaServicioFin = obtenerDiaSemana(fechaFin)
  let horasTrabajadas = 0
  const { hora: horaInicio } = destructurarHora(fechaInicio)
  const sumaTotal = await sumaHorasPorIdTecnicoNumSemana(idTecnico, numSemana)
  if (sumaTotal >= 48) {
    if (minutosCurso > 0 && (diaServicioInicio > 0 || diaServicioInicio < 7 || diaServicioFin < 7) && (horaInicio >= 20 || horaInicio <= 7)) {
      const [fechaSet] = fechaFin.split('T')
      let diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, `${fechaSet}T07:00:00.000Z`)
      if (diferenciaDiaInicio < 0) {
        diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
      }
      if (minutosCurso > diferenciaDiaInicio) {
        fechaInicio = `${fechaSet}T07:00:00.000Z`
      } else {
        diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
      }
      horasTrabajadas = diferenciaDiaInicio / 60
      minutosCurso = minutosCurso - diferenciaDiaInicio
    }
  }
  return {
    horasTrabajadas,
    minutosCurso,
    fechaInicio
  }
}

async function obtenerHorasDominicalesExtras (numSemana, idTecnico, fechaInicio, fechaFin, minutosCurso) {
  const diaServicioInicio = obtenerDiaSemana(fechaInicio)
  const diaServicioFin = obtenerDiaSemana(fechaFin)
  let horasTrabajadas = 0
  const sumaTotal = await sumaHorasPorIdTecnicoNumSemana(idTecnico, numSemana)
  if (sumaTotal >= 48) {
    if (minutosCurso > 0 && (diaServicioInicio === 0 || diaServicioFin === 0)) {
      const [fechaSet] = fechaFin.split('T')
      let diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, `${fechaSet}T23:59:00.000Z`)
      if (diferenciaDiaInicio < 0) {
        diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
      }
      if (minutosCurso > diferenciaDiaInicio) {
        fechaInicio = `${fechaSet}T07:00:00.000Z`
      } else {
        diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
      }
      horasTrabajadas = diferenciaDiaInicio / 60
      minutosCurso = minutosCurso - diferenciaDiaInicio
    }
  }
  return {
    horasTrabajadas,
    minutosCurso,
    fechaInicio
  }
}

async function obtenerHorasNormales (fechaInicio, fechaFin, minutosCurso) {
  const diaServicio = obtenerDiaSemana(fechaInicio)
  let horasTrabajadas = 0
  const { hora: horaInicio } = destructurarHora(fechaInicio)
  if (minutosCurso > 0 && diaServicio > 0 && diaServicio < 7 && horaInicio >= 7 && horaInicio <= 20) {
    const [fechaSet] = fechaInicio.split('T')
    let diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, `${fechaSet}T20:00:00.000Z`)
    if (minutosCurso > diferenciaDiaInicio) {
      fechaInicio = `${fechaSet}T20:00:00.000Z`
    } else {
      diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
    }
    horasTrabajadas = diferenciaDiaInicio / 60
    minutosCurso = minutosCurso - diferenciaDiaInicio
  }
  return {
    horasTrabajadas,
    minutosCurso,
    fechaInicio
  }
}

async function obtenerHorasNocturas (numSemana, idTecnico, fechaInicio, fechaFin, minutosCurso) {
  const diaServicioInicio = obtenerDiaSemana(fechaInicio)
  const diaServicioFin = obtenerDiaSemana(fechaFin)
  let horasTrabajadas = 0
  const { hora: horaInicio } = destructurarHora(fechaInicio)
  if (minutosCurso > 0 && (diaServicioInicio > 0 || diaServicioInicio < 7 || diaServicioFin < 7) && (horaInicio >= 20 || horaInicio <= 7)) {
    const [fechaSet] = fechaFin.split('T')
    let diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, `${fechaSet}T07:00:00.000Z`)
    if (diferenciaDiaInicio < 0) {
      diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
    }
    if (minutosCurso > diferenciaDiaInicio) {
      fechaInicio = `${fechaSet}T07:00:00.000Z`
    } else {
      diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
    }
    horasTrabajadas = diferenciaDiaInicio / 60
    minutosCurso = minutosCurso - diferenciaDiaInicio
  }
  return {
    horasTrabajadas,
    minutosCurso,
    fechaInicio
  }
}

function obtenerDominicales (numSemana, idTecnico, fechaInicio, fechaFin, minutosCurso) {
  const diaServicioInicio = obtenerDiaSemana(fechaInicio)
  const diaServicioFin = obtenerDiaSemana(fechaFin)
  let horasTrabajadas = 0
  if (minutosCurso > 0 && (diaServicioInicio === 0 || diaServicioFin === 0)) {
    const [fechaSet] = fechaFin.split('T')
    let diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, `${fechaSet}T23:59:00.000Z`)
    if (diferenciaDiaInicio < 0) {
      diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
    }
    if (minutosCurso > diferenciaDiaInicio) {
      fechaInicio = `${fechaSet}T07:00:00.000Z`
    } else {
      diferenciaDiaInicio = diferenciaMinutosDosFechas(fechaInicio, fechaFin)
    }
    horasTrabajadas = diferenciaDiaInicio / 60
    minutosCurso = minutosCurso - diferenciaDiaInicio
  }
  return {
    horasTrabajadas,
    minutosCurso,
    fechaInicio
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
    let horasNormales = 0
    let horasNocturas = 0
    let horasDominicales = 0
    let horasNormalesExtras = 0
    let horasNocturasExtras = 0
    let horasDominicalesExtras = 0
    for (const item of listadoServicios) {
      horasNormales = horasNormales + item.HorasNormales
      horasNocturas = horasNocturas + item.HorasNocturnas
      horasDominicales = horasDominicales + item.HorasDominicales
      horasNormalesExtras = horasNormalesExtras + item.HorasNormalesExtras
      horasNocturasExtras = horasNocturasExtras + item.HorasNocturasExtras
      horasDominicalesExtras = horasDominicalesExtras + item.HorasDominicalesExtras
    }
    const list = [
      {
        NumeroSemana: numsemana,
        IdTecnico: idtecnico,
        HorasNormales: horasNormales,
        HorasNocturnas: horasNocturas,
        HorasDominicales: horasDominicales,
        HorasNormalesExtras: horasNormalesExtras,
        HorasNocturasExtras: horasNocturasExtras,
        HorasDominicalesExtras: horasDominicalesExtras
      }
    ]
    return respuestaGenerica(200, list, null, true, res)
  } catch (error) {
    const { message } = error
    return respuestaGenerica(500, null, message, false, res)
  }
}

module.exports = {
  validarHorasServicioTecnico,
  obtenerReporteServicioXIdTecnico
}
