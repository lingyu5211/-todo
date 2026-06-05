const rooms = new Map<number, Map<string, { userId: number; username: string; name: string; avatar: string }>>();

export const addUser = (roomId: number, socketId: string, user: { userId: number; username: string; name: string; avatar: string }) => {
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  rooms.get(roomId)!.set(socketId, user);
};

export const removeUser = (roomId: number, socketId: string) => {
  const room = rooms.get(roomId);
  if (room) {
    room.delete(socketId);
    if (room.size === 0) rooms.delete(roomId);
  }
};

// Remove all socket entries for a given userId in a room (prevents duplicates on reconnect)
export const removeUserByUserId = (roomId: number, userId: number) => {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const [socketId, user] of room) {
    if (user.userId === userId) room.delete(socketId);
  }
  if (room.size === 0) rooms.delete(roomId);
};

export const getRoomUsers = (roomId: number) => {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.values());
};

export const getRoomUserCount = (roomId: number) => {
  const room = rooms.get(roomId);
  return room ? room.size : 0;
};

export const getSocketIds = (roomId: number) => {
  const room = rooms.get(roomId);
  return room ? Array.from(room.keys()) : [];
};
