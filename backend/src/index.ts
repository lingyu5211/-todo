import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db';
import Todo from './models/Todo';
import Event from './models/Event';
import FocusSession from './models/FocusSession';
import TodoSet from './models/TodoSet';
import https from 'https';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let useDatabase = false;

const initDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync({ force: false });
    useDatabase = true;
  } catch {
    console.log('Database connection failed, running in mock mode');
    useDatabase = false;
  }
};

app.get('/api/user/info', (req: Request, res: Response) => {
  res.json({
    name: '嗨寻',
    motto: '钱是第一驱动力',
    totalFocusDays: 14,
    consecutiveFocusDays: 1,
    avatar: '🌙'
  });
});

app.patch('/api/user/info', (req: Request, res: Response) => {
  res.json({ ...req.body });
});

app.get('/api/user/theme', (req: Request, res: Response) => {
  res.json({ id: 1, color: '#409EFF' });
});

app.post('/api/user/theme', (req: Request, res: Response) => {
  res.json(req.body);
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true });
});

app.get('/api/todos', async (req: Request, res: Response) => {
  if (useDatabase) {
    try {
      const todos = await Todo.findAll({ order: [['createdAt', 'DESC']] });
      res.json(todos);
    } catch {
      returnMockTodos(res);
    }
  } else {
    returnMockTodos(res);
  }
});

function returnMockTodos(res: Response) {
  res.json([
    { id: 1, text: '完成项目文档', completed: false, priority: 'high', createdAt: new Date(), targetMinutes: 25, currentMinutes: 0, progress: 0, timeInfo: '' },
    { id: 2, text: '学习TypeScript', completed: true, priority: 'medium', createdAt: new Date(), targetMinutes: 50, currentMinutes: 50, progress: 100, timeInfo: '' },
  ]);
}

app.post('/api/todos', async (req: Request, res: Response) => {
  const { text, completed = false, priority = 'medium', dueDate, todoSetId } = req.body;
  if (useDatabase) {
    try {
      const todo = await Todo.create({
        text,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        todoSetId,
        targetMinutes: 25,
        currentMinutes: 0,
        progress: 0,
        timeInfo: '',
      } as any);
      res.json(todo);
      return;
    } catch {}
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

app.patch('/api/todos/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (useDatabase) {
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
        { where: { id } }
      );
      const todo = await Todo.findByPk(id);
      res.json(todo);
      return;
    } catch {}
  }
  res.json({ id, ...req.body });
});

app.delete('/api/todos/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (useDatabase) {
    try {
      await Todo.destroy({ where: { id } });
      res.json({ success: true, id });
      return;
    } catch {}
  }
  res.json({ success: true, id });
});

app.get('/api/events', async (req: Request, res: Response) => {
  if (useDatabase) {
    try {
      const events = await Event.findAll({ order: [['start', 'ASC']] });
      res.json(events);
      return;
    } catch {}
  }
  res.json([
    { id: 1, title: '项目会议', start: '2026-04-10T09:00:00', end: '2026-04-10T10:00:00', allDay: false, color: '#409EFF' },
    { id: 2, title: '健身', start: '2026-04-10T18:00:00', end: '2026-04-10T19:00:00', allDay: false, color: '#67C23A' },
    { id: 3, title: '生日聚会', start: '2026-04-15', end: '2026-04-15', allDay: true, color: '#F56C6C' },
  ]);
});

app.post('/api/events', async (req: Request, res: Response) => {
  const { title, start, end, allDay = false, color = '#409EFF' } = req.body;
  if (useDatabase) {
    try {
      const event = await Event.create({ title, start, end, allDay, color } as any);
      res.json(event);
      return;
    } catch {}
  }
  res.json({ id: Date.now(), title, start, end, allDay, color });
});

app.delete('/api/events/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (useDatabase) {
    try {
      await Event.destroy({ where: { id } });
      res.json({ success: true, id });
      return;
    } catch {}
  }
  res.json({ success: true, id });
});

app.get('/api/focus-sessions', async (req: Request, res: Response) => {
  if (useDatabase) {
    try {
      const sessions = await FocusSession.findAll({ order: [['createdAt', 'DESC']] });
      res.json(sessions);
      return;
    } catch {}
  }
  res.json([]);
});

app.post('/api/focus-sessions', async (req: Request, res: Response) => {
  const { todoId, duration, date, startTime, endTime } = req.body;
  if (useDatabase) {
    try {
      const session = await FocusSession.create({ todoId, duration, date, startTime, endTime } as any);
      res.json(session);
      return;
    } catch {}
  }
  res.json({ id: Date.now(), todoId, duration, date, startTime, endTime });
});

app.get('/api/focus-sessions/stats', async (req: Request, res: Response) => {
  if (useDatabase) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sessions = await FocusSession.findAll();
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum: number, s: FocusSession) => sum + s.duration, 0);
      const todaySessions = sessions.filter((s: FocusSession) => new Date(s.date) >= today);
      const todayMinutes = todaySessions.reduce((sum: number, s: FocusSession) => sum + s.duration, 0);
      res.json({
        totalSessions,
        totalMinutes,
        avgMinutes: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
        todaySessions: todaySessions.length,
        todayMinutes,
        weeklySessions: 15,
        weeklyMinutes: 900,
        monthlySessions: 60,
        monthlyMinutes: 3600,
        focusByCategory: { work: 720, study: 360, health: 180 },
        focusByHour: { '9': 120, '10': 180, '11': 90, '14': 150, '15': 180, '16': 120, '19': 180, '20': 120 },
      });
      return;
    } catch {}
  }
  res.json({
    totalSessions: 42,
    totalMinutes: 1260,
    avgMinutes: 30,
    todaySessions: 3,
    todayMinutes: 180,
    weeklySessions: 15,
    weeklyMinutes: 900,
    monthlySessions: 60,
    monthlyMinutes: 3600,
    focusByCategory: { work: 720, study: 360, health: 180 },
    focusByHour: { '9': 120, '10': 180, '11': 90, '14': 150, '15': 180, '16': 120, '19': 180, '20': 120 },
  });
});

app.get('/api/todo-sets', async (req: Request, res: Response) => {
  if (useDatabase) {
    try {
      const sets = await TodoSet.findAll({ order: [['createdAt', 'DESC']] });
      res.json(sets);
      return;
    } catch {}
  }
  res.json([{ id: 1, name: '实习', description: '实习相关任务' }]);
});

app.post('/api/todo-sets', async (req: Request, res: Response) => {
  const { name, description = '' } = req.body;
  if (useDatabase) {
    try {
      const set = await TodoSet.create({ name, description } as any);
      res.json(set);
      return;
    } catch {}
  }
  res.json({ id: Date.now(), name, description });
});

app.patch('/api/todo-sets/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (useDatabase) {
    try {
      const { name, description } = req.body;
      await TodoSet.update(
        { ...(name && { name }), ...(description !== undefined && { description }) },
        { where: { id } }
      );
      const set = await TodoSet.findByPk(id);
      res.json(set);
      return;
    } catch {}
  }
  res.json({ id, ...req.body });
});

app.delete('/api/todo-sets/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (useDatabase) {
    try {
      await TodoSet.destroy({ where: { id } });
      res.json({ message: 'Todo set deleted successfully' });
      return;
    } catch {}
  }
  res.json({ message: 'Todo set deleted successfully' });
});

app.post('/api/deepseek/analyze-todo-set', async (req: Request, res: Response) => {
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
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
