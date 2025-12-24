import ImageService from '../services/imageService.js';
import User from '../models/User.js';

class ImageController {
  /**
   * Process uploaded image
   */
  async processImage(req, res) {
    try {
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
          error: canProcess.reason,
          code: 'QUOTA_EXCEEDED'
        });
      }

      // Get processing options from request
      const options = {
        bg_color: req.body.bg_color,
        bg_image_url: req.body.bg_image_url,
        format: req.body.format,
        crop: req.body.crop,
        scale: req.body.scale
      };

      console.log(`🖼️ Processing image for ${user.email} (${user.plan} plan)`);

      // Process image using remove.bg
      const result = await ImageService.processImage(
        req.file.buffer,
        user.plan,
        options
      );

      // Increment user's image count
      await user.incrementProcessedImages();

      // Generate download filename
      const downloadFilename = ImageService.generateDownloadFilename(
        req.file.originalname,
        user.plan
      );

      // Set response headers
      res.set({
        'Content-Type': `image/${result.format}`,
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': result.buffer.length,
        'X-Processing-Time': `${result.processingTime}ms`,
        'X-Plan': user.plan,
        'X-Images-Remaining': canProcess.remaining - 1,
        'X-Monthly-Limit': canProcess.limit,
        'X-Resolution': `${result.processedInfo.width}x${result.processedInfo.height}`,
        'X-File-Size': `${result.processedInfo.sizeMB}MB`
      });

      // Send the processed image
      res.send(result.buffer);

    } catch (error) {
      console.error('❌ Controller error:', error);
      
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to process image',
        code: 'PROCESSING_ERROR'
      });
    }
  }

  /**
   * Process image from URL
   */
  async processImageFromUrl(req, res) {
    try {
      const { image_url, ...options } = req.body;
      const user = req.user;

      if (!image_url) {
        return res.status(400).json({
          success: false,
          error: 'Image URL is required'
        });
      }

      // Validate URL
      try {
        new URL(image_url);
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
          error: canProcess.reason,
          code: 'QUOTA_EXCEEDED'
        });
      }

      // Download image from URL
      console.log(`🌐 Downloading image from URL for ${user.email}`);
      
      const response = await fetch(image_url, {
        headers: {
          'User-Agent': 'RemoveIt-Background-Remover/1.0'
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());

      // Process the downloaded image
      const result = await ImageService.processImage(
        imageBuffer,
        user.plan,
        options
      );

      // Increment user's image count
      await user.incrementProcessedImages();

      // Generate download filename
      const urlName = image_url.split('/').pop()?.split('?')[0] || 'image';
      const downloadFilename = ImageService.generateDownloadFilename(urlName, user.plan);

      // Set response headers
      res.set({
        'Content-Type': `image/${result.format}`,
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': result.buffer.length,
        'X-Processing-Time': `${result.processingTime}ms`,
        'X-Plan': user.plan,
        'X-Images-Remaining': canProcess.remaining - 1
      });

      res.send(result.buffer);

    } catch (error) {
      console.error('❌ URL processing error:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process image from URL',
        code: 'URL_PROCESSING_ERROR'
      });
    }
  }

  /**
   * Get user stats
   */
  async getImageStats(req, res) {
    try {
      const user = req.user;
      const canProcess = user.canProcessImage();

      const stats = {
        plan: user.plan,
        isPlanActive: user.isPlanActive(),
        planExpiry: user.planExpiry,
        planRemainingDays: user.getPlanRemainingDays(),
        totalImagesProcessed: user.imagesProcessed,
        monthlyImagesUsed: user.monthlyImagesUsed,
        monthlyLimit: canProcess.limit || 0,
        imagesRemaining: canProcess.remaining || 0,
        monthlyResetDate: user.monthlyResetDate,
        canProcess: canProcess.canProcess
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch stats'
      });
    }
  }

  /**
   * Check service status
   */
  async getServiceStatus(req, res) {
    try {
      const status = await ImageService.checkServiceStatus();
      
      res.status(200).json({
        success: true,
        data: {
          removeBg: status.removeBgActive,
          credits: status.credits,
          totalCalls: status.totalCalls,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to check service status'
      });
    }
  }
}

export default new ImageController(); // This exports an instance