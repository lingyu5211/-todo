import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

interface TodoAttributes {
  id: number;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  targetMinutes: number;
  currentMinutes: number;
  progress: number;
  timeInfo: string;
  todoSetId?: number;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Todo extends Model<TodoAttributes> implements TodoAttributes {
  public id!: number;
  public text!: string;
  public completed!: boolean;
  public priority!: 'high' | 'medium' | 'low';
  public dueDate?: Date;
  public targetMinutes!: number;
  public currentMinutes!: number;
  public progress!: number;
  public timeInfo!: string;
  public todoSetId?: number;
  public userId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Todo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.STRING,
      defaultValue: 'medium',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    targetMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 25,
    },
    currentMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    timeInfo: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    todoSetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'todos',
    timestamps: true,
  }
);

export default Todo;
