/**
 * 数据库连接配置
 * 负责创建MySQL数据库连接并同步数据模型
 */
const { Sequelize } = require('sequelize');

/**
 * 创建数据库（如果不存在）
 * @returns {Promise<void>}
 */
const createDatabase = async () => {
  // 创建临时Sequelize实例，连接到MySQL服务器（不指定具体数据库）
  const tempSequelize = new Sequelize('mysql', 'root', 'npls_lwYH1', {
    host: 'localhost',      // MySQL服务器地址
    dialect: 'mysql',       // 数据库类型
    port: 3306,            // MySQL端口
    logging: console.log,   // 启用日志
    dialectOptions: {
      connectTimeout: 10000 // 连接超时时间（毫秒）
    }
  });

  try {
    // 验证连接
    await tempSequelize.authenticate();
    console.log('Connected to MySQL server');
    
    // 创建数据库（如果不存在）
    await tempSequelize.query('CREATE DATABASE IF NOT EXISTS `todo-app`');
    console.log('Database `todo-app` created or already exists');
    
    // 关闭临时连接
    await tempSequelize.close();
  } catch (error) {
    console.error(`Error creating database: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Sequelize实例
 * 用于与MySQL数据库进行交互
 */
const sequelize = new Sequelize('todo-app', 'root', 'npls_lwYH1', {
  host: 'localhost',      // MySQL服务器地址
  dialect: 'mysql',       // 数据库类型
  port: 3306,            // MySQL端口
  logging: console.log,   // 启用日志
  dialectOptions: {
    connectTimeout: 10000 // 连接超时时间（毫秒）
  }
});

/**
 * 连接数据库并同步模型
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // 先创建数据库
    await createDatabase();
    
    // 连接到数据库
    await sequelize.authenticate();
    console.log('MySQL connected successfully');
    
    // 同步数据库模型（如果表不存在则创建，表结构有变化则更新）
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('请检查MySQL连接配置，确保数据库服务运行且用户名密码正确');
    process.exit(1);
  }
};

module.exports = {
  connectDB,  // 数据库连接函数
  sequelize   // Sequelize实例
};