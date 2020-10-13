'use strict'
const express = require('express')
const routes = require('./routes/routes')
const app = express()
const cors = require('cors')
const { conectarDB } = require('./database/conexionDb')

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
// Capturas de error no controlado
// Captura de error en promesas
process.on('unhandledRejection', (err, origin) => {
  const { message } = err
  console.log(`Ha ocurrido un error ${message}`)
})
// Captura de error en funciones no controladas
process.on('uncaughtException', (err, origin) => {
  const { message } = err
  console.log(`Ha ocurrido un error ${message}`)
})

// Configuracion rutas
app.get('/', (req, res) => {
  res.send(`
  <div class="center">
      <div class="logo">
          <img width="250" alt="Logo de Api" src="https://res.cloudinary.com/dupegtamn/image/upload/v1599013342/apilogo_yelcfr.png">
      </div>
      <br>
      <div>
          <h4 id="version">Version desplegada: master</h4>
      </div>
  </div>
`)
})
app.use('/api', routes)

// Inicio de servidor
const puerto = process.env.PORT || '8094'
app.listen(puerto, async () => {
  await conectarDB()
  console.log(`Servidor corriendo en el puerto ${puerto}`)
})
