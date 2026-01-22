/**
 * Intent Processor Service
 * Processes natural language input to extract actionable intent for todo operations
 */

import aiService from './ai-integration.service';
import { ActionType, ITodoDetails } from '../models/todo-action.model';

export interface ExtractedInfo {
  todoTitle: string | null;
  todoDescription: string | null;
  dueDate: string | null;
  priority: string | null;
}

export interface IntentResult {
  actionType: ActionType;
  targetTodoId: string | null;
  todoDetails: ITodoDetails;
  extractedData: ExtractedInfo;
  confidence: number;
  message: string | null;
}

/**
 * Process user intent from a message
 */
export async function processIntent(message: string): Promise<IntentResult> {
  try {
    // Use the AI integration service to process the message
    const result = await aiService.processUserMessage(message);

    // Extract and return the relevant information
    return {
      actionType: result.actionType as ActionType,
      targetTodoId: result.targetTodoId || null,
      todoDetails: result.todoDetails || {},
      extractedData: {
        todoTitle: result.todoDetails?.title || null,
        todoDescription: result.todoDetails?.description || null,
        todoDueDate: result.todoDetails?.dueDate || null,
        todoPriority: result.todoDetails?.priority || null
      },
      confidence: result.confidence || 0.5,
      message: result.message || null
    };
  } catch (error: any) {
    console.error('Error processing intent:', error);

    // Return a default response indicating unknown intent
    return {
      actionType: 'query',
      targetTodoId: null,
      todoDetails: {},
      extractedData: {
        todoTitle: null,
        todoDescription: null,
        dueDate: null,
        priority: null
      },
      confidence: 0.0,
      message: 'Sorry, I could not understand your request. Please try rephrasing.'
    };
  }
}

/**
 * Extract specific information from a message (helper function)
 */
export function extractInfo(message: string): ExtractedInfo {
  const info: ExtractedInfo = {
    todoTitle: null,
    todoDescription: null,
    dueDate: null,
    priority: null
  };

  // Simple pattern matching to extract information
  const titleMatch = message.match(/(?:to|that|for)\s+(.+)/i);
  if (titleMatch) {
    info.todoTitle = titleMatch[1].replace(/\s+$/, '');
  }

  // Look for priority indicators
  if (/(high|urgent|important)/i.test(message)) {
    info.priority = 'high';
  } else if (/(medium|normal)/i.test(message)) {
    info.priority = 'medium';
  } else if (/(low|not urgent)/i.test(message)) {
    info.priority = 'low';
  }

  // Look for due date indicators
  const datePattern =
    /(?:by|before|on|until)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2}|tomorrow|today|tonight|this weekend|next week)/i;
  const dateMatch = message.match(datePattern);
  if (dateMatch) {
    info.dueDate = dateMatch[1];
  }

  return info;
}
