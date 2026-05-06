import express, { Request, Response } from 'express';
import Todo from '../models/Todo';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const todos = await Todo.findAll({ order: [['createdAt', 'DESC']] });
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, completed = false, priority = 'medium', dueDate, todoSetId } = req.body;
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
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { text, completed, priority, dueDate, currentMinutes, progress } = req.body;
    const [updated] = await Todo.update(
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
    if (updated) {
      const todo = await Todo.findByPk(id);
      res.json(todo);
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await Todo.destroy({ where: { id } });
    if (deleted) {
      res.json({ success: true, id });
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
