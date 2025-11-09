// index.js - UPDATED FOR ES MODULES
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🚨 CRITICAL: Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚨 Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

// 🚨 Verify process is available
console.log('🔧 Process check:', typeof process !== 'undefined' ? 'Process is available' : 'Process is undefined');

// 🚨 Verify environment loading
console.log('🔧 Environment variables loaded:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- PAYSTACK_SECRET_KEY exists:', !!process.env.PAYSTACK_SECRET_KEY);

if (process.env.PAYSTACK_SECRET_KEY) {
  console.log('- PAYSTACK_SECRET_KEY preview:', process.env.PAYSTACK_SECRET_KEY.substring(0, 10) + '...');
}

const app = express();

// Enhanced CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "https://removerio.vercel.app/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes AFTER environment is loaded
import paymentRoutes from "./routes/paymentRoutes.js";
app.use("/api", paymentRoutes);

// Test endpoint to verify environment variables
app.get("/api/env-test", (req, res) => {
  res.json({
    processAvailable: typeof process !== 'undefined',
    paystackKeyExists: !!process.env.PAYSTACK_SECRET_KEY,
    paystackKeyPreview: process.env.PAYSTACK_SECRET_KEY ? 
      process.env.PAYSTACK_SECRET_KEY.substring(0, 10) + '...' : 'MISSING',
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('PAYSTACK'))
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    processAvailable: typeof process !== 'undefined',
    paystackConfigured: !!process.env.PAYSTACK_SECRET_KEY,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Env Test: http://localhost:${PORT}/api/env-test`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});