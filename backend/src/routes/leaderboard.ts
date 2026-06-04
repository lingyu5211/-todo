import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import FocusSession from '../models/FocusSession';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'week';
    let startDate: Date;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'week':
      default:
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        break;
    }

    const sessions = await FocusSession.findAll({
      where: {
        date: { [Op.gte]: startDate.toISOString().slice(0, 10) } as any,
      },
    });

    const userMinutes: Record<number, number> = {};
    for (const s of sessions) {
      const uid = s.userId!;
      userMinutes[uid] = (userMinutes[uid] || 0) + s.duration;
    }

    const ranked = await Promise.all(
      Object.entries(userMinutes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 100)
        .map(async ([userId, minutes], index) => {
          const u = await User.findByPk(parseInt(userId));
          return {
            rank: index + 1,
            userId: parseInt(userId),
            username: u?.username || 'unknown',
            name: u?.name || '',
            avatar: u?.avatar || '',
            totalMinutes: minutes,
          };
        })
    );

    res.json({ period, startDate: startDate.toISOString(), leaderboard: ranked });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error.message);
    res.json({ period: 'week', startDate: new Date().toISOString(), leaderboard: [] });
  }
});

export default router;
