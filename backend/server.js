import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
  'https://backend-six-mu-76.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// Define CORS options once
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ✅ CRITICAL FIX: Handle preflight OPTIONS requests with SAME configuration
app.options('*', cors(corsOptions));

// Manual preflight handler for extra safety
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.includes(allowed))) {
    res.header('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    return res.status(200).end();
  }
  
  res.status(403).json({ error: 'CORS not allowed' });
});

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

// Add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Add CORS headers to every response
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.includes(allowed)))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

// Connect to MongoDB (UPDATED)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // 🔑 Critical options for latest MongoDB
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
    });

    console.log("✅ MongoDB Connected");

    // ---- Connection events ----
    mongoose.connection.on("connected", () => {
      console.log("🟢 MongoDB connected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔁 MongoDB reconnected");
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err);
    });

    // ---- Keep connection alive ----
    setInterval(async () => {
      try {
        await mongoose.connection.db.admin().ping();
      } catch (err) {
        console.error("❌ MongoDB ping failed", err);
      }
    }, 5 * 60 * 1000); // every 5 minutes

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Import routes
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import imageRoutes from './routes/images.js';

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

// Test CORS endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
});

app.options('/api/cors-test', cors(corsOptions));

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
      health: '/api/health',
      corsTest: '/api/cors-test'
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
      'GET /api/cors-test',
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

// Start server function
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 Server running on port ${PORT}
      `);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Closing server...');
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Closing server...');
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();