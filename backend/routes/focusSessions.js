const express = require('express');
const router = express.Router();
const FocusSession = require('../models/FocusSession');
const Todo = require('../models/Todo');
const TodoSet = require('../models/TodoSet');

// 获取所有专注记录
router.get('/', async (req, res) => {
  try {
    const sessions = await FocusSession.findAll();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取特定日期的专注记录
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const sessions = await FocusSession.findAll({ where: { date } });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建专注记录
router.post('/', async (req, res) => {
  try {
    const newSession = await FocusSession.create(req.body);
    res.json(newSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    const allSessions = await FocusSession.findAll();

    const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = allSessions.length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSessions = allSessions.filter(s =>
      new Date(s.startTime) >= thirtyDaysAgo
    );
    const recentMinutes = recentSessions.reduce((sum, s) => sum + s.duration, 0);
    const avgMinutes = Math.round(recentMinutes / 30);

    const today = new Date().toISOString().split('T')[0];
    const todaySessions = allSessions.filter(s => s.date === today);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

    // sessionsByDate aggregation
    const sessionsByDateMap = allSessions.reduce((acc, session) => {
      const date = session.date;
      if (!acc[date]) {
        acc[date] = { date, sessions: 0, minutes: 0 };
      }
      acc[date].sessions++;
      acc[date].minutes += session.duration;
      return acc;
    }, {});
    const sessionsByDate = Object.values(sessionsByDateMap);

    // focusByCategory: join focus_sessions → todos → todo_sets
    const focusByCategory = {};
    for (const session of allSessions) {
      if (session.todoId) {
        const todo = await Todo.findByPk(session.todoId);
        if (todo && todo.todoSetId) {
          const todoSet = await TodoSet.findByPk(todo.todoSetId);
          if (todoSet) {
            const name = todoSet.name;
            focusByCategory[name] = (focusByCategory[name] || 0) + session.duration;
          }
        }
      }
    }
    // Unassigned category for sessions without todoSet
    const unassignedMinutes = allSessions
      .filter(s => !s.todoId)
      .reduce((sum, s) => sum + s.duration, 0);
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;