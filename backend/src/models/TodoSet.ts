import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

interface TodoSetAttributes {
  id: number;
  name: string;
  description: string;
}

class TodoSet extends Model<TodoSetAttributes> implements TodoSetAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
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
  },
  {
    sequelize,
    tableName: 'todo_sets',
    timestamps: true,
  }
);

export default TodoSet;
