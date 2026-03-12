import express, { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
} from '../controllers/itineraryController.js';

const router: Router = express.Router();

/**
 * 攻略管理路由
 * 需求: 2.4, 2.5
 */

// GET /api/itineraries - 获取攻略列表（分页）
router.get('/', authenticate, getItineraries);

// GET /api/itineraries/:id - 获取特定攻略
router.get('/:id', authenticate, getItinerary);

// PUT /api/itineraries/:id - 更新攻略
router.put('/:id', authenticate, updateItinerary);

// DELETE /api/itineraries/:id - 删除攻略
router.delete('/:id', authenticate, deleteItinerary);

export default router;
