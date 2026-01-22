/**
 * Chatbot Service
 * Handles the core logic for processing chat messages and generating responses
 */

import ChatMessage from '../models/chat-message.model';
import TodoAction, { ActionType, ITodoDetails } from '../models/todo-action.model';
import ChatResponse from '../models/chat-response.model';
import { processIntent } from './intent-processor.service';
import { executeTodoAction } from './todo-action-executor.service';

export interface ProcessIntentResult {
  actionType: ActionType;
  targetTodoId: string | null;
  todoDetails: ITodoDetails;
  extractedData: Record<string, any>;
  confidence: number;
  message: string | null;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data: any;
  confidence?: number;
}

class ChatbotService {
  private conversationHistory: Map<string, any> = new Map();

  /**
   * Process a chat message and return a response
   */
  async processMessage(
    userId: string,
    message: string,
    conversationContext: any = null
  ): Promise<ChatResponse> {
    try {
      // Create a new chat message
      const chatMessage = new ChatMessage(
        this.generateId(),
        userId,
        message,
        new Date(),
        conversationContext,
        'received'
      );

      // Update status to processing
      chatMessage.updateStatus('processing');

      // Process the intent from the message
      const { actionType, targetTodoId, todoDetails, extractedData } = await processIntent(message);

      // Create a todo action based on the intent
      const todoAction = new TodoAction(
        this.generateId(),
        chatMessage.id,
        actionType,
        targetTodoId,
        todoDetails
      );

      // Validate the todo action
      TodoAction.validate(todoAction);

      // Execute the todo action
      const actionResult = await executeTodoAction(todoAction, userId);

      // Update the todo action status based on execution result
      if (actionResult.success) {
        todoAction.updateStatus('executed');
      } else {
        todoAction.updateStatus('failed');
      }

      // Generate an appropriate response based on the action and result
      const responseText = this.generateResponse(actionType, actionResult, extractedData);

      // Create the chat response
      const chatResponse = new ChatResponse(
        this.generateId(),
        chatMessage.id,
        responseText,
        [todoAction.id],
        {
          confidence: actionResult.confidence || 1.0,
          processingTime: Date.now() - chatMessage.timestamp.getTime()
        }
      );

      // Update the original message status to processed
      chatMessage.updateStatus('processed');

      return chatResponse;
    } catch (error: any) {
      console.error('Error processing chat message:', error);

      // Update the original message status to error
      const errorMessage = new ChatMessage(
        this.generateId(),
        userId,
        message,
        new Date(),
        conversationContext,
        'error'
      );

      // Create an error response
      const errorResponse = new ChatResponse(
        this.generateId(),
        errorMessage.id,
        "I'm sorry, I encountered an error processing your request. Please try again.",
        [],
        {
          error: error.message,
          processingTime: Date.now() - errorMessage.timestamp.getTime()
        }
      );

      return errorResponse;
    }
  }

  /**
   * Generate an appropriate response based on action type and result
   */
  private generateResponse(
    actionType: ActionType,
    actionResult: ActionResult,
    extractedData: Record<string, any>
  ): string {
    if (!actionResult.success) {
      return actionResult.message || "I'm sorry, I couldn't complete that action. Please try again.";
    }

    switch (actionType) {
      case 'create':
        return `Okay, I've added "${
          extractedData?.todoTitle || actionResult.data?.title
        }" to your todos.`;
      case 'query':
        if (actionResult.data && Array.isArray(actionResult.data.todos)) {
          if (actionResult.data.todos.length === 0) {
            return "You don't have any todos at the moment.";
          } else {
            const todoTitles = actionResult.data.todos
              .map((todo: any) => todo.title)
              .join(', ');
            return `You have the following todos: ${todoTitles}`;
          }
        }
        return "I've retrieved your todos for you.";
      case 'complete':
        return `Great! I've marked "${
          actionResult.data?.title || 'the task'
        }" as complete.`;
      case 'update':
        return `I've updated your todo "${actionResult.data?.title}".`;
      case 'delete':
        return `I've removed that todo from your list.`;
      default:
        return actionResult.message || "I've processed your request.";
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }
}

export default new ChatbotService();
