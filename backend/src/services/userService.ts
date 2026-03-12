import { User, IUser } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

export interface RegisterDTO {
  email: string;
  password: string;
  username: string;
  avatar?: string;
  preferences?: string[];
  contactInfo?: {
    phone?: string;
    wechat?: string;
  };
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  username?: string;
  avatar?: string;
  preferences?: string[];
  contactInfo?: {
    phone?: string;
    wechat?: string;
  };
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    preferences: string[];
    contactInfo?: {
      phone?: string;
      wechat?: string;
    };
  };
}

export class UserService {
  /**
   * Register a new user
   * - Check email uniqueness
   * - Encrypt password
   * - Create user
   * - Generate token
   */
  async register(input: RegisterDTO): Promise<LoginResponse> {
    const { email, password, username, avatar, preferences, contactInfo } = input;

    // Check email uniqueness (需求 3.4)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(409, '邮箱已被注册');
    }

    // Encrypt password (需求 3.6)
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      username,
      avatar,
      preferences: preferences || [],
      contactInfo,
    });

    await user.save();

    // Generate JWT token for immediate login
    const token = generateToken(user._id.toString(), user.email);

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        preferences: user.preferences,
        contactInfo: user.contactInfo,
      },
    };
  }

  /**
   * Login user
   * - Validate credentials
   * - Generate JWT token
   */
  async login(input: LoginDTO): Promise<LoginResponse> {
    const { email, password } = input;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(401, '邮箱或密码错误');
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, '邮箱或密码错误');
    }

    // Generate JWT token (需求 3.5, 3.8: 24小时过期)
    const token = generateToken(user._id.toString(), user.email);

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        preferences: user.preferences,
        contactInfo: user.contactInfo,
      },
    };
  }

  /**
   * Get user profile by userId
   */
  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, '用户不存在');
    }
    return user;
  }

  /**
   * Update user profile
   * - Forbid email modification
   */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<IUser> {
    const { username, avatar, preferences, contactInfo } = input;

    // Build update object (email is explicitly excluded - 需求 4.4)
    const updateData: Partial<IUser> = {};
    if (username !== undefined) updateData.username = username;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    return user;
  }
}

export const userService = new UserService();
