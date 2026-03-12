import express from 'express';
import * as aiController from '../controllers/aiController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply AI rate limiter to all routes
router.use(aiLimiter);

// Chat endpoints
router.post('/chat', optionalAuth, aiController.chat);
router.get('/chat/conversations', authenticate, aiController.getConversations);
router.get('/chat/conversations/:id', authenticate, aiController.getConversation);
router.delete('/chat/conversations/:id', authenticate, aiController.deleteConversation);

// Itinerary generation endpoint
router.post('/itineraries/generate', authenticate, aiController.generateItinerary);

export default router;
