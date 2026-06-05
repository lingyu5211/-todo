import { Router, Request, Response } from 'express';
import Room from '../models/Room';
import RoomMember from '../models/RoomMember';
import Message from '../models/Message';
import User from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { topic } = req.query;
    const where: any = { isPublic: true };
    if (topic) where.topic = topic;

    const rooms = await Room.findAll({ where, order: [['createdAt', 'DESC']] });
    const result = await Promise.all(rooms.map(async (room) => {
      const onlineCount = await RoomMember.count({ where: { roomId: room.id, isOnline: true } });
      return { ...room.toJSON(), onlineCount, hasPassword: !!room.password };
    }));
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching rooms:', error.message);
    res.json([]);
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const { name, description, topic, maxMembers = 100, isPublic = true, password } = req.body;
    if (!name || !topic) {
      return res.status(400).json({ error: '房间名称和主题不能为空' });
    }
    if (password !== undefined && password !== null && password !== '') {
      if (typeof password !== 'string' || password.length < 4 || password.length > 16) {
        return res.status(400).json({ error: '密码长度需要4-16个字符' });
      }
    }
    const hashedPassword = (password && password !== '') ? bcrypt.hashSync(password, 10) : null;
    const room = await Room.create({
      name, description: description || '', topic, maxMembers,
      creatorId: user.id, isPublic, password: hashedPassword,
    } as any);
    await RoomMember.create({ roomId: room.id, userId: user.id, isOnline: false, studyStatus: 'idle' } as any);
    res.status(201).json(room);
  } catch (error: any) {
    console.error('Error creating room:', error.message);
    res.status(500).json({ error: '创建房间失败' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const room = await Room.findByPk(id);
    if (!room) return res.status(404).json({ error: '房间不存在' });
    const members = await RoomMember.findAll({ where: { roomId: id } });
    const memberUsers = await Promise.all(members.map(async (m) => {
      const u = await User.findByPk(m.userId);
      return { userId: m.userId, username: u?.username || 'unknown', name: u?.name || '', avatar: u?.avatar || '', isOnline: m.isOnline, studyStatus: m.studyStatus };
    }));
    const onlineCount = members.filter(m => m.isOnline).length;
    res.json({ ...room.toJSON(), onlineCount, members: memberUsers });
  } catch (error: any) {
    console.error('Error fetching room:', error.message);
    res.status(500).json({ error: '获取房间信息失败' });
  }
});

router.post('/:id/join', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const roomId = parseInt(req.params.id as string, 10);
    const { password } = req.body;
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ error: '房间不存在' });
    const isCreator = user.id === room.creatorId;
    if (room.password && !isCreator) {
      if (!password) {
        return res.status(403).json({ error: 'Password required' });
      }
      if (!bcrypt.compareSync(password, room.password)) {
        return res.status(403).json({ error: 'Incorrect password' });
      }
    }
    const count = await RoomMember.count({ where: { roomId } });
    if (count >= room.maxMembers) return res.status(400).json({ error: '房间已满' });
    let member = await RoomMember.findOne({ where: { roomId, userId: user.id } });
    if (!member) {
      member = await RoomMember.create({ roomId, userId: user.id, isOnline: false, studyStatus: 'idle' } as any);
    }
    res.json(member);
  } catch (error: any) {
    console.error('Error joining room:', error.message);
    res.status(500).json({ error: '加入房间失败' });
  }
});

router.post('/:id/leave', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const roomId = parseInt(req.params.id as string, 10);
    await RoomMember.update({ isOnline: false, studyStatus: 'idle' }, { where: { roomId, userId: user.id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error leaving room:', error.message);
    res.status(500).json({ error: '离开房间失败' });
  }
});

router.get('/:id/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.id as string, 10);
    const page = parseInt((req.query.page as string) || '1');
    const limit = 50;
    const offset = (page - 1) * limit;
    const msgs = await Message.findAll({
      where: { roomId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    const result = await Promise.all(msgs.map(async (m) => {
      const u = await User.findByPk(m.userId);
      return { id: m.id, userId: m.userId, username: u?.username || 'unknown', name: u?.name || '', avatar: u?.avatar || '', content: m.content, type: m.type, createdAt: m.createdAt };
    }));
    res.json(result.reverse());
  } catch (error: any) {
    console.error('Error fetching messages:', error.message);
    res.json([]);
  }
});

export default router;
