/**
 * Chat Controller
 * Handles HTTP requests for the chat endpoint
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import chatbotService from '../services/chatbot.service';
import ChatMessage from '../models/chat-message.model';
import ChatResponse from '../models/chat-response.model';
import Logger from '../utils/logger';

/**
 * Handle chat message requests
 * POST /api/chat
 */
export const handleChatMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, conversationContext } = req.body;
    const userId = req.user?.id;

    // Validate request body
    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
      return;
    }

    Logger.info('Processing chat message', { userId, message });

    // Process the message through the chatbot service
    const chatResponse = await chatbotService.processMessage(userId, message, conversationContext);

    Logger.info('Chat response generated', { userId, responseId: chatResponse.id });

    // Send the response back to the client
    res.status(200).json({
      responseText: chatResponse.responseText,
      performedActions: chatResponse.performedActions.map((actionId: string) => ({
        id: actionId,
        status: 'executed' // Simplified status for the frontend
      })),
      conversationContext: {
        sessionId: (req as any).sessionId || 'default-session',
        lastResponse: chatResponse.responseText
      },
      metadata: chatResponse.metadata
    });
  } catch (error: any) {
    Logger.error('Error in chat controller', { error: error.message, stack: error.stack });

    res.status(500).json({
      error: 'An error occurred while processing your message',
      message: error.message
    });
  }
};

/**
 * Health check endpoint for the chat service
 * GET /api/chat/health
 */
export const healthCheck = (req: AuthRequest, res: Response): void => {
  res.status(200).json({
    status: 'OK',
    service: 'Chat Service',
    timestamp: new Date().toISOString()
  });
};
