const sequelize = require('../../connection')

const { Sequelize, DataTypes } = require('sequelize')

const User = sequelize.define('User', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image2: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registration_state: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'processing'
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      unique: false,
      fields: ['nid']
    },
    {
      unique: false,
      fields: ['email']
    },
  ]
})

module.exports = User
