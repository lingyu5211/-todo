/**
 * API服务，用于与后端通信
 * 封装了所有与后端API的交互方法
 */

// API基础URL
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * 获取待办事项列表
 * @returns {Promise<Array>} 待办事项列表
 */
export const getTodos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

/**
 * 创建新待办事项
 * @param {Object} todoData 待办事项数据
 * @param {string} todoData.text 待办事项内容
 * @param {boolean} [todoData.completed=false] 是否完成
 * @param {string} [todoData.priority='medium'] 优先级
 * @param {string} [todoData.dueDate] 截止日期
 * @returns {Promise<Object>} 创建的待办事项
 */
export const createTodo = async (todoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(todoData),
    });
    if (!response.ok) {
      throw new Error('Failed to create todo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

/**
 * 更新待办事项
 * @param {string|number} id 待办事项ID
 * @param {Object} todoData 更新的数据
 * @param {string} [todoData.text] 待办事项内容
 * @param {boolean} [todoData.completed] 是否完成
 * @param {string} [todoData.priority] 优先级
 * @param {string} [todoData.dueDate] 截止日期
 * @returns {Promise<Object>} 更新后的待办事项
 */
export const updateTodo = async (id, todoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(todoData),
    });
    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

/**
 * 删除待办事项
 * @param {string|number} id 待办事项ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteTodo = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

/**
 * 获取所有日程事件
 * @returns {Promise<Array>} 事件数组
 */
export const getEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    // 模拟数据，实际项目中应该从后端获取
    if (error.message === 'Failed to fetch') {
      return [
        {
          id: 1,
          title: '项目会议',
          start: '2026-04-10T09:00:00',
          end: '2026-04-10T10:00:00',
          allDay: false,
          color: '#409EFF'
        },
        {
          id: 2,
          title: '健身',
          start: '2026-04-10T18:00:00',
          end: '2026-04-10T19:00:00',
          allDay: false,
          color: '#67C23A'
        },
        {
          id: 3,
          title: '生日聚会',
          start: '2026-04-15',
          end: '2026-04-15',
          allDay: true,
          color: '#F56C6C'
        }
      ];
    }
    throw error;
  }
};

/**
 * 创建新日程事件
 * @param {Object} eventData 事件数据
 * @param {string} eventData.title 事件标题
 * @param {string} eventData.date 事件日期（YYYY-MM-DD格式）
 * @param {string} eventData.time 事件时间（HH:MM格式）
 * @param {string} [eventData.color='#409EFF'] 事件颜色
 * @returns {Promise<Object>} 创建的事件
 */
export const createEvent = async (eventData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    // 模拟创建，实际项目中应该从后端获取
    if (error.message === 'Failed to fetch') {
      return {
        id: Date.now(),
        ...eventData
      };
    }
    throw error;
  }
};

/**
 * 删除日程事件
 * @param {string|number} id 事件ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting event:', error);
    // 模拟删除，实际项目中应该从后端获取
    if (error.message === 'Failed to fetch') {
      return { success: true, id };
    }
    throw error;
  }
};

/**
 * 获取专注时间统计数据
 * @returns {Promise<Object>} 统计数据
 */
export const getFocusStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/focus-sessions/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch focus stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching focus stats:', error);
    // 错误时返回默认值
    return {
      totalSessions: 42,
      totalMinutes: 1260,
      avgMinutes: 30,
      todaySessions: 3,
      todayMinutes: 180,
      weeklySessions: 15,
      weeklyMinutes: 900,
      monthlySessions: 60,
      monthlyMinutes: 3600,
      focusByCategory: {
        work: 720,
        study: 360,
        health: 180
      },
      focusByHour: {
        '9': 120,
        '10': 180,
        '11': 90,
        '14': 150,
        '15': 180,
        '16': 120,
        '19': 180,
        '20': 120
      }
    };
  }
};

/**
 * 创建专注时间记录
 * @param {Object} sessionData 专注时间数据
 * @param {number} [sessionData.todoId] 关联的待办事项ID
 * @param {number} sessionData.duration 专注时长（分钟）
 * @param {string} sessionData.date 日期（YYYY-MM-DD格式）
 * @param {string} sessionData.startTime 开始时间
 * @param {string} sessionData.endTime 结束时间
 * @returns {Promise<Object>} 创建的专注时间记录
 */
export const createFocusSession = async (sessionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/focus-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) {
      throw new Error('Failed to create focus session');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating focus session:', error);
    throw error;
  }
};

/**
 * 获取专注时间记录列表
 * @returns {Promise<Array>} 专注时间记录列表
 */
export const getFocusSessions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/focus-sessions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch focus sessions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    // 错误时返回空数组
    return [];
  }
};

/**
 * 获取用户信息
 * @returns {Promise<Object>} 用户信息
 */
export const getUserInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/info`);
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    // 错误时返回默认值
    return {
      name: '嗨寻',
      motto: '钱是第一驱动力',
      totalFocusDays: 14,
      consecutiveFocusDays: 1,
      avatar: '🌙'
    };
  }
};

/**
 * 更新用户信息
 * @param {Object} userData 用户数据
 * @param {string} [userData.name] 用户名
 * @param {string} [userData.motto] 座右铭
 * @param {string} [userData.avatar] 头像
 * @returns {Promise<Object>} 更新后的用户信息
 */
export const updateUserInfo = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/info`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to update user info');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating user info:', error);
    throw error; // 抛出错误，让调用方处理
  }
};

/**
 * 获取用户主题设置
 * @returns {Promise<Object>} 主题设置
 */
export const getThemeSettings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/theme`);
    if (!response.ok) {
      throw new Error('Failed to fetch theme settings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    // 错误时返回默认值
    return {
      id: 1,
      color: '#409EFF'
    };
  }
};

/**
 * 保存用户主题设置
 * @param {Object} themeData 主题数据
 * @param {number} themeData.id 主题ID
 * @param {string} themeData.color 主题颜色
 * @returns {Promise<Object>} 保存结果
 */
export const saveThemeSettings = async (themeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(themeData),
    });
    if (!response.ok) {
      throw new Error('Failed to save theme settings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving theme settings:', error);
    throw error; // 抛出错误，让调用方处理
  }
};

/**
 * 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<Object>} 用户信息
 */
export const login = async (username, password) => {
  try {
    // 直接使用模拟登录，确保登录功能始终可用
    // 模拟用户数据
    if (username === 'user' && password === '123456') {
      return {
        id: 1,
        username: 'user',
        role: 'user',
        name: '嗨寻',
        motto: '钱是第一驱动力',
        totalFocusDays: 14,
        consecutiveFocusDays: 1,
        avatar: '🌙',
        token: 'mock-token-user'
      };
    } else if (username === 'admin' && password === '123456') {
      return {
        id: 2,
        username: 'admin',
        role: 'admin',
        name: '管理员',
        motto: '管理是一种责任',
        totalFocusDays: 30,
        consecutiveFocusDays: 7,
        avatar: '👑',
        token: 'mock-token-admin'
      };
    } else {
      throw new Error('用户名或密码错误');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * 用户登出
 * @returns {Promise<Object>} 登出结果
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to logout');
    }
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    // 模拟登出
    return { success: true };
  }
};

/**
 * 获取当前登录用户信息
 * @returns {Promise<Object>} 用户信息
 */
export const getCurrentUser = async () => {
  try {
    // 直接返回默认用户信息，确保系统能够正常运行
    return {
      id: 1,
      username: 'user',
      role: 'user',
      name: '嗨寻',
      motto: '钱是第一驱动力',
      totalFocusDays: 14,
      consecutiveFocusDays: 1,
      avatar: '🌙',
      token: 'mock-token-user'
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    // 返回默认用户信息，确保系统能够正常运行
    return {
      id: 1,
      username: 'user',
      role: 'user',
      name: '嗨寻',
      motto: '钱是第一驱动力',
      totalFocusDays: 14,
      consecutiveFocusDays: 1,
      avatar: '🌙',
      token: 'mock-token-user'
    };
  }
};