const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const todoRoutes = require('./routes/todos');
const eventRoutes = require('./routes/events');
const focusSessionRoutes = require('./routes/focusSessions');
const todoSetRoutes = require('./routes/todoSets');
const deepseekRoutes = require('./routes/deepseek');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/todos', todoRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/focus-sessions', focusSessionRoutes);
app.use('/api/todo-sets', todoSetRoutes);
app.use('/api/deepseek', deepseekRoutes);

// 健康检查
app.get('/', (req, res) => {
  res.json({ message: 'Todo API is running' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});