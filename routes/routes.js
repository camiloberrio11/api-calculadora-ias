const { Router } = require('express')
const servicioTecnicoService = require('../services/servicioTecnico.services')
const routes = Router()

routes.post('/guardarservicio', servicioTecnicoService.guardarServioTecnico)
routes.get('/reporte/:idtecnico/:numsemana', servicioTecnicoService.obtenerReporteServicio)

module.exports = routes
