import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

interface EventAttributes {
  id: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
}

class Event extends Model<EventAttributes> implements EventAttributes {
  public id!: number;
  public title!: string;
  public start!: string;
  public end!: string;
  public allDay!: boolean;
  public color!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    allDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#409EFF',
    },
  },
  {
    sequelize,
    tableName: 'events',
    timestamps: true,
  }
);

export default Event;
