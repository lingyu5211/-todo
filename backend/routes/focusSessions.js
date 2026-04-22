const express = require('express');
const router = express.Router();
const FocusSession = require('../models/FocusSession');

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
    
    // 计算总专注时间
    const totalMinutes = allSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // 计算总专注次数
    const totalSessions = allSessions.length;
    
    // 计算日均专注时间（假设最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSessions = allSessions.filter(session => 
      new Date(session.startTime) >= thirtyDaysAgo
    );
    const recentMinutes = recentSessions.reduce((sum, session) => sum + session.duration, 0);
    const avgMinutes = Math.round(recentMinutes / 30);
    
    // 计算今日专注时间
    const today = new Date().toISOString().split('T')[0];
    
    // 尝试从date字段中匹配今天的日期
    const todaySessions = allSessions.filter(session => {
      // 直接使用date字段的值进行匹配
      return session.date === today;
    });
    
    let todayMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    
    // 按日期分组，用于前端图表显示
    const sessionsByDate = allSessions.reduce((acc, session) => {
      const date = session.date;
      if (!acc[date]) {
        acc[date] = {
          date: date,
          sessions: 0,
          minutes: 0
        };
      }
      acc[date].sessions++;
      acc[date].minutes += session.duration;
      return acc;
    }, {});
    
    // 转换为数组格式
    const sessionsByDateArray = Object.values(sessionsByDate);
    
    res.json({
      totalSessions,
      totalMinutes,
      avgMinutes,
      todaySessions: todaySessions.length,
      todayMinutes,
      sessionsByDate: sessionsByDateArray
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;