const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FocusSession = sequelize.define('FocusSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  todoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'todos',
      key: 'id'
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false, // 专注时长（分钟）
    defaultValue: 0
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'focus_sessions',
  timestamps: false
});

module.exports = FocusSession;