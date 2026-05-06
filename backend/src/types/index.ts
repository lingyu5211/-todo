export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: 'high' | 'medium' | 'low';
  targetMinutes: number;
  currentMinutes: number;
  progress: number;
  timeInfo: string;
  todoSetId?: number;
}

export interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
}

export interface FocusSession {
  id: number;
  todoId?: number;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: Date;
}

export interface TodoSet {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
}

export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
  name: string;
  motto: string;
  totalFocusDays: number;
  consecutiveFocusDays: number;
  avatar: string;
  token: string;
}

export interface ThemeSettings {
  id: number;
  color: string;
}

export interface DeepSeekResponse {
  tasks: Array<{
    title: string;
    description: string;
    estimatedMinutes: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}
