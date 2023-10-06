const express = require('express')
const config = require('config')
const audit = require('express-requests-logger')

const sequelize = require('./utils/db/connection')
const models = require('./utils/db/models')

const register = require('./register')
const registrationInquiry = require('./registration-inquiry')

const { SERVER_SERVICE_PORT: PORT = 3000 } = process.env

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(audit({ doubleAudit: true }))

app.use(function setDefaultBody(req, res, next){
  if (!req.body && req.method === 'POST') req.body = {}
  next()
})

app.use(register)
app.use(registrationInquiry)

app.use(function errorHandler(err, req, res, next) {
  console.log(err)
  if (res.headersSent) return next(err)
  return res.status(err.status || 500).json({ error: res.statusMessage || err.message || 'An Error Occurred' });
})

sequelize.sync({ /* alter: true /*, force: true*/ }).then(function listen() {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
})
