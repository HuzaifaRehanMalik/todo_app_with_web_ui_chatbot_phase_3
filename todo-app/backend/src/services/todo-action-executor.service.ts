/**
 * Todo Action Executor Service
 * Executes the todo actions based on the processed intent
 */

import TodoAction from '../models/todo-action.model';

export interface TodoItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: string | null;
  priority?: string;
}

export interface ExecutionResult {
  success: boolean;
  message: string;
  data: any;
}

/**
 * Execute a todo action based on the action type and details
 */
export async function executeTodoAction(
  todoAction: TodoAction,
  userId: string
): Promise<ExecutionResult> {
  try {
    switch (todoAction.actionType) {
      case 'create':
        return await createTodo(todoAction, userId);
      case 'query':
        return await getTodos(todoAction, userId);
      case 'update':
        return await updateTodo(todoAction, userId);
      case 'complete':
        return await completeTodo(todoAction, userId);
      case 'delete':
        return await deleteTodo(todoAction, userId);
      default:
        return {
          success: false,
          message: 'Unknown action type',
          data: null
        };
    }
  } catch (error: any) {
    console.error('Error executing todo action:', error);
    return {
      success: false,
      message: error.message || 'Error executing todo action',
      data: null
    };
  }
}

/**
 * Create a new todo
 */
async function createTodo(
  todoAction: TodoAction,
  userId: string
): Promise<ExecutionResult> {
  // Validate input
  if (!todoAction.todoDetails.title) {
    return {
      success: false,
      message: 'Todo title is required',
      data: null
    };
  }

  // In a real app, this would create the todo in the database
  // For now, we'll simulate it with a mock object
  const newTodo: TodoItem = {
    id: generateId(),
    userId,
    title: todoAction.todoDetails.title,
    description: todoAction.todoDetails.description || '',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: todoAction.todoDetails.dueDate || null,
    priority: todoAction.todoDetails.priority || 'medium'
  };

  return {
    success: true,
    message: 'Todo created successfully',
    data: newTodo
  };
}

/**
 * Get user's todos
 */
async function getTodos(
  todoAction: TodoAction,
  userId: string
): Promise<ExecutionResult> {
  // In a real app, this would fetch from the database
  // For now, we'll return mock data
  const mockTodos: TodoItem[] = [
    {
      id: generateId(),
      userId,
      title: 'Sample todo',
      description: 'This is a sample todo item',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  return {
    success: true,
    message: 'Todos retrieved successfully',
    data: {
      todos: mockTodos
    }
  };
}

/**
 * Update a todo
 */
async function updateTodo(
  todoAction: TodoAction,
  userId: string
): Promise<ExecutionResult> {
  // In a real app, this would update the todo in the database
  // For now, we'll simulate it

  // Mock: return a fake updated todo
  const updatedTodo: TodoItem = {
    id: todoAction.targetTodoId || generateId(),
    userId,
    title: todoAction.todoDetails.title || 'Updated todo',
    description: todoAction.todoDetails.description || '',
    completed:
      todoAction.todoDetails.completed !== undefined
        ? todoAction.todoDetails.completed
        : false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return {
    success: true,
    message: 'Todo updated successfully',
    data: updatedTodo
  };
}

/**
 * Mark a todo as complete
 */
async function completeTodo(
  todoAction: TodoAction,
  userId: string
): Promise<ExecutionResult> {
  // In a real app, this would update the todo in the database
  // For now, we'll simulate it

  // Mock: return a fake completed todo
  const completedTodo: TodoItem = {
    id: todoAction.targetTodoId || generateId(),
    userId,
    title: 'Sample todo',
    description: 'This is a sample todo item',
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return {
    success: true,
    message: 'Todo marked as complete',
    data: completedTodo
  };
}

/**
 * Delete a todo
 */
async function deleteTodo(
  todoAction: TodoAction,
  userId: string
): Promise<ExecutionResult> {
  // In a real app, this would delete the todo from the database
  // For now, we'll simulate it

  return {
    success: true,
    message: 'Todo deleted successfully',
    data: {
      id: todoAction.targetTodoId
    }
  };
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export {
  createTodo,
  getTodos,
  updateTodo,
  completeTodo,
  deleteTodo
};
