import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  planExpiry: {
    type: Date,
    default: null
  },
  imagesProcessed: {
    type: Number,
    default: 0
  },
  monthlyImagesUsed: {
    type: Number,
    default: 0
  },
  monthlyResetDate: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'inactive'
    },
    currentPeriodEnd: Date,
    plan: String,
    startedAt: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  paymentHistory: [{
    reference: String,
    amount: Number,
    currency: {
      type: String,
      default: 'GHS'
    },
    plan: String,
    status: String,
    paidAt: Date,
    expiresAt: Date
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Middleware to reset monthly usage
userSchema.pre('save', function(next) {
  const now = new Date();
  if (this.monthlyResetDate && now >= this.monthlyResetDate) {
    this.monthlyImagesUsed = 0;
    this.monthlyResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  next();
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if plan is active
userSchema.methods.isPlanActive = function() {
  if (this.plan === 'free') return true;
  if (!this.planExpiry) return false;
  return new Date() < this.planExpiry;
};

// Get remaining days in plan
userSchema.methods.getPlanRemainingDays = function() {
  if (this.plan === 'free' || !this.planExpiry) return Infinity;
  const now = new Date();
  const expiry = new Date(this.planExpiry);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Check if user can process image
userSchema.methods.canProcessImage = function() {
  // Check if plan is active for paid plans
  if (this.plan !== 'free' && !this.isPlanActive()) {
    return { 
      canProcess: false, 
      reason: 'Plan expired. Please renew your subscription.',
      limit: 0,
      remaining: 0
    };
  }
  
  // Check monthly limits
  const planLimits = {
    free: 10,     // 10 images/month
    pro: Infinity // Unlimited for pro
  };
  
  const limit = planLimits[this.plan];
  
  // For pro plan, always allow
  if (this.plan === 'pro') {
    return { 
      canProcess: true, 
      reason: '',
      limit: 'unlimited',
      remaining: 'unlimited'
    };
  }
  
  if (this.monthlyImagesUsed >= limit) {
    return { 
      canProcess: false, 
      reason: `Monthly limit reached (${limit} images). Upgrade to Pro for unlimited access.`,
      limit: limit,
      remaining: 0
    };
  }
  
  return { 
    canProcess: true, 
    reason: '',
    limit: limit,
    remaining: limit - this.monthlyImagesUsed
  };
};

// Get plan resolution
userSchema.methods.getPlanResolution = function() {
  return this.plan === 'free' ? '360p' : '4K Ultra HD';
};

// Get max file size for plan
userSchema.methods.getMaxFileSize = function() {
  return this.plan === 'free' ? 5 : 25; // MB
};

// Increment processed images
userSchema.methods.incrementProcessedImages = async function() {
  this.imagesProcessed += 1;
  this.monthlyImagesUsed += 1;
  await this.save();
};

// Add payment to history
userSchema.methods.addPayment = async function(paymentData) {
  this.paymentHistory.unshift(paymentData);
  await this.save();
};

// Update plan
userSchema.methods.updatePlan = async function(plan, expiryDate) {
  this.plan = plan;
  this.planExpiry = expiryDate;
  this.subscription = {
    status: 'active',
    currentPeriodEnd: expiryDate,
    plan: plan,
    startedAt: new Date(),
    cancelAtPeriodEnd: false
  };
  await this.save();
};

// In your User model (models/User.js), add these methods:

/**
 * Check if user can process image
 */
userSchema.methods.canProcessImage = function() {
  const now = new Date();
  
  // Check if plan is active
  if (!this.isPlanActive()) {
    return {
      canProcess: false,
      reason: 'Plan expired. Please upgrade to continue.',
      remaining: 0
    };
  }
  
  // Handle free plan limits
  if (this.plan === 'free') {
    const monthlyLimit = 10;
    
    // Reset monthly count if it's a new month
    if (this.monthlyResetDate && now > this.monthlyResetDate) {
      this.monthlyImagesUsed = 0;
      this.monthlyResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    
    if (this.monthlyImagesUsed >= monthlyLimit) {
      return {
        canProcess: false,
        reason: 'Monthly limit reached. Upgrade to Pro for unlimited access.',
        remaining: 0
      };
    }
    
    return {
      canProcess: true,
      reason: '',
      remaining: monthlyLimit - this.monthlyImagesUsed
    };
  }
  
  // Pro plan - unlimited
  return {
    canProcess: true,
    reason: '',
    remaining: 'unlimited'
  };
};

/**
 * Increment processed images count
 */
userSchema.methods.incrementProcessedImages = async function() {
  this.imagesProcessed = (this.imagesProcessed || 0) + 1;
  this.monthlyImagesUsed = (this.monthlyImagesUsed || 0) + 1;
  this.lastProcessedAt = new Date();
  
  // Set monthly reset date if not set
  if (!this.monthlyResetDate) {
    const now = new Date();
    this.monthlyResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  
  await this.save();
  return this;
};

/**
 * Check if plan is active
 */
userSchema.methods.isPlanActive = function() {
  if (this.plan === 'free') {
    return true; // Free plan is always active
  }
  
  if (this.plan === 'pro' && this.planExpiry) {
    return new Date() < new Date(this.planExpiry);
  }
  
  return false;
};

/**
 * Get plan resolution
 */
userSchema.methods.getPlanResolution = function() {
  return this.plan === 'pro' ? '4K Ultra HD' : '360p';
};

/**
 * Get max file size in MB
 */
userSchema.methods.getMaxFileSize = function() {
  return this.plan === 'pro' ? 25 : 5; // MB
};

/**
 * Get remaining days in plan
 */
userSchema.methods.getPlanRemainingDays = function() {
  if (this.plan === 'free') {
    return 'unlimited';
  }
  
  if (this.planExpiry) {
    const now = new Date();
    const expiry = new Date(this.planExpiry);
    const diffTime = Math.abs(expiry - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
  
  return 0;
};

const User = mongoose.model('User', userSchema);

export default User;