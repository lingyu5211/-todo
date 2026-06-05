import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import RoomMember from '../models/RoomMember';
import Message from '../models/Message';
import User from '../models/User';
import { addUser, removeUserByUserId, getRoomUsers } from './roomManager';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const setupSocketIO = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    jwt.verify(token as string, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return next(new Error('Invalid token'));
      (socket as any).user = decoded;
      next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as { id: number; username: string };
    console.log(`User ${user.username} connected via socket ${socket.id}`);

    socket.on('room:join', async ({ roomId }: { roomId: number }) => {
      const dbUser = await User.findByPk(user.id);
      const displayName = dbUser?.name || user.username;
      const avatar = dbUser?.avatar || '';

      // Clean old socket entries for this userId first (prevents duplicates on reconnect)
      removeUserByUserId(roomId, user.id);
      addUser(roomId, socket.id, { userId: user.id, username: user.username, name: displayName, avatar });
      socket.join(`room:${roomId}`);

      await RoomMember.update({ isOnline: true }, { where: { roomId, userId: user.id } });
      const member = await RoomMember.findOne({ where: { roomId, userId: user.id } });

      // Broadcast to other members
      socket.to(`room:${roomId}`).emit('room:member_joined', {
        userId: user.id,
        username: user.username,
        name: displayName,
        avatar,
        studyStatus: member?.studyStatus || 'idle',
      });

      // Send deduplicated member list with actual DB studyStatus
      const roomUsers = getRoomUsers(roomId);
      const seen = new Set<number>();
      const memberList = [];
      for (const u of roomUsers) {
        if (!seen.has(u.userId)) {
          seen.add(u.userId);
          const m = await RoomMember.findOne({ where: { roomId, userId: u.userId } });
          memberList.push({
            userId: u.userId,
            username: u.username,
            name: u.name,
            avatar: u.avatar,
            isOnline: true,
            studyStatus: m?.studyStatus || 'idle',
          });
        }
      }
      socket.emit('room:members', memberList);
    });

    socket.on('room:leave', async ({ roomId }: { roomId: number }) => {
      socket.leave(`room:${roomId}`);
      removeUserByUserId(roomId, user.id);
      await RoomMember.update({ isOnline: false, studyStatus: 'idle' }, { where: { roomId, userId: user.id } });
      io.to(`room:${roomId}`).emit('room:member_left', { userId: user.id });
    });

    socket.on('study:start', async () => {
      const userRooms = Array.from(socket.rooms).filter(r => r.startsWith('room:'));
      for (const roomName of userRooms) {
        const roomId = parseInt(roomName.split(':')[1], 10);
        await RoomMember.update({ studyStatus: 'studying' }, { where: { roomId, userId: user.id } });
        io.to(roomName).emit('room:member_status', { userId: user.id, studyStatus: 'studying' });
      }
    });

    socket.on('study:stop', async () => {
      const userRooms = Array.from(socket.rooms).filter(r => r.startsWith('room:'));
      for (const roomName of userRooms) {
        const roomId = parseInt(roomName.split(':')[1], 10);
        await RoomMember.update({ studyStatus: 'idle' }, { where: { roomId, userId: user.id } });
        io.to(roomName).emit('room:member_status', { userId: user.id, studyStatus: 'idle' });
      }
    });

    socket.on('chat:send', async ({ roomId, content }: { roomId: number; content: string }) => {
      if (!content || content.trim().length === 0) return;
      if (content.length > 500) return;

      const dbUser = await User.findByPk(user.id);
      const msg = await Message.create({ roomId, userId: user.id, content: content.trim(), type: 'text' } as any);

      io.to(`room:${roomId}`).emit('chat:message', {
        id: msg.id,
        userId: user.id,
        username: user.username,
        name: dbUser?.name || '',
        avatar: dbUser?.avatar || '',
        content: content.trim(),
        type: 'text',
        createdAt: msg.createdAt,
      });
    });

    socket.on('disconnect', async () => {
      console.log(`User ${user.username} disconnected via socket ${socket.id}`);
      for (const roomName of socket.rooms) {
        if (roomName.startsWith('room:')) {
          const roomId = parseInt(roomName.split(':')[1], 10);
          removeUserByUserId(roomId, user.id);
          // Only mark offline if user has no other active sockets in this room
          const remaining = getRoomUsers(roomId).filter(u => u.userId === user.id);
          if (remaining.length === 0) {
            await RoomMember.update({ isOnline: false, studyStatus: 'idle' }, { where: { roomId, userId: user.id } });
            io.to(roomName).emit('room:member_left', { userId: user.id });
          }
        }
      }
    });
  });

  return io;
};
