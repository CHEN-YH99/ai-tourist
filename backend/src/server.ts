import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST before any other imports
dotenv.config({ path: path.join(__dirname, '../.env') });

import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { connectDatabase } from './config/database.js';
import { logger, accessLogger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { responseFormatter } from './middleware/responseFormatter.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { corsOptions } from './config/cors.js';
import { helmetOptions } from './config/security.js';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response formatter middleware (set Content-Type and standard format)
app.use(responseFormatter);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request logging middleware (access log)
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    accessLogger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
  });
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (_req, res) => {
  res.json({ message: 'AI Travel Assistant API', version: '1.0.0' });
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/ai.js';
import destinationRoutes from './routes/destinationRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', aiRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/search', searchRoutes);

// TODO: Add remaining API routes

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: '请求的资源不存在',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();
