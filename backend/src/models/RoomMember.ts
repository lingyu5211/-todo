import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface RoomMemberAttributes {
  id: number;
  roomId: number;
  userId: number;
  isOnline: boolean;
  studyStatus: 'idle' | 'studying' | 'resting';
}

interface RoomMemberCreationAttributes extends Optional<RoomMemberAttributes, 'id'> {}

class RoomMember extends Model<RoomMemberAttributes, RoomMemberCreationAttributes> implements RoomMemberAttributes {
  public id!: number;
  public roomId!: number;
  public userId!: number;
  public isOnline!: boolean;
  public studyStatus!: 'idle' | 'studying' | 'resting';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RoomMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    studyStatus: {
      type: DataTypes.ENUM('idle', 'studying', 'resting'),
      allowNull: false,
      defaultValue: 'idle',
    },
  },
  {
    sequelize,
    tableName: 'room_members',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['roomId', 'userId'] },
    ],
  }
);

export default RoomMember;
