/**
 * ChatMessage Model
 * Represents a user's natural language input sent to the chatbot
 */

export type MessageStatus = 'received' | 'processing' | 'processed' | 'error';

export interface IChatMessage {
  id: string;
  userId: string;
  messageText: string;
  timestamp: Date;
  conversationContext: any;
  status: MessageStatus;
}

export class ChatMessage implements IChatMessage {
  id: string;
  userId: string;
  messageText: string;
  timestamp: Date;
  conversationContext: any;
  status: MessageStatus;

  constructor(
    id: string,
    userId: string,
    messageText: string,
    timestamp: Date = new Date(),
    conversationContext: any = null,
    status: MessageStatus = 'received'
  ) {
    this.id = id;
    this.userId = userId;
    this.messageText = messageText;
    this.timestamp = timestamp;
    this.conversationContext = conversationContext;
    this.status = status;
  }

  // Validate the chat message
  static validate(chatMessage: ChatMessage): boolean {
    if (!chatMessage.messageText || chatMessage.messageText.trim() === '') {
      throw new Error('Message text is required and cannot be empty');
    }

    if (!chatMessage.userId) {
      throw new Error('User ID is required');
    }

    if (chatMessage.timestamp && isNaN(Date.parse(chatMessage.timestamp.toString()))) {
      throw new Error('Timestamp must be a valid date');
    }

    return true;
  }

  // Update status
  updateStatus(newStatus: MessageStatus): ChatMessage {
    const validStatuses: MessageStatus[] = ['received', 'processing', 'processed', 'error'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`
      );
    }
    this.status = newStatus;
    return this;
  }

  // Convert to JSON for response
  toJSON(): IChatMessage {
    return {
      id: this.id,
      userId: this.userId,
      messageText: this.messageText,
      timestamp: this.timestamp,
      conversationContext: this.conversationContext,
      status: this.status
    };
  }
}

export default ChatMessage;
