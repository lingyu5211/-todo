const express = require('express');
const router = express.Router();
const TodoSet = require('../models/TodoSet');

// 中间件：获取待办集
async function getTodoSet(req, res, next) {
  try {
    const todoSet = await TodoSet.findByPk(req.params.id);
    if (todoSet == null) {
      return res.status(404).json({ message: '待办集不存在' });
    }
    res.todoSet = todoSet;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// 获取所有待办集
router.get('/', async (req, res) => {
  try {
    const todoSets = await TodoSet.findAll();
    res.json(todoSets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个待办集
router.get('/:id', getTodoSet, (req, res) => {
  res.json(res.todoSet);
});

// 创建新待办集
router.post('/', async (req, res) => {
  try {
    const newTodoSet = await TodoSet.create({
      name: req.body.name,
      description: req.body.description
    });
    res.status(201).json(newTodoSet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新待办集
router.patch('/:id', getTodoSet, async (req, res) => {
  try {
    const updatedTodoSet = await res.todoSet.update({
      name: req.body.name || res.todoSet.name,
      description: req.body.description || res.todoSet.description
    });
    res.json(updatedTodoSet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除待办集
router.delete('/:id', getTodoSet, async (req, res) => {
  try {
    await res.todoSet.destroy();
    res.json({ message: '待办集已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;