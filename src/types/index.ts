export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  targetMinutes: number;
  currentMinutes: number;
  progress: number;
  timeInfo: string;
  todoSetId?: number;
  userId?: number;
}

export interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
  date?: string;
  time?: string;
  userId?: number;
}

export interface FocusSession {
  id: number;
  todoId: number;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  userId?: number;
}

export interface TodoSet {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  userId?: number;
}

export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
  name: string;
  email: string;
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

export interface FocusStats {
  totalSessions: number;
  totalMinutes: number;
  avgMinutes: number;
  todaySessions: number;
  todayMinutes: number;
  weeklySessions: number;
  weeklyMinutes: number;
  monthlySessions: number;
  monthlyMinutes: number;
  focusByCategory: Record<string, number>;
  focusByHour: Record<string, number>;
}

export interface SubTask {
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

export interface DeepSeekAnalysisResponse {
  tasks: SubTask[];
}

export type PriorityLevel = 'high' | 'medium' | 'low';

export type TabName = 'todo' | 'todoSet' | 'lock' | 'stats' | 'profile';

export interface NavItem {
  name: TabName;
  icon: any;
  label: string;
}
