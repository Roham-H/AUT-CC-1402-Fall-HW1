const config = require('config')
const pg = require('pg')
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(config.DB.URI, {
  dialectModule: pg
})

module.exports = sequelize
