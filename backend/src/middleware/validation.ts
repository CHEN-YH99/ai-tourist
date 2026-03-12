import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

// 邮箱格式验证正则表达式
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 密码强度验证：至少8个字符，包含字母和数字
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

/**
 * 验证注册输入
 * 需求 3.2: 验证邮箱格式
 * 需求 3.3: 验证密码强度（至少8个字符，包含字母和数字）
 */
export function validateRegister(req: Request, _res: Response, next: NextFunction) {
  const { email, password, username } = req.body;

  // 验证必填字段
  if (!email || !password || !username) {
    return next(new AppError(400, '邮箱、密码和用户名为必填项'));
  }

  // 验证邮箱格式
  if (!EMAIL_REGEX.test(email)) {
    return next(new AppError(400, '邮箱格式不正确'));
  }

  // 验证密码强度
  if (!PASSWORD_REGEX.test(password)) {
    return next(new AppError(400, '密码必须至少8个字符，且包含字母和数字'));
  }

  // 验证用户名长度
  if (username.trim().length < 2 || username.trim().length > 50) {
    return next(new AppError(400, '用户名长度必须在2-50个字符之间'));
  }

  next();
}

/**
 * 验证登录输入
 * 需求 3.5: 验证登录凭证格式
 */
export function validateLogin(req: Request, _res: Response, next: NextFunction) {
  const { email, password } = req.body;

  // 验证必填字段
  if (!email || !password) {
    return next(new AppError(400, '邮箱和密码为必填项'));
  }

  // 验证邮箱格式
  if (!EMAIL_REGEX.test(email)) {
    return next(new AppError(400, '邮箱格式不正确'));
  }

  next();
}

/**
 * 验证更新用户资料输入
 */
export function validateUpdateProfile(req: Request, _res: Response, next: NextFunction) {
  const { username, email } = req.body;

  // 禁止修改邮箱
  if (email !== undefined) {
    return next(new AppError(400, '不允许修改邮箱地址'));
  }

  // 如果提供了用户名，验证长度
  if (username !== undefined) {
    if (typeof username !== 'string' || username.trim().length < 2 || username.trim().length > 50) {
      return next(new AppError(400, '用户名长度必须在2-50个字符之间'));
    }
  }

  next();
}
