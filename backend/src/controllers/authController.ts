import { Response, NextFunction } from 'express';
import { UserService, RegisterDTO, LoginDTO } from '../services/userService.js';
import { AuthRequest } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';

const userService = new UserService();

// 需求 3.1: POST /api/auth/register - 用户注册
export async function register(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    const registerData: RegisterDTO = req.body;
    const result = await userService.register(registerData);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// 需求 3.5: POST /api/auth/login - 用户登录
export async function login(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    const loginData: LoginDTO = req.body;
    const result = await userService.login(loginData);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout - 用户登出
// 注意: JWT是无状态的，登出主要在客户端处理（删除token）
// 服务端只需返回成功响应
export async function logout(
  _req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    res.status(200).json({
      status: 'success',
      message: '登出成功',
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/verify - 验证token
export async function verify(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    // 如果能到达这里，说明authenticate中间件已经验证了token
    res.status(200).json({
      status: 'success',
      data: {
        userId: req.userId,
        email: req.userEmail,
      },
    });
  } catch (error) {
    next(error);
  }
}
