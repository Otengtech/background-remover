import express from 'express';
import multer from 'multer';
import imageController from '../controllers/imageController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import path from 'path'; // Add this import

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|bmp|tiff/i;
    const extname = allowedTypes.test(path.extname(file.originalname));
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Protected routes (require authentication)
router.use(protect);

// Upload and process image
router.post('/process', upload.single('image'), imageController.processImage);

// Process image from URL
router.post('/process-url', imageController.processImageFromUrl);

// Get user image stats
router.get('/stats', imageController.getImageStats);

// Check service status
router.get('/status', imageController.getServiceStatus);

export default router;