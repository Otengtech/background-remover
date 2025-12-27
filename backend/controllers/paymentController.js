import crypto from 'crypto';
import PaystackService from '../services/paystackService.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { plans, calculateExpiryDate, getPriceInKobo } from '../config/plans.js';
import dotenv from "dotenv"

dotenv.config()


export const initializePayment = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const user = req.user;

    console.log(`💰 Initializing payment for user: ${user.email}, plan: ${plan}`);

    // Validate plan
    if (!['basic', 'pro'].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan. Choose either basic or pro.'
      });
    }

    // Check if user already has this plan active
    if (user.plan === plan && user.isPlanActive()) {
      return res.status(400).json({
        success: false,
        error: `You already have an active ${plan} plan.`
      });
    }

    // Get plan price
    const planConfig = plans[plan];
    const amount = planConfig.price;
    console.log(`💰 Plan price: ${amount} GHS`);

    // Initialize Paystack transaction
    const paymentData = await PaystackService.initializeTransaction(
      user.email,
      amount,
      {
        userId: user._id.toString(),
        plan: plan,
        custom_fields: [
          {
            display_name: "Plan",
            variable_name: "plan",
            value: plan
          },
          {
            display_name: "User ID",
            variable_name: "user_id",
            value: user._id.toString()
          }
        ]
      }
    );

    if (!paymentData.success) {
      console.error('❌ Paystack initialization failed:', paymentData.error);
      return res.status(500).json({
        success: false,
        error: paymentData.error || 'Payment initialization failed'
      });
    }

    console.log('✅ Paystack initialization successful:', paymentData.data.reference);

    // Calculate expiry date
    const expiryDate = calculateExpiryDate(plan);

    // Create payment record
    const payment = await Payment.create({
      user: user._id,
      reference: paymentData.data.reference,
      plan: plan,
      amount: amount,
      currency: 'GHS',
      status: 'pending',
      expiresAt: expiryDate,
      metadata: {
        authorization_url: paymentData.data.authorization_url,
        access_code: paymentData.data.access_code
      }
    });

    console.log('📝 Payment record created:', payment.reference);

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        authorization_url: paymentData.data.authorization_url,
        reference: paymentData.data.reference,
        access_code: paymentData.data.access_code,
        amount: amount,
        currency: 'GHS',
        plan: plan
      }
    });
  } catch (error) {
    console.error('❌ Initialize payment error:', error);
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.body;
    const user = req.user;

    console.log(`🔍 Verifying payment: ${reference} for user: ${user.email}`);

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ 
      reference, 
      user: user._id 
    });

    if (!payment) {
      console.log('❌ Payment record not found');
      return res.status(404).json({
        success: false,
        error: 'Payment record not found'
      });
    }

    // If already verified
    if (payment.status === 'success') {
      console.log('ℹ️ Payment already verified');
      
      // Get updated user data
      const updatedUser = await User.findById(user._id);
      
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: {
          user: {
            _id: updatedUser._id,
            email: updatedUser.email,
            name: updatedUser.name,
            plan: updatedUser.plan,
            planExpiry: updatedUser.planExpiry,
            subscription: updatedUser.subscription,
            monthlyImagesUsed: updatedUser.monthlyImagesUsed || 0,
            monthlyResetDate: updatedUser.monthlyResetDate,
            imagesProcessed: updatedUser.imagesProcessed || 0
          },
          reference: payment.reference,
          alreadyProcessed: true
        }
      });
    }

    // Verify with Paystack
    const verification = await PaystackService.verifyTransaction(reference);

    if (!verification.success) {
      console.error('❌ Paystack verification failed:', verification.error);
      
      payment.status = 'failed';
      payment.failureReason = verification.error;
      await payment.save();

      return res.status(400).json({
        success: false,
        error: verification.error || 'Payment verification failed'
      });
    }

    const paystackData = verification.data;
    console.log('✅ Paystack verification data:', {
      status: paystackData.status,
      amount: paystackData.amount,
      reference: paystackData.reference
    });

    // Check if payment was successful
    if (paystackData.status !== 'success') {
      console.log(`❌ Payment status not success: ${paystackData.status}`);
      
      payment.status = 'failed';
      payment.paystackResponse = paystackData;
      await payment.save();

      return res.status(400).json({
        success: false,
        error: `Payment ${paystackData.status}`
      });
    }

    // Verify amount matches (in kobo)
    const expectedAmount = getPriceInKobo(payment.plan);
    console.log(`💰 Expected: ${expectedAmount} kobo, Received: ${paystackData.amount} kobo`);
    
    if (paystackData.amount !== expectedAmount) {
      console.error(`❌ Amount mismatch: expected ${expectedAmount}, got ${paystackData.amount}`);
      
      payment.status = 'failed';
      payment.paystackResponse = paystackData;
      await payment.save();

      return res.status(400).json({
        success: false,
        error: 'Payment amount mismatch'
      });
    }

    // ✅ Update payment record
    payment.status = 'success';
    payment.paidAt = new Date(paystackData.paid_at || paystackData.transaction_date);
    payment.paystackResponse = paystackData;
    await payment.save();

    console.log('✅ Payment record updated to success');

    // ✅ Update user plan - FIXED!
    const updatedUser = await User.findById(user._id);
    
    // Update basic user fields
    updatedUser.plan = payment.plan;
    updatedUser.planExpiry = payment.expiresAt;
    
    // Update subscription object - FIXED STRUCTURE
    updatedUser.subscription = {
      status: 'active',
      currentPeriodEnd: payment.expiresAt,
      plan: payment.plan,
      startedAt: new Date(),
      cancelAtPeriodEnd: false
    };

    // Add to payment history
    if (!updatedUser.paymentHistory) {
      updatedUser.paymentHistory = [];
    }
    
    updatedUser.paymentHistory.unshift({
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      plan: payment.plan,
      status: 'success',
      paidAt: payment.paidAt,
      expiresAt: payment.expiresAt
    });

    // Reset monthly usage counter
    updatedUser.monthlyImagesUsed = 0;
    updatedUser.monthlyResetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

    await updatedUser.save();

    console.log('✅ User plan updated successfully');
    console.log(`👤 User ${updatedUser.email} now has ${updatedUser.plan} plan`);
    console.log(`📅 Plan expires on: ${updatedUser.planExpiry}`);
    console.log(`📊 Subscription: ${JSON.stringify(updatedUser.subscription)}`);

    // Return FULL user data to frontend
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        user: {
          _id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          plan: updatedUser.plan,
          planExpiry: updatedUser.planExpiry,
          subscription: updatedUser.subscription,
          monthlyImagesUsed: updatedUser.monthlyImagesUsed || 0,
          monthlyResetDate: updatedUser.monthlyResetDate,
          imagesProcessed: updatedUser.imagesProcessed || 0,
          isPlanActive: updatedUser.isPlanActive(),
          remainingDays: updatedUser.getPlanRemainingDays(),
          canProcessImage: updatedUser.canProcessImage()
        },
        payment: {
          reference: payment.reference,
          amount: payment.amount,
          currency: payment.currency,
          plan: payment.plan,
          paidAt: payment.paidAt,
          expiresAt: payment.expiresAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Verify payment error:', error);
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res, next) => {
  try {
    const user = req.user;

    const payments = await Payment.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select('reference plan amount currency status paidAt expiresAt createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current subscription status
// @route   GET /api/payments/subscription
// @access  Private
export const getSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    const subscription = {
      plan: user.plan,
      planExpiry: user.planExpiry,
      isActive: user.isPlanActive(),
      remainingDays: user.getPlanRemainingDays(),
      imagesProcessed: user.imagesProcessed,
      monthlyImagesUsed: user.monthlyImagesUsed,
      monthlyLimit: user.plan === 'free' ? 10 : user.plan === 'basic' ? 100 : 'unlimited',
      monthlyResetDate: user.monthlyResetDate,
      canProcess: user.canProcessImage()
    };

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get plan details
// @route   GET /api/payments/plans
// @access  Public
export const getPlans = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Webhook for Paystack notifications
// @route   POST /api/payments/webhook
// @access  Public (called by Paystack)
export const webhook = async (req, res, next) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    
    console.log('=== WEBHOOK RECEIVED ===');
    
    const signature = req.headers['x-paystack-signature'];
    const event = req.body?.event;
    
    if (!event) {
      console.warn('⚠️ Webhook called without event field');
      return res.status(200).json({ 
        received: true, 
        warning: 'No event field in payload'
      });
    }
    
    console.log(`🔔 Paystack webhook event: ${event}`);
    
    // ✅ SIGNATURE VERIFICATION
    if (signature && secret) {
      const rawBody = JSON.stringify(req.body);
      const hash = crypto
        .createHmac('sha512', secret)
        .update(rawBody)
        .digest('hex');
      
      console.log('🔐 Signature check:', {
        signatureLength: signature.length,
        hashLength: hash.length,
        match: signature === hash
      });
      
      if (signature !== hash) {
        console.error('❌ Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
      console.log('✅ Signature verified successfully');
    } else {
      console.warn(`⚠️ Missing: ${!signature ? 'signature' : 'secret key'}`);
    }
    
    // Handle charge.success event
    if (event === 'charge.success') {
      const { reference, amount, customer, paid_at } = req.body.data;
      console.log(`💰 Webhook: Successful charge for ${reference}`);
      
      // Find payment record
      const payment = await Payment.findOne({ reference });
      
      if (!payment) {
        console.error(`❌ Payment not found for reference: ${reference}`);
        return res.status(200).json({ 
          received: true, 
          error: 'Payment not found' 
        });
      }
      
      // If already processed
      if (payment.status === 'success') {
        console.log(`ℹ️ Payment already processed: ${reference}`);
        return res.status(200).json({ 
          received: true, 
          message: 'Already processed' 
        });
      }
      
      // Verify amount matches
      const expectedAmount = getPriceInKobo(payment.plan);
      console.log(`💰 Amount check: expected ${expectedAmount}, got ${amount}`);
      
      if (amount !== expectedAmount) {
        console.error(`❌ Amount mismatch for ${reference}`);
        payment.status = 'failed';
        payment.failureReason = 'Amount mismatch';
        await payment.save();
        return res.status(200).json({ 
          received: true, 
          error: 'Amount mismatch' 
        });
      }
      
      // ✅ Update payment record
      payment.status = 'success';
      payment.paidAt = new Date(paid_at);
      payment.paystackResponse = req.body.data;
      await payment.save();
      
      console.log(`✅ Payment updated to success: ${reference}`);
      
      // ✅ Update user's plan - FIXED!
      const user = await User.findById(payment.user);
      if (!user) {
        console.error(`❌ User not found for payment: ${reference}`);
        return res.status(200).json({ 
          received: true, 
          error: 'User not found' 
        });
      }
      
      console.log(`👤 Updating user ${user.email} to ${payment.plan} plan`);
      
      // Update user plan
      user.plan = payment.plan;
      user.planExpiry = payment.expiresAt;
      
      // Update subscription object - FIXED!
      user.subscription = {
        status: 'active',
        currentPeriodEnd: payment.expiresAt,
        plan: payment.plan,
        startedAt: new Date(),
        cancelAtPeriodEnd: false
      };
      
      // Add to payment history
      if (!user.paymentHistory) {
        user.paymentHistory = [];
      }
      
      user.paymentHistory.unshift({
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        plan: payment.plan,
        status: 'success',
        paidAt: payment.paidAt,
        expiresAt: payment.expiresAt
      });
      
      // Reset monthly usage counter
      user.monthlyImagesUsed = 0;
      user.monthlyResetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
      
      await user.save();
      
      console.log(`✅ User ${user.email} successfully updated to ${payment.plan} plan`);
      console.log(`📅 Plan expires on: ${payment.expiresAt}`);
      console.log(`📊 Subscription: ${JSON.stringify(user.subscription)}`);
    }
    
    // Always return 200 to Paystack
    res.status(200).json({ 
      received: true,
      message: 'Webhook processed successfully'
    });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(200).json({ 
      received: true, 
      error: error.message 
    });
  }
};

// @desc    Refresh user data
// @route   GET /api/payments/refresh-user
// @access  Private
export const refreshUserData = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Get fresh user data from database
    const freshUser = await User.findById(user._id);
    
    if (!freshUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: freshUser._id,
          email: freshUser.email,
          name: freshUser.name,
          plan: freshUser.plan,
          planExpiry: freshUser.planExpiry,
          subscription: freshUser.subscription,
          monthlyImagesUsed: freshUser.monthlyImagesUsed || 0,
          monthlyResetDate: freshUser.monthlyResetDate,
          imagesProcessed: freshUser.imagesProcessed || 0,
          isPlanActive: freshUser.isPlanActive(),
          remainingDays: freshUser.getPlanRemainingDays(),
          canProcessImage: freshUser.canProcessImage()
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Refresh user data error:', error);
    next(error);
  }
};