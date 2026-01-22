/**
 * TodoAction Model
 * Represents the interpreted intent extracted from a chat message
 */

export type ActionType = 'create' | 'update' | 'complete' | 'delete' | 'query';
export type ActionStatus = 'pending' | 'executed' | 'failed';

export interface ITodoDetails {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  completed?: boolean;
}

export interface ITodoAction {
  id: string;
  chatMessageId: string;
  actionType: ActionType;
  targetTodoId: string | null;
  todoDetails: ITodoDetails;
  status: ActionStatus;
  executedAt: Date | null;
}

export class TodoAction implements ITodoAction {
  id: string;
  chatMessageId: string;
  actionType: ActionType;
  targetTodoId: string | null;
  todoDetails: ITodoDetails;
  status: ActionStatus;
  executedAt: Date | null;

  constructor(
    id: string,
    chatMessageId: string,
    actionType: ActionType,
    targetTodoId: string | null = null,
    todoDetails: ITodoDetails = {},
    status: ActionStatus = 'pending'
  ) {
    this.id = id;
    this.chatMessageId = chatMessageId;
    this.actionType = actionType;
    this.targetTodoId = targetTodoId;
    this.todoDetails = todoDetails;
    this.status = status;
    this.executedAt = null;
  }

  // Validate the todo action
  static validate(todoAction: TodoAction): boolean {
    const validActionTypes: ActionType[] = ['create', 'update', 'complete', 'delete', 'query'];
    if (!validActionTypes.includes(todoAction.actionType)) {
      throw new Error(
        `Invalid action type: ${todoAction.actionType}. Must be one of: ${validActionTypes.join(', ')}`
      );
    }

    if (!todoAction.chatMessageId) {
      throw new Error('Chat message ID is required');
    }

    // Validate targetTodoId for certain action types
    if (
      ['update', 'complete', 'delete', 'query'].includes(todoAction.actionType) &&
      !todoAction.targetTodoId
    ) {
      throw new Error(`Target todo ID is required for ${todoAction.actionType} actions`);
    }

    // Validate todoDetails for create/update actions
    if (
      ['create', 'update'].includes(todoAction.actionType) &&
      !todoAction.todoDetails.title
    ) {
      throw new Error('Todo details with title is required for create/update actions');
    }

    return true;
  }

  // Update status
  updateStatus(newStatus: ActionStatus, executedAt: Date | null = null): TodoAction {
    const validStatuses: ActionStatus[] = ['pending', 'executed', 'failed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`
      );
    }
    this.status = newStatus;
    if (newStatus !== 'pending') {
      this.executedAt = executedAt || new Date();
    }
    return this;
  }

  // Convert to JSON for response
  toJSON(): ITodoAction {
    return {
      id: this.id,
      chatMessageId: this.chatMessageId,
      actionType: this.actionType,
      targetTodoId: this.targetTodoId,
      todoDetails: this.todoDetails,
      status: this.status,
      executedAt: this.executedAt
    };
  }
}

export default TodoAction;
