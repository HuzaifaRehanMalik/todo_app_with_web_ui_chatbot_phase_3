/**
 * ChatResponse Model
 * Contains the chatbot's AI-generated response text, any performed todo actions, and metadata
 */

export interface IChatResponse {
  id: string;
  chatMessageId: string;
  responseText: string;
  performedActions: string[];
  metadata: Record<string, any>;
  timestamp: Date;
}

export class ChatResponse implements IChatResponse {
  id: string;
  chatMessageId: string;
  responseText: string;
  performedActions: string[];
  metadata: Record<string, any>;
  timestamp: Date;

  constructor(
    id: string,
    chatMessageId: string,
    responseText: string,
    performedActions: string[] = [],
    metadata: Record<string, any> = {},
    timestamp: Date = new Date()
  ) {
    this.id = id;
    this.chatMessageId = chatMessageId;
    this.responseText = responseText;
    this.performedActions = performedActions;
    this.metadata = metadata;
    this.timestamp = timestamp;
  }

  // Validate the chat response
  static validate(chatResponse: ChatResponse): boolean {
    if (!chatResponse.chatMessageId) {
      throw new Error('Chat message ID is required');
    }

    if (!chatResponse.responseText || typeof chatResponse.responseText !== 'string') {
      throw new Error('Response text is required and must be a string');
    }

    if (!Array.isArray(chatResponse.performedActions)) {
      throw new Error('Performed actions must be an array');
    }

    return true;
  }

  // Add a performed action
  addActionPerformed(actionId: string): ChatResponse {
    this.performedActions.push(actionId);
    return this;
  }

  // Convert to JSON for response
  toJSON(): IChatResponse {
    return {
      id: this.id,
      chatMessageId: this.chatMessageId,
      responseText: this.responseText,
      performedActions: this.performedActions,
      metadata: this.metadata,
      timestamp: this.timestamp
    };
  }
}

export default ChatResponse;
