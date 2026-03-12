import { Router } from 'express';
import { register, login, logout, verify } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

// 需求 3.1: POST /api/auth/register - 用户注册
router.post('/register', authLimiter, validateRegister, register);

// 需求 3.5: POST /api/auth/login - 用户登录
router.post('/login', authLimiter, validateLogin, login);

// POST /api/auth/logout - 用户登出
router.post('/logout', logout);

// GET /api/auth/verify - 验证token
router.get('/verify', authenticate, verify);

export default router;
