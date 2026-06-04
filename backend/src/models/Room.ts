import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface RoomAttributes {
  id: number;
  name: string;
  description: string;
  topic: string;
  maxMembers: number;
  creatorId: number;
  isPublic: boolean;
}

interface RoomCreationAttributes extends Optional<RoomAttributes, 'id'> {}

class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public topic!: string;
  public maxMembers!: number;
  public creatorId!: number;
  public isPublic!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: '',
    },
    topic: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: '自习',
    },
    maxMembers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'rooms',
    timestamps: true,
  }
);

export default Room;
