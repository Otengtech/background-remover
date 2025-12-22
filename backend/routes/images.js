import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  processImage,
  processImageFromUrl,
  getImageStats,
  testImageProcessing
} from '../controllers/imageController.js';

const router = express.Router();

// All routes are protected
router.post('/process', protect, processImage);
router.post('/process-url', protect, processImageFromUrl);
router.get('/stats', protect, getImageStats);
router.post('/test', protect, testImageProcessing); // For testing only

export default router;