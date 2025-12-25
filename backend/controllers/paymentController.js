import crypto from 'crypto';
import PaystackService from '../services/paystackService.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { plans, calculateExpiryDate, getPriceInKobo } from '../config/plans.js';

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Private
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
      return res.status(400).json({
        success: false,
        error: 'Payment already verified'
      });
    }

    // Verify with Paystack
    const verification = await PaystackService.verifyTransaction(reference);

    if (!verification.success) {
      console.error('❌ Paystack verification failed:', verification.error);
      
      // Update payment status to failed
      payment.status = 'failed';
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

    // Update payment record
    payment.status = 'success';
    payment.paidAt = new Date(paystackData.paid_at);
    payment.paystackResponse = paystackData;
    await payment.save();

    console.log('✅ Payment record updated to success');

    // Update user plan
    user.plan = payment.plan;
    user.planExpiry = payment.expiresAt;
    user.subscription.status = 'active';
    user.subscription.currentPeriodEnd = payment.expiresAt;

    // Add to payment history
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

    console.log('✅ User plan updated successfully');

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        plan: user.plan,
        planExpiry: user.planExpiry,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        paidAt: payment.paidAt
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
    const signature = req.headers['x-paystack-signature'];
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const event = req.body;
    
    console.log('🔔 Paystack webhook received:', event.event);
    
    // ✅ SIGNATURE VERIFICATION (CRITICAL FOR SECURITY)
    if (signature && secret) {
      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      console.log('🔐 Signature check:', {
        received: signature?.substring(0, 20) + '...',
        computed: hash.substring(0, 20) + '...',
        match: signature === hash
      });
      
      if (signature !== hash) {
        console.error('❌ Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } else {
      console.warn('⚠️ Missing signature or secret key - proceeding anyway');
    }
    
    // Process webhook events
    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;
      console.log(`💰 Webhook: Successful charge for ${reference}`);

      // Find payment
      const payment = await Payment.findOne({ reference });
      
      if (payment && payment.status === 'pending') {
        console.log(`✅ Updating payment ${reference} to success`);
        
        // Update payment
        payment.status = 'success';
        payment.paidAt = new Date();
        payment.paystackResponse = event.data;
        await payment.save();

        // Update user
        const user = await User.findById(payment.user);
        if (user) {
          user.plan = payment.plan;
          user.planExpiry = payment.expiresAt;
          user.subscription.status = 'active';
          user.subscription.currentPeriodEnd = payment.expiresAt;
          
          user.paymentHistory.unshift({
            reference: payment.reference,
            amount: payment.amount,
            currency: payment.currency,
            plan: payment.plan,
            status: 'success',
            paidAt: payment.paidAt,
            expiresAt: payment.expiresAt
          });

          await user.save();
          console.log(`✅ User ${user.email} plan updated to ${payment.plan}`);
        }
      }
    } else if (event.event === 'charge.failure') {
      console.log(`❌ Payment failed:`, event.data.reference);
      
      // Update payment status to failed
      const payment = await Payment.findOne({ reference: event.data.reference });
      if (payment && payment.status === 'pending') {
        payment.status = 'failed';
        payment.paystackResponse = event.data;
        await payment.save();
        console.log(`📝 Updated payment ${event.data.reference} to failed`);
      }
    } else if (event.event === 'transfer.success') {
      console.log('✅ Transfer completed:', event.data.reference);
    }

    // Always return 200 to Paystack (even if we had errors)
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(200).json({ received: true });
  }
};