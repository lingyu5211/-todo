import express, { Request, Response } from 'express';
import Event from '../models/Event';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await Event.findAll({ order: [['start', 'ASC']] });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, start, end, allDay = false, color = '#409EFF' } = req.body;
    const event = await Event.create({ title, start, end, allDay, color } as any);
    res.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Event.destroy({ where: { id } });
    if (deleted) {
      res.json({ success: true, id });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
