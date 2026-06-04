import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import sequelize from './config/db';
import Todo from './models/Todo';
import Event from './models/Event';
import FocusSession from './models/FocusSession';
import TodoSet from './models/TodoSet';
import User from './models/User';
import Room from './models/Room';
import RoomMember from './models/RoomMember';
import Message from './models/Message';
import roomsRouter from './routes/rooms';
import leaderboardRouter from './routes/leaderboard';
import { setupSocketIO } from './socket';
import https from 'https';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

app.use('/api/rooms', roomsRouter);
app.use('/api/leaderboard', leaderboardRouter);

let useDatabase = false;

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: 'user' | 'admin';
  };
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问被拒绝，需要登录' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: '无效的 token' });
    }
    (req as AuthenticatedRequest).user = user;
    next();
  });
};

const initDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync({ force: false });
    await initDefaultUsers();
    await migrateLegacyData();
    useDatabase = true;
  } catch (error: any) {
    console.error('Database connection error:', error.message);
    console.log('Database connection failed, running in mock mode');
    useDatabase = false;
  }
};

const initDefaultUsers = async (): Promise<void> => {
  const existingUser = await User.findOne({ where: { username: 'user' } });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.create({
      username: 'user',
      password: hashedPassword,
      role: 'user',
      name: '嗨寻',
      email: 'user@example.com',
      motto: '钱是第一驱动力',
      totalFocusDays: 14,
      consecutiveFocusDays: 1,
      avatar: '🌙',
    } as any);
    console.log('Default user created');
  }

  const existingAdmin = await User.findOne({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      name: '管理员',
      email: 'admin@example.com',
      motto: '管理是一种责任',
      totalFocusDays: 30,
      consecutiveFocusDays: 7,
      avatar: '👑',
    } as any);
    console.log('Default admin created');
  }
};

const migrateLegacyData = async (): Promise<void> => {
  const admin = await User.findOne({ where: { username: 'admin' } });
  if (!admin) return;

  const adminId = admin.id;

  const todosWithoutUser = await Todo.findAll({ where: { userId: null as any } });
  if (todosWithoutUser.length > 0) {
    for (const todo of todosWithoutUser) {
      await todo.update({ userId: adminId });
    }
    console.log(`Migrated ${todosWithoutUser.length} todos to admin`);
  }

  const eventsWithoutUser = await Event.findAll({ where: { userId: null as any } });
  if (eventsWithoutUser.length > 0) {
    for (const event of eventsWithoutUser) {
      await event.update({ userId: adminId });
    }
    console.log(`Migrated ${eventsWithoutUser.length} events to admin`);
  }

  const sessionsWithoutUser = await FocusSession.findAll({ where: { userId: null as any } });
  if (sessionsWithoutUser.length > 0) {
    for (const session of sessionsWithoutUser) {
      await session.update({ userId: adminId });
    }
    console.log(`Migrated ${sessionsWithoutUser.length} focus sessions to admin`);
  }

  const setsWithoutUser = await TodoSet.findAll({ where: { userId: null as any } });
  if (setsWithoutUser.length > 0) {
    for (const set of setsWithoutUser) {
      await set.update({ userId: adminId });
    }
    console.log(`Migrated ${setsWithoutUser.length} todo sets to admin`);
  }
};

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  if (useDatabase) {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        motto: user.motto,
        totalFocusDays: user.totalFocusDays,
        consecutiveFocusDays: user.consecutiveFocusDays,
        avatar: user.avatar,
        token,
      });
      return;
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  if (username === 'user' && password === '123456') {
    const token = jwt.sign({ id: 1, username: 'user', role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      id: 1,
      username: 'user',
      role: 'user',
      name: '嗨寻',
      email: 'user@example.com',
      motto: '钱是第一驱动力',
      totalFocusDays: 14,
      consecutiveFocusDays: 1,
      avatar: '🌙',
      token,
    });
  } else if (username === 'admin' && password === '123456') {
    const token = jwt.sign({ id: 2, username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      id: 2,
      username: 'admin',
      role: 'admin',
      name: '管理员',
      email: 'admin@example.com',
      motto: '管理是一种责任',
      totalFocusDays: 30,
      consecutiveFocusDays: 7,
      avatar: '👑',
      token,
    });
  } else {
    res.status(401).json({ error: '用户名或密码错误' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { username, password, name, email } = req.body;

  if (!username || !password || !name || !email) {
    return res.status(400).json({ error: '所有字段都是必填的' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度不能少于6位' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }

  if (useDatabase) {
    try {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(409).json({ error: '用户名已存在' });
      }

      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ error: '邮箱已被注册' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        password: hashedPassword,
        role: 'user',
        name,
        email,
        motto: '',
        totalFocusDays: 0,
        consecutiveFocusDays: 0,
        avatar: '👤',
      } as any);

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        motto: user.motto,
        totalFocusDays: user.totalFocusDays,
        consecutiveFocusDays: user.consecutiveFocusDays,
        avatar: user.avatar,
        token,
      });
      return;
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({ error: '注册失败，请稍后重试' });
    }
  }

  res.status(503).json({ error: '数据库不可用，无法注册' });
});

app.post('/api/auth/logout', authenticateToken, (req: Request, res: Response) => {
  res.json({ success: true });
});

app.get('/api/user/info', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  
  if (useDatabase && user) {
    try {
      const dbUser = await User.findByPk(user.id);
      if (dbUser) {
        res.json({
          name: dbUser.name,
          motto: dbUser.motto,
          totalFocusDays: dbUser.totalFocusDays,
          consecutiveFocusDays: dbUser.consecutiveFocusDays,
          avatar: dbUser.avatar,
        });
        return;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }

  res.json({
    name: user?.username === 'admin' ? '管理员' : '嗨寻',
    motto: user?.username === 'admin' ? '管理是一种责任' : '钱是第一驱动力',
    totalFocusDays: user?.username === 'admin' ? 30 : 14,
    consecutiveFocusDays: user?.username === 'admin' ? 7 : 1,
    avatar: user?.username === 'admin' ? '👑' : '🌙',
  });
});

app.patch('/api/user/info', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  
  if (useDatabase && user) {
    try {
      const { name, motto, avatar } = req.body;
      await User.update(
        { ...(name && { name }), ...(motto && { motto }), ...(avatar && { avatar }) },
        { where: { id: user.id } }
      );
      const updatedUser = await User.findByPk(user.id);
      if (updatedUser) {
        res.json({
          name: updatedUser.name,
          motto: updatedUser.motto,
          avatar: updatedUser.avatar,
        });
        return;
      }
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  }

  res.json({ ...req.body });
});

app.get('/api/user/theme', authenticateToken, (req: Request, res: Response) => {
  res.json({ id: 1, color: '#409EFF' });
});

app.post('/api/user/theme', authenticateToken, (req: Request, res: Response) => {
  res.json(req.body);
});

app.get('/api/todos', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  
  if (useDatabase && user) {
    try {
      const todos = await Todo.findAll({ 
        where: { userId: user.id },
        order: [['createdAt', 'DESC']] 
      });
      res.json(todos);
      return;
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }

  res.json([
    { id: 1, text: '完成项目文档', completed: false, priority: 'high', createdAt: new Date(), targetMinutes: 25, currentMinutes: 0, progress: 0, timeInfo: '' },
    { id: 2, text: '学习TypeScript', completed: true, priority: 'medium', createdAt: new Date(), targetMinutes: 50, currentMinutes: 50, progress: 100, timeInfo: '' },
  ]);
});

app.post('/api/todos', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { text, completed = false, priority = 'medium', dueDate, todoSetId, targetMinutes, currentMinutes, progress, timeInfo } = req.body;

  if (useDatabase && user) {
    try {
      const todo = await Todo.create({
        text,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        todoSetId,
        userId: user.id,
        targetMinutes: targetMinutes ?? 25,
        currentMinutes: currentMinutes ?? 0,
        progress: progress ?? 0,
        timeInfo: timeInfo || '',
      } as any);
      res.json(todo);
      return;
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  }

  res.json({
    id: Date.now(),
    text,
    completed,
    priority,
    createdAt: new Date(),
    targetMinutes: 25,
    currentMinutes: 0,
    progress: 0,
    timeInfo: ''
  });
});

app.patch('/api/todos/:id', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = parseInt(req.params.id as string, 10);

  if (useDatabase && user) {
    try {
      const { text, completed, priority, dueDate, currentMinutes, progress } = req.body;
      await Todo.update(
        {
          ...(text && { text }),
          ...(completed !== undefined && { completed }),
          ...(priority && { priority }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
          ...(currentMinutes !== undefined && { currentMinutes }),
          ...(progress !== undefined && { progress }),
        },
        { where: { id, userId: user.id } }
      );
      const todo = await Todo.findOne({ where: { id, userId: user.id } });
      res.json(todo);
      return;
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  res.json({ id, ...req.body });
});

app.delete('/api/todos/:id', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = parseInt(req.params.id as string, 10);

  if (useDatabase && user) {
    try {
      await Todo.destroy({ where: { id, userId: user.id } });
      res.json({ success: true, id });
      return;
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  res.json({ success: true, id });
});

app.get('/api/events', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;

  if (useDatabase && user) {
    try {
      const events = await Event.findAll({ 
        where: { userId: user.id },
        order: [['start', 'ASC']] 
      });
      res.json(events);
      return;
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  res.json([
    { id: 1, title: '项目会议', start: '2026-04-10T09:00:00', end: '2026-04-10T10:00:00', allDay: false, color: '#409EFF' },
    { id: 2, title: '健身', start: '2026-04-10T18:00:00', end: '2026-04-10T19:00:00', allDay: false, color: '#67C23A' },
    { id: 3, title: '生日聚会', start: '2026-04-15', end: '2026-04-15', allDay: true, color: '#F56C6C' },
  ]);
});

app.post('/api/events', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { title, start, end, allDay = false, color = '#409EFF' } = req.body;

  if (useDatabase && user) {
    try {
      const event = await Event.create({ title, start, end, allDay, color, userId: user.id } as any);
      res.json(event);
      return;
    } catch (error) {
      console.error('Error creating event:', error);
    }
  }

  res.json({ id: Date.now(), title, start, end, allDay, color });
});

app.delete('/api/events/:id', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = parseInt(req.params.id as string, 10);

  if (useDatabase && user) {
    try {
      await Event.destroy({ where: { id, userId: user.id } });
      res.json({ success: true, id });
      return;
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }

  res.json({ success: true, id });
});

app.get('/api/focus-sessions', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;

  if (useDatabase && user) {
    try {
      const sessions = await FocusSession.findAll({ 
        where: { userId: user.id },
        order: [['createdAt', 'DESC']] 
      });
      res.json(sessions);
      return;
    } catch (error) {
      console.error('Error fetching focus sessions:', error);
    }
  }

  res.json([]);
});

app.post('/api/focus-sessions', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { todoId, duration, date, startTime, endTime } = req.body;

  if (useDatabase && user) {
    try {
      const session = await FocusSession.create({ todoId, duration, date, startTime, endTime, userId: user.id } as any);
      res.json(session);
      return;
    } catch (error) {
      console.error('Error creating focus session:', error);
    }
  }

  res.json({ id: Date.now(), todoId, duration, date, startTime, endTime });
});

app.get('/api/focus-sessions/stats', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;

  if (useDatabase && user) {
    try {
      const sessions = await FocusSession.findAll({ where: { userId: user.id } });
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum: number, s: FocusSession) => sum + s.duration, 0);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSessions = sessions.filter((s: FocusSession) => new Date(s.startTime) >= thirtyDaysAgo);
      const recentMinutes = recentSessions.reduce((sum: number, s: FocusSession) => sum + s.duration, 0);
      const avgMinutes = Math.round(recentMinutes / 30);

      const today = new Date().toISOString().split('T')[0];
      const todaySessions = sessions.filter((s: FocusSession) => s.date === today);
      const todayMinutes = todaySessions.reduce((sum: number, s: FocusSession) => sum + s.duration, 0);

      // sessionsByDate aggregation
      const sessionsByDateMap: Record<string, { date: string; sessions: number; minutes: number }> = {};
      for (const s of sessions) {
        const d = s.date;
        if (!sessionsByDateMap[d]) {
          sessionsByDateMap[d] = { date: d, sessions: 0, minutes: 0 };
        }
        sessionsByDateMap[d].sessions++;
        sessionsByDateMap[d].minutes += s.duration;
      }
      const sessionsByDate = Object.values(sessionsByDateMap);

      // focusByCategory: join focus_sessions → todos → todo_sets
      const focusByCategory: Record<string, number> = {};
      let unassignedMinutes = 0;
      for (const s of sessions) {
        let categorized = false;
        if (s.todoId) {
          const todo = await Todo.findByPk(s.todoId);
          if (todo && (todo as any).todoSetId) {
            const todoSet = await TodoSet.findByPk((todo as any).todoSetId);
            if (todoSet) {
              const name = todoSet.name;
              focusByCategory[name] = (focusByCategory[name] || 0) + s.duration;
              categorized = true;
            }
          }
        }
        if (!categorized) {
          unassignedMinutes += s.duration;
        }
      }
      if (unassignedMinutes > 0) {
        focusByCategory['未分类'] = (focusByCategory['未分类'] || 0) + unassignedMinutes;
      }

      res.json({
        totalSessions,
        totalMinutes,
        avgMinutes,
        todaySessions: todaySessions.length,
        todayMinutes,
        sessionsByDate,
        focusByCategory,
      });
      return;
    } catch (error) {
      console.error('Error fetching focus stats:', error);
    }
  }

  res.json({
    totalSessions: 0,
    totalMinutes: 0,
    avgMinutes: 0,
    todaySessions: 0,
    todayMinutes: 0,
    sessionsByDate: [],
    focusByCategory: {},
  });
});

app.get('/api/todo-sets', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;

  if (useDatabase && user) {
    try {
      const sets = await TodoSet.findAll({ 
        where: { userId: user.id },
        order: [['createdAt', 'DESC']] 
      });
      res.json(sets);
      return;
    } catch (error) {
      console.error('Error fetching todo sets:', error);
    }
  }

  res.json([{ id: 1, name: '实习', description: '实习相关任务' }]);
});

app.post('/api/todo-sets', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { name, description = '' } = req.body;

  if (useDatabase && user) {
    try {
      const set = await TodoSet.create({ name, description, userId: user.id } as any);
      res.json(set);
      return;
    } catch (error) {
      console.error('Error creating todo set:', error);
    }
  }

  res.json({ id: Date.now(), name, description });
});

app.patch('/api/todo-sets/:id', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = parseInt(req.params.id as string, 10);

  if (useDatabase && user) {
    try {
      const { name, description } = req.body;
      await TodoSet.update(
        { ...(name && { name }), ...(description !== undefined && { description }) },
        { where: { id, userId: user.id } }
      );
      const set = await TodoSet.findOne({ where: { id, userId: user.id } });
      res.json(set);
      return;
    } catch (error) {
      console.error('Error updating todo set:', error);
    }
  }

  res.json({ id, ...req.body });
});

app.delete('/api/todo-sets/:id', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = parseInt(req.params.id as string, 10);

  if (useDatabase && user) {
    try {
      await TodoSet.destroy({ where: { id, userId: user.id } });
      res.json({ message: 'Todo set deleted successfully' });
      return;
    } catch (error) {
      console.error('Error deleting todo set:', error);
    }
  }

  res.json({ message: 'Todo set deleted successfully' });
});

app.post('/api/deepseek/analyze-todo-set', authenticateToken, async (req: Request, res: Response) => {
  const { todoSetName, description } = req.body;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

  if (!apiKey) {
    return res.json({
      tasks: [
        { title: '子任务1', description: '完成第一个子任务', estimatedMinutes: 30, priority: 'high' },
        { title: '子任务2', description: '完成第二个子任务', estimatedMinutes: 25, priority: 'medium' },
        { title: '子任务3', description: '完成第三个子任务', estimatedMinutes: 20, priority: 'low' }
      ]
    });
  }

  const prompt = `分析以下待办集，生成具体的子任务和时间估计：\n\n待办集名称：${todoSetName}\n描述：${description}\n\n请以JSON格式返回，包含tasks数组，每个任务包含title(任务标题)、description(任务描述)、estimatedMinutes(预估分钟数)、priority(优先级：high/medium/low)。`;

  const postData = JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: '你是一个任务规划助手，请严格按照JSON格式输出结果，不要包含其他文字。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise<void>((resolve) => {
    const request = https.request(apiUrl, options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          const content = result.choices?.[0]?.message?.content;
          if (content) {
            const parsedContent = JSON.parse(content);
            res.json({ tasks: parsedContent.tasks || [] });
          } else {
            res.json({ tasks: [] });
          }
        } catch {
          res.json({ tasks: [] });
        }
        resolve();
      });
    });
    request.on('error', () => {
      res.json({ tasks: [] });
      resolve();
    });
    request.write(postData);
    request.end();
  });
});

initDatabase().then(() => {
  const server = http.createServer(app);
  setupSocketIO(server);
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
