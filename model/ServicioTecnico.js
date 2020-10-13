'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const registroSchema = new Schema({
  IdServicio: {
    unique: true,
    type: String
  },
  NumeroSemana: {
    type: String
  },
  IdTecnico: {
    type: String
  },
  HorasNormales: {
    type: Number
  },
  HorasNocturnas: {
    type: Number
  },
  HorasDominicales: {
    type: Number
  },
  HorasNormalesExtras: {
    type: Number
  },
  HorasNocturasExtras: {
    type: Number
  },
  HorasDominicalesExtras: {
    type: Number
  }
})

module.exports = mongoose.model('ServicioTecnico', registroSchema)