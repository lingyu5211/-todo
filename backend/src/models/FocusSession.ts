import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

interface FocusSessionAttributes {
  id: number;
  todoId?: number;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
}

class FocusSession extends Model<FocusSessionAttributes> implements FocusSessionAttributes {
  public id!: number;
  public todoId?: number;
  public duration!: number;
  public date!: string;
  public startTime!: string;
  public endTime!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FocusSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    todoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'focus_sessions',
    timestamps: true,
  }
);

export default FocusSession;
