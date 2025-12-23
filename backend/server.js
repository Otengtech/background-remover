import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Body parser with increased limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
const allowedOrigins = [
  'https://removerio.bond',
  'https://www.removerio.bond',
  "https://backend-six-mu-76.vercel.app",
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Set security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Handle preflight requests
app.options('*', cors());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Don't exit process on Vercel
  }
};

// Import routes dynamically
const importRoutes = async () => {
  try {
    // Import routes
    const authRoutes = (await import('./routes/auth.js')).default;
    const paymentRoutes = (await import('./routes/payment.js')).default;
    const imageRoutes = (await import('./routes/images.js')).default;
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'RemoveIt API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        services: {
          imageProcessing: 'ready',
          payment: process.env.PAYSTACK_SECRET_KEY ? 'configured' : 'not configured'
        }
      });
    });

    // Mount routes
    app.use('/api/auth', authRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/images', imageRoutes);

    // Welcome route
    app.get('/', (req, res) => {
      res.json({
        message: '🚀 RemoveIt Background Removal API',
        version: '1.0.0',
        status: 'online',
        environment: process.env.NODE_ENV,
        documentation: 'https://removerio.bond/docs',
        endpoints: {
          auth: '/api/auth',
          payments: '/api/payments',
          images: '/api/images',
          health: '/api/health'
        }
      });
    });

    // API documentation route
    app.get('/api', (req, res) => {
      res.json({
        api: 'RemoveIt API',
        version: '1.0.0',
        baseUrl: `${req.protocol}://${req.get('host')}/api`,
        endpoints: {
          auth: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            logout: 'GET /api/auth/logout',
            me: 'GET /api/auth/me'
          },
          payments: {
            plans: 'GET /api/payments/plans',
            initialize: 'POST /api/payments/initialize',
            verify: 'POST /api/payments/verify',
            subscription: 'GET /api/payments/subscription'
          },
          images: {
            process: 'POST /api/images/process',
            'process-url': 'POST /api/images/process-url',
            stats: 'GET /api/images/stats'
          }
        }
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: [
          'GET /',
          'GET /api',
          'GET /api/health',
          'POST /api/auth/register',
          'POST /api/auth/login',
          'GET /api/auth/me',
          'POST /api/images/process',
          'POST /api/payments/initialize'
        ]
      });
    });

    // Error handler middleware
    app.use((err, req, res, next) => {
      console.error('❌ Server Error:', err.stack);
      
      res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
      });
    });

  } catch (error) {
    console.error('❌ Failed to import routes:', error);
    
    // Fallback routes if imports fail
    app.get('/', (req, res) => {
      res.json({
        message: 'RemoveIt API - Routes loading failed',
        error: error.message,
        status: 'partial'
      });
    });

    app.use((err, req, res, next) => {
      res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    });
  }
};

// Initialize server
const initializeServer = async () => {
  try {
    await connectDB();
    await importRoutes();
    
    const PORT = process.env.PORT || 3000;
    
    // For Vercel, we don't call app.listen()
    if (process.env.VERCEL !== '1') {
      const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        console.log('SIGTERM received. Closing server...');
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      });
    }
    
    console.log('✅ Server initialized successfully');
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
  }
};

// Start server initialization
initializeServer();

// Export the Express app for Vercel
export default app;