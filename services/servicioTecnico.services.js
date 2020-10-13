'use strict'
const servicioTecnicoCtrl = require('../controllers/servicioTecnico.controller')

async function guardarServioTecnico (req, res) {
  const paramsService = { res, ...req.body }
  const statusService = await servicioTecnicoCtrl.validarHorasServicioTecnico(paramsService)
  return statusService
}

async function obtenerReporteServicio (req, res) {
  const paramsService = { res, ...req.params }
  const statusService = await servicioTecnicoCtrl.obtenerReporteServicioXIdTecnico(paramsService)
  return statusService
}

module.exports = {
  guardarServioTecnico,
  obtenerReporteServicio
}
