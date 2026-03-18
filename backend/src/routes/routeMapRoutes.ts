import express from 'express';
import { generateRouteMap } from '../controllers/routeMapController.js';
import { optionalAuth } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for route map generation (10 requests per 15 minutes)
const routeMapLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: 'error',
    message: '路线图生成请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/route-map/generate
 * Generate a route map from travel content
 * Optional authentication - works for both logged-in and guest users
 */
router.post('/generate', optionalAuth, routeMapLimiter, generateRouteMap);

export default router;
