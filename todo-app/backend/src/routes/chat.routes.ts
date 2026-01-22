/**
 * Chat Routes
 * Defines the routes for the chat API
 */

import { Router } from 'express';
import { handleChatMessage, healthCheck } from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all chat routes
router.use(authenticateToken);

// POST /api/chat - Handle chat messages
router.post('/', handleChatMessage);

// GET /api/chat/health - Health check for the chat service
router.get('/health', healthCheck);

export default router;
