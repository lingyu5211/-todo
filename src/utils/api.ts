import type {
  Todo,
  Event,
  FocusSession,
  TodoSet,
  User,
  ThemeSettings,
  FocusStats,
  SubTask,
  Room,
  ChatMessage,
  LeaderboardData,
} from '@/types';

const API_BASE_URL = 'http://localhost:3000/api';

interface CreateTodoData {
  text: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  todoSetId?: number;
}

interface UpdateTodoData {
  text?: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  currentMinutes?: number;
  progress?: number;
}

interface CreateEventData {
  title: string;
  date?: string;
  time?: string;
  color?: string;
  start?: string;
  end?: string;
  allDay?: boolean;
}

interface CreateFocusSessionData {
  todoId?: number;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
}

interface UpdateUserInfoData {
  name?: string;
  motto?: string;
  avatar?: string;
}

interface CreateTodoSetData {
  name: string;
  description?: string;
}

interface UpdateTodoSetData {
  name?: string;
  description?: string;
}

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const getTodos = async (): Promise<Todo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<Todo[]>(response);
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

export const createTodo = async (todoData: CreateTodoData): Promise<Todo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        ...todoData,
        completed: todoData.completed ?? false,
        priority: todoData.priority ?? 'medium',
      }),
    });
    return await handleResponse<Todo>(response);
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

export const updateTodo = async (id: number, todoData: UpdateTodoData): Promise<Todo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(todoData),
    });
    return await handleResponse<Todo>(response);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodo = async (id: number): Promise<{ success: boolean; id: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<{ success: boolean; id: number }>(response);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<Event[]>(response);
  } catch (error) {
    console.error('Error fetching events:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      return [
        { id: 1, title: '项目会议', start: '2026-04-10T09:00:00', end: '2026-04-10T10:00:00', allDay: false, color: '#409EFF' },
        { id: 2, title: '健身', start: '2026-04-10T18:00:00', end: '2026-04-10T19:00:00', allDay: false, color: '#67C23A' },
        { id: 3, title: '生日聚会', start: '2026-04-15', end: '2026-04-15', allDay: true, color: '#F56C6C' },
      ];
    }
    throw error;
  }
};

export const createEvent = async (eventData: CreateEventData): Promise<Event> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        ...eventData,
        color: eventData.color ?? '#409EFF',
      }),
    });
    return await handleResponse<Event>(response);
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      return { id: Date.now() as number, ...eventData, color: eventData.color ?? '#409EFF' } as Event;
    }
    throw error;
  }
};

export const deleteEvent = async (id: number): Promise<{ success: boolean; id: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<{ success: boolean; id: number }>(response);
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      return { success: true, id };
    }
    throw error;
  }
};

export const getFocusStats = async (): Promise<FocusStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/focus-sessions/stats`, {
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<FocusStats>(response);
  } catch (error) {
    console.error('Error fetching focus stats:', error);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      avgMinutes: 0,
      todaySessions: 0,
      todayMinutes: 0,
      sessionsByDate: [],
      focusByCategory: {},
    };
  }
};

export const createFocusSession = async (sessionData: CreateFocusSessionData): Promise<FocusSession> => {
  try {
    const response = await fetch(`${API_BASE_URL}/focus-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(sessionData),
    });
    return await handleResponse<FocusSession>(response);
  } catch (error) {
    console.error('Error creating focus session:', error);
    throw error;
  }
};

export const getFocusSessions = async (): Promise<FocusSession[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/focus-sessions`, {
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<FocusSession[]>(response);
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    return [];
  }
};

export const getUserInfo = async (): Promise<Omit<User, 'token' | 'username' | 'role'>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/info`, {
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<Omit<User, 'token' | 'username' | 'role'>>(response);
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

export const updateUserInfo = async (userData: UpdateUserInfoData): Promise<Omit<User, 'token' | 'username' | 'role'>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/info`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await handleResponse<Omit<User, 'token' | 'username' | 'role'>>(response);
  } catch (error) {
    console.error('Error updating user info:', error);
    throw error;
  }
};

export const getThemeSettings = async (): Promise<ThemeSettings> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/theme`);
    return await handleResponse<ThemeSettings>(response);
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    return { id: 1, color: '#409EFF' };
  }
};

export const saveThemeSettings = async (themeData: { id: number; color: string }): Promise<ThemeSettings> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(themeData),
    });
    return await handleResponse<ThemeSettings>(response);
  } catch (error) {
    console.error('Error saving theme settings:', error);
    throw error;
  }
};

export const login = async (username: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '登录失败');
    }

    return await handleResponse<User>(response);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (data: {
  username: string;
  password: string;
  name: string;
  email: string;
}): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '注册失败');
    }

    return await handleResponse<User>(response);
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const logout = async (): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<{ success: boolean }>(response);
  } catch (error) {
    console.error('Logout error:', error);
    return { success: true };
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    return {
      id: 1,
      username: 'user',
      role: 'user',
      name: '嗨寻',
      motto: '钱是第一驱动力',
      totalFocusDays: 14,
      consecutiveFocusDays: 1,
      avatar: '🌙',
      token: 'mock-token-user',
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return {
      id: 1,
      username: 'user',
      role: 'user',
      name: '嗨寻',
      motto: '钱是第一驱动力',
      totalFocusDays: 14,
      consecutiveFocusDays: 1,
      avatar: '🌙',
      token: 'mock-token-user',
    };
  }
};

export const analyzeTodoSet = async (todoSetName: string, description: string): Promise<SubTask[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deepseek/analyze-todo-set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ todoSetName, description }),
    });
    const data = await handleResponse<{ tasks: SubTask[] }>(response);
    return data.tasks || [];
  } catch (error) {
    console.error('Error analyzing todo set:', error);
    return [
      { title: '子任务1', description: '完成第一个子任务', estimatedMinutes: 30, priority: 'high' },
      { title: '子任务2', description: '完成第二个子任务', estimatedMinutes: 25, priority: 'medium' },
      { title: '子任务3', description: '完成第三个子任务', estimatedMinutes: 20, priority: 'low' },
    ];
  }
};

export const getTodoSets = async (): Promise<TodoSet[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-sets`, {
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<TodoSet[]>(response);
  } catch (error) {
    console.error('Error fetching todo sets:', error);
    return [{ id: 1, name: '实习', description: '实习相关任务' }];
  }
};

export const createTodoSet = async (todoSetData: CreateTodoSetData): Promise<TodoSet> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-sets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(todoSetData),
    });
    return await handleResponse<TodoSet>(response);
  } catch (error) {
    console.error('Error creating todo set:', error);
    return { id: Date.now() as number, name: todoSetData.name, description: todoSetData.description ?? '' };
  }
};

export const updateTodoSet = async (id: number, todoSetData: UpdateTodoSetData): Promise<TodoSet> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-sets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(todoSetData),
    });
    return await handleResponse<TodoSet>(response);
  } catch (error) {
    console.error('Error updating todo set:', error);
    return { id, name: todoSetData.name ?? 'Unknown', description: todoSetData.description ?? '' };
  }
};

export const deleteTodoSet = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-sets/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<{ message: string }>(response);
  } catch (error) {
    console.error('Error deleting todo set:', error);
    return { message: '待办集已删除' };
  }
};

// --- Rooms ---

export const getRooms = async (topic?: string): Promise<Room[]> => {
  const url = topic ? `${API_BASE_URL}/rooms?topic=${encodeURIComponent(topic)}` : `${API_BASE_URL}/rooms`;
  const response = await fetch(url, { headers: { ...getAuthHeader() } });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const createRoom = async (data: { name: string; description?: string; topic: string; maxMembers?: number }): Promise<Room> => {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '创建房间失败');
  }
  return response.json();
};

export const getRoomDetail = async (id: number): Promise<Room & { members: any[] }> => {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const joinRoom = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}/join`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '加入房间失败');
  }
};

export const leaveRoom = async (id: number): Promise<void> => {
  await fetch(`${API_BASE_URL}/rooms/${id}/leave`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
};

export const getRoomMessages = async (roomId: number, page: number = 1): Promise<ChatMessage[]> => {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages?page=${page}`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) return [];
  return response.json();
};

// --- Leaderboard ---

export const getLeaderboard = async (period: 'day' | 'week' | 'month' = 'week'): Promise<LeaderboardData> => {
  const response = await fetch(`${API_BASE_URL}/leaderboard?period=${period}`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) return { period: 'week', startDate: '', leaderboard: [] };
  return response.json();
};
