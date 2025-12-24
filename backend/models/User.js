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
    enum: ['free', 'basic', 'pro'],
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

// Check if user can process image based on plan limits
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
    free: 50,     // 50 images/month
    basic: 500,   // 500 images/month
    pro: 5000     // 5000 images/month (effectively unlimited)
  };
  
  const limit = planLimits[this.plan];
  
  // For pro plan with "unlimited" (5000), always allow
  if (this.plan === 'pro') {
    return { 
      canProcess: true, 
      reason: '',
      limit: limit,
      remaining: limit - this.monthlyImagesUsed
    };
  }
  
  if (this.monthlyImagesUsed >= limit) {
    return { 
      canProcess: false, 
      reason: `Monthly limit reached (${limit} images). Upgrade plan for more.`,
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

// Get plan-based resolution settings
userSchema.methods.getPlanResolutionSettings = function() {
  const resolutions = {
    free: { 
      width: 1280, 
      height: 720, 
      quality: 80, 
      label: 'SD (720p max)',
      maxFileSize: 10 * 1024 * 1024 // 10MB
    },
    basic: { 
      width: 1920, 
      height: 1080, 
      quality: 90, 
      label: 'HD (1080p max)',
      maxFileSize: 20 * 1024 * 1024 // 20MB
    },
    pro: { 
      width: 3840, 
      height: 2160, 
      quality: 100, 
      label: '4K Ultra HD',
      maxFileSize: 50 * 1024 * 1024 // 50MB
    }
  };
  return resolutions[this.plan] || resolutions.free;
};

// Get plan resolution label (simple version)
userSchema.methods.getPlanResolutionLabel = function() {
  const resolutionSettings = this.getPlanResolutionSettings();
  return resolutionSettings.label;
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
  await this.save();
};

// Reset monthly usage (admin function)
userSchema.methods.resetMonthlyUsage = async function() {
  this.monthlyImagesUsed = 0;
  this.monthlyResetDate = new Date();
  this.monthlyResetDate.setMonth(this.monthlyResetDate.getMonth() + 1);
  await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;