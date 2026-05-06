import express, { Request, Response } from 'express';
import TodoSet from '../models/TodoSet';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const todoSets = await TodoSet.findAll({ order: [['createdAt', 'DESC']] });
    res.json(todoSets);
  } catch (error) {
    console.error('Error fetching todo sets:', error);
    res.status(500).json({ error: 'Failed to fetch todo sets' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description = '' } = req.body;
    const todoSet = await TodoSet.create({ name, description } as any);
    res.json(todoSet);
  } catch (error) {
    console.error('Error creating todo set:', error);
    res.status(500).json({ error: 'Failed to create todo set' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { name, description } = req.body;
    const [updated] = await TodoSet.update(
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      { where: { id } }
    );
    if (updated) {
      const todoSet = await TodoSet.findByPk(id);
      res.json(todoSet);
    } else {
      res.status(404).json({ error: 'Todo set not found' });
    }
  } catch (error) {
    console.error('Error updating todo set:', error);
    res.status(500).json({ error: 'Failed to update todo set' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await TodoSet.destroy({ where: { id } });
    if (deleted) {
      res.json({ message: 'Todo set deleted successfully' });
    } else {
      res.status(404).json({ error: 'Todo set not found' });
    }
  } catch (error) {
    console.error('Error deleting todo set:', error);
    res.status(500).json({ error: 'Failed to delete todo set' });
  }
});

export default router;
