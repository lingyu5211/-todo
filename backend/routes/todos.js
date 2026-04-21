const express = require('express');
const Todo = require('../models/Todo');
const router = express.Router();

// 获取所有待办事项
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.findAll();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新待办事项
router.post('/', async (req, res) => {
  try {
    const newTodo = await Todo.create({
      text: req.body.text,
      completed: req.body.completed || false,
      dueDate: req.body.dueDate,
      priority: req.body.priority || 'medium',
      targetMinutes: req.body.targetMinutes || 60,
      currentMinutes: req.body.currentMinutes || 0,
      progress: req.body.progress || 0,
      timeInfo: req.body.timeInfo || '0/60 分钟',
      todoSetId: req.body.todoSetId || null
    });
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取单个待办事项
router.get('/:id', getTodo, (req, res) => {
  res.json(res.todo);
});

// 更新待办事项
router.patch('/:id', getTodo, async (req, res) => {
  try {
    const updatedTodo = await res.todo.update({
      text: req.body.text || res.todo.text,
      completed: req.body.completed !== undefined ? req.body.completed : res.todo.completed,
      dueDate: req.body.dueDate || res.todo.dueDate,
      priority: req.body.priority || res.todo.priority,
      targetMinutes: req.body.targetMinutes !== undefined ? req.body.targetMinutes : res.todo.targetMinutes,
      currentMinutes: req.body.currentMinutes !== undefined ? req.body.currentMinutes : res.todo.currentMinutes,
      progress: req.body.progress !== undefined ? req.body.progress : res.todo.progress,
      timeInfo: req.body.timeInfo || res.todo.timeInfo,
      todoSetId: req.body.todoSetId !== undefined ? req.body.todoSetId : res.todo.todoSetId
    });
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除待办事项
router.delete('/:id', getTodo, async (req, res) => {
  try {
    await res.todo.destroy();
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 中间件：获取单个待办事项
async function getTodo(req, res, next) {
  let todo;
  try {
    todo = await Todo.findByPk(req.params.id);
    if (todo == null) {
      return res.status(404).json({ message: 'Cannot find todo' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.todo = todo;
  next();
}

module.exports = router;