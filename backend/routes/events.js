const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// 获取所有事件
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新事件
router.post('/', async (req, res) => {
  try {
    const newEvent = await Event.create({
      title: req.body.title,
      date: req.body.date,
      time: req.body.time,
      color: req.body.color || '#409EFF',
    });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取单个事件
router.get('/:id', getEvent, (req, res) => {
  res.json(res.event);
});

// 更新事件
router.patch('/:id', getEvent, async (req, res) => {
  try {
    const updatedEvent = await res.event.update({
      title: req.body.title || res.event.title,
      date: req.body.date || res.event.date,
      time: req.body.time || res.event.time,
      color: req.body.color || res.event.color,
    });
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除事件
router.delete('/:id', getEvent, async (req, res) => {
  try {
    await res.event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 中间件：获取单个事件
async function getEvent(req, res, next) {
  let event;
  try {
    event = await Event.findByPk(req.params.id);
    if (event == null) {
      return res.status(404).json({ message: 'Cannot find event' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.event = event;
  next();
}

module.exports = router;