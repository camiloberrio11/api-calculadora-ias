'use strict'
const mongoose = require('mongoose')
require('dotenv').config()
const parametersBDConfig = {
  useNewUrlParser: true,
  poolSize: 5,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}

async function conectarDB () {
  await mongoose.connect(process.env.URLDATABASE, parametersBDConfig)
}

module.exports = {
  conectarDB
}
