/**
 * API服务，用于与后端通信
 * 封装了所有与后端API的交互方法
 */

// API基础URL
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * 获取所有待办事项
 * @returns {Promise<Array>} 待办事项数组
 */
export const getTodos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos`);
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching todos:', error);
    return []; // 错误时返回空数组，避免前端崩溃
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
      },
      body: JSON.stringify(todoData),
    });
    if (!response.ok) {
      throw new Error('Failed to create todo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error; // 抛出错误，让调用方处理
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
      },
      body: JSON.stringify(todoData),
    });
    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error; // 抛出错误，让调用方处理
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
    });
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error; // 抛出错误，让调用方处理
  }
};

/**
 * 获取所有日程事件
 * @returns {Promise<Array>} 事件数组
 */
export const getEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return []; // 错误时返回空数组，避免前端崩溃
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
      },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    throw error; // 抛出错误，让调用方处理
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
    });
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error; // 抛出错误，让调用方处理
  }
};

/**
 * 获取专注时间统计数据
 * @returns {Promise<Object>} 统计数据
 */
export const getFocusStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/focus-sessions/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch focus stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching focus stats:', error);
    // 错误时返回默认值
    return {
      totalSessions: 0,
      totalMinutes: 0,
      avgMinutes: 0,
      todaySessions: 0,
      todayMinutes: 0
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
      },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) {
      throw new Error('Failed to create focus session');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating focus session:', error);
    throw error; // 抛出错误，让调用方处理
  }
};