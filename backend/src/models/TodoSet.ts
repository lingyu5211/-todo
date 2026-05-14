import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

interface TodoSetAttributes {
  id: number;
  name: string;
  description: string;
  userId?: number;
}

class TodoSet extends Model<TodoSetAttributes> implements TodoSetAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public userId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TodoSet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'todo_sets',
    timestamps: true,
  }
);

export default TodoSet;
