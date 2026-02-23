import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import categoryRoutes from './routes/categoryRoutes';
import announcementRoutes from './routes/announcementRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

let dbBootstrapPromise: Promise<void> | null = null;

export const ensureDatabaseConnection = async (): Promise<void> => {
  if (!dbBootstrapPromise) {
    dbBootstrapPromise = connectDB();
  }

  try {
    await dbBootstrapPromise;
  } catch (error) {
    dbBootstrapPromise = null;
    throw error;
  }
};

// Initialize express app
const app: Application = express();
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration - Allow multiple origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow all localhost origins
      if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        return callback(null, true);
      }

      // If ALLOWED_ORIGINS is not set, fall back to permissive CORS to avoid
      // hard-blocking production clients.
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// Body parser middleware
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || '12mb';
app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: requestBodyLimit }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

app.use('/api', async (_req, res, next) => {
  try {
    await ensureDatabaseConnection();
    next();
  } catch {
    res.status(500).json({
      success: false,
      message: 'Database connection unavailable',
    });
  }
});

// Health check route
app.get('/health', async (_req, res) => {
  try {
    await ensureDatabaseConnection();
    res.json({
      success: true,
      message: 'EduFlow API is running',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Database connection unavailable',
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

export default app;
