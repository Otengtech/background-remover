import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
  getSubscription,
  getPlans,
  webhook
} from '../controllers/paymentController.js';

const router = express.Router();

// Public routes
router.get('/plans', getPlans);
router.post('/webhook', webhook); // Paystack webhook

// Protected routes
router.post('/initialize', protect, initializePayment);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/subscription', protect, getSubscription);

export default router;