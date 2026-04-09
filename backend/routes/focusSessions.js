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
    const todaySessions = allSessions.filter(session => session.date === today);
    const todayMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    
    res.json({
      totalSessions,
      totalMinutes,
      avgMinutes,
      todaySessions: todaySessions.length,
      todayMinutes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;