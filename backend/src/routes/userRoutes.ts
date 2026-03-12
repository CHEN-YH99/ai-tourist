import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { userService } from '../services/userService.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Itinerary } from '../models/Itinerary.js';
import { Collection } from '../models/Collection.js';
import { avatarUpload } from '../middleware/upload.js';

const router = Router();

/**
 * GET /api/users/profile
 * 获取当前用户资料
 * 需求: 4.1 - 已认证用户请求查看个人资料时，User_Manager应返回该用户的User_Profile
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;

    const user = await userService.getProfile(userId);

    res.json({
      status: 'success',
      data: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        preferences: user.preferences,
        contactInfo: user.contactInfo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  })
);

/**
 * PUT /api/users/profile
 * 更新用户资料
 * 需求: 4.2 - 已认证用户更新个人资料时，User_Manager应保存更新后的User_Profile
 * 需求: 4.3 - User_Manager应允许用户更新用户名、头像、旅行偏好和联系方式
 * 需求: 4.4 - User_Manager应禁止用户修改邮箱地址
 */
router.put(
  '/profile',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const { username, avatar, preferences, contactInfo, email } = req.body;

    // 需求 4.4: 禁止修改邮箱地址
    if (email !== undefined) {
      throw new AppError(400, '不允许修改邮箱地址');
    }

    // 需求 4.3: 只允许更新特定字段
    const updateData: {
      username?: string;
      avatar?: string;
      preferences?: string[];
      contactInfo?: { phone?: string; wechat?: string };
    } = {};

    if (username !== undefined) updateData.username = username;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;

    const updatedUser = await userService.updateProfile(userId, updateData);

    res.json({
      status: 'success',
      data: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
        preferences: updatedUser.preferences,
        contactInfo: updatedUser.contactInfo,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      message: '个人资料更新成功',
    });
  })
);

/**
 * POST /api/users/avatar
 * 上传用户头像
 * 需求: 4.5 - 用户上传头像时，系统应验证文件大小不超过5MB
 * 需求: 4.6 - 用户上传头像时，系统应验证文件格式为JPEG、PNG或WebP
 */
router.post(
  '/avatar',
  authenticate,
  avatarUpload.single('avatar'),
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;

    // 验证文件是否上传
    if (!req.file) {
      throw new AppError(400, '请上传头像文件');
    }

    // 构建头像URL（相对路径）
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // 更新用户头像
    const updatedUser = await userService.updateProfile(userId, {
      avatar: avatarUrl,
    });

    res.json({
      status: 'success',
      data: {
        avatar: updatedUser.avatar,
      },
      message: '头像上传成功',
    });
  })
);

/**
 * DELETE /api/users/account
 * 删除用户账号（级联删除）
 * 需求: 8.6 - 删除用户账号时，系统应同时删除该用户的所有Conversation、Itinerary和收藏记录
 */
router.delete(
  '/account',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;

    // 验证用户存在
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    // 需求 8.6: 级联删除用户的所有相关数据
    await Promise.all([
      // 删除用户的所有对话
      Conversation.deleteMany({ userId }),
      // 删除用户的所有攻略
      Itinerary.deleteMany({ userId }),
      // 删除用户的所有收藏
      Collection.deleteMany({ userId }),
      // 删除用户账号
      User.findByIdAndDelete(userId),
    ]);

    res.json({
      status: 'success',
      message: '账号已成功删除',
    });
  })
);

export default router;
