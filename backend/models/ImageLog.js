import mongoose from 'mongoose';

const imageLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  processedFilename: {
    type: String,
    required: true
  },
  originalSize: {
    type: Number, // in bytes
    required: true
  },
  processedSize: {
    type: Number, // in bytes
    required: true
  },
  format: {
    type: String,
    enum: ['png', 'jpg', 'jpeg', 'webp'],
    default: 'png'
  },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'hd'],
    default: 'medium'
  },
  processingTime: {
    type: Number, // in milliseconds
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'processing'],
    default: 'success'
  },
  error: {
    type: String
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
imageLogSchema.index({ user: 1, createdAt: -1 });
imageLogSchema.index({ createdAt: -1 });
imageLogSchema.index({ status: 1 });

// Update user's imagesProcessed count
imageLogSchema.post('save', async function(doc) {
  if (doc.status === 'success') {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(doc.user, {
      $inc: { imagesProcessed: 1 }
    });
  }
});

export default mongoose.model('ImageLog', imageLog);