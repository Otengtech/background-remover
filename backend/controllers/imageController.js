import ImageService from '../services/imageService.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
}).single('image');

// @desc    Upload and process image
// @route   POST /api/images/process
// @access  Private
export const processImage = async (req, res, next) => {
  // Handle file upload
  upload(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Please upload an image file'
        });
      }

      const user = req.user;

      // Check if user can process image
      const canProcess = user.canProcessImage();
      if (!canProcess.canProcess) {
        return res.status(403).json({
          success: false,
          error: canProcess.reason
        });
      }

      // Get plan-based resolution settings
      const resolution = user.getAllowedResolution();
      console.log(`🖼️ Processing image for ${user.plan} plan: ${resolution.label}`);

      // Get image info
      const imageInfo = await ImageService.getImageInfo(req.file.buffer);
      console.log(`📊 Original image: ${imageInfo.width}x${imageInfo.height}, ${imageInfo.sizeMB}MB`);

      // Process image
      const startTime = Date.now();
      const processedBuffer = await ImageService.processImage(
        req.file.buffer,
        user.plan,
        user.plan === 'pro' // Use Remove.bg for pro users
      );
      const processingTime = Date.now() - startTime;

      // Get processed image info
      const processedInfo = await ImageService.getImageInfo(processedBuffer);
      console.log(`✅ Processed image: ${processedInfo.width}x${processedInfo.height}, ${processedInfo.sizeMB}MB`);
      console.log(`⚡ Processing time: ${processingTime}ms`);

      // Increment user's image count
      await user.incrementProcessedImages();

      // Generate download filename
      const downloadFilename = ImageService.generateDownloadFilename(req.file.originalname);

      // Set response headers for download
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': processedBuffer.length,
        'X-Processing-Time': `${processingTime}ms`,
        'X-Plan-Used': user.plan,
        'X-Resolution': resolution.label,
        'X-Images-Remaining': canProcess.remaining - 1,
        'X-Monthly-Limit': canProcess.limit
      });

      // Send the processed image
      res.send(processedBuffer);

    } catch (error) {
      console.error('❌ Image processing error:', error);
      next(error);
    }
  });
};

// @desc    Process image from URL
// @route   POST /api/images/process-url
// @access  Private
export const processImageFromUrl = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    const user = req.user;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }

    // Validate URL
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Check if user can process image
    const canProcess = user.canProcessImage();
    if (!canProcess.canProcess) {
      return res.status(403).json({
        success: false,
        error: canProcess.reason
      });
    }

    // Download image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // Get plan-based resolution settings
    const resolution = user.getAllowedResolution();

    // Process image
    const startTime = Date.now();
    const processedBuffer = await ImageService.processImage(
      imageBuffer,
      user.plan,
      user.plan === 'pro'
    );
    const processingTime = Date.now() - startTime;

    // Increment user's image count
    await user.incrementProcessedImages();

    // Generate download filename
    const urlName = new URL(imageUrl).pathname.split('/').pop() || 'image';
    const downloadFilename = ImageService.generateDownloadFilename(urlName);

    // Set response headers
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${downloadFilename}"`,
      'Content-Length': processedBuffer.length,
      'X-Processing-Time': `${processingTime}ms`,
      'X-Plan-Used': user.plan,
      'X-Resolution': resolution.label,
      'X-Images-Remaining': canProcess.remaining - 1
    });

    // Send the processed image
    res.send(processedBuffer);

  } catch (error) {
    console.error('❌ URL image processing error:', error);
    next(error);
  }
};

// @desc    Get user's image processing stats
// @route   GET /api/images/stats
// @access  Private
export const getImageStats = async (req, res, next) => {
  try {
    const user = req.user;
    const canProcess = user.canProcessImage();
    const resolution = user.getAllowedResolution();

    const stats = {
      plan: user.plan,
      planExpiry: user.planExpiry,
      isPlanActive: user.isPlanActive(),
      totalImagesProcessed: user.imagesProcessed,
      monthlyImagesUsed: user.monthlyImagesUsed,
      monthlyLimit: canProcess.limit,
      imagesRemaining: canProcess.remaining,
      monthlyResetDate: user.monthlyResetDate,
      allowedResolution: resolution.label,
      maxWidth: resolution.width,
      maxHeight: resolution.height,
      canProcess: canProcess.canProcess,
      canUseRemoveBg: user.plan === 'pro'
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test image processing (for development)
// @route   POST /api/images/test
// @access  Private
export const testImageProcessing = async (req, res, next) => {
  try {
    const user = req.user;
    const resolution = user.getAllowedResolution();

    // Create a simple test image
    const testImage = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 100, g: 200, b: 100 }
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="800" height="600">
          <rect x="100" y="100" width="200" height="200" fill="red" />
          <circle cx="400" cy="300" r="100" fill="blue" />
          <text x="250" y="400" font-size="40" fill="white">Test Image</text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .png()
    .toBuffer();

    // Process the test image
    const processedBuffer = await ImageService.processImage(
      testImage,
      user.plan,
      user.plan === 'pro'
    );

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="test_processed.png"'
    });

    res.send(processedBuffer);

  } catch (error) {
    next(error);
  }
};