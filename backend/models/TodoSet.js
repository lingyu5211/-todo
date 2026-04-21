const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TodoSet = sequelize.define('TodoSet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'todo_sets',
  timestamps: false
});

module.exports = TodoSet;