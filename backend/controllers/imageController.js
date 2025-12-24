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
          code: 'QUOTA_EXCEEDED',
          current: canProcess.current,
          limit: canProcess.limit,
          remaining: canProcess.remaining
        });
      }

      // Debug: Check file details
      console.log('📊 File upload details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        bufferLength: req.file.buffer?.length,
        sizeKB: (req.file.buffer?.length / 1024).toFixed(2),
        hasBuffer: !!req.file.buffer && req.file.buffer.length > 100
      });

      // Get processing options from request
      const options = {
        bg_color: req.body.bg_color,
        bg_image_url: req.body.bg_image_url,
        format: req.body.format,
        crop: req.body.crop,
        scale: req.body.scale
      };

      console.log(`🖼️ Processing image for ${user.email} (${user.plan} plan)`);

      try {
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
        const headers = {
          'Content-Type': `image/${result.format}`,
          'Content-Disposition': `attachment; filename="${downloadFilename}"`,
          'Content-Length': result.buffer.length,
          'X-Processing-Time': `${result.processingTime || 0}ms`,
          'X-Plan': user.plan,
          'X-Images-Remaining': canProcess.remaining - 1,
          'X-Monthly-Limit': canProcess.limit
        };

        // Add resolution and file size if available
        if (result.processedInfo) {
          headers['X-Resolution'] = `${result.processedInfo.width}x${result.processedInfo.height}`;
          headers['X-File-Size'] = `${result.processedInfo.sizeMB}MB`;
        } else if (result.metadata) {
          headers['X-Resolution'] = 'unknown';
          headers['X-File-Size'] = `${(result.buffer.length / 1024 / 1024).toFixed(2)}MB`;
        }

        res.set(headers);

        // Send the processed image
        res.send(result.buffer);

      } catch (serviceError) {
        console.error('❌ ImageService error:', serviceError);
        
        // If remove.bg fails but we have a fallback, it should have been handled
        // If we reach here, all processing methods failed
        throw {
          message: serviceError.message || 'All image processing methods failed',
          statusCode: serviceError.statusCode || 500
        };
      }

    } catch (error) {
      console.error('❌ Controller error:', error);
      
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to process image',
        code: error.code || 'PROCESSING_ERROR'
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

      // Get content type and size
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      console.log(`📥 Downloaded: ${contentType}, ${contentLength} bytes`);

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
      const headers = {
        'Content-Type': `image/${result.format}`,
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': result.buffer.length,
        'X-Processing-Time': `${result.processingTime || 0}ms`,
        'X-Plan': user.plan,
        'X-Images-Remaining': canProcess.remaining - 1
      };

      // Add resolution and file size if available
      if (result.processedInfo) {
        headers['X-Resolution'] = `${result.processedInfo.width}x${result.processedInfo.height}`;
        headers['X-File-Size'] = `${result.processedInfo.sizeMB}MB`;
      }

      res.set(headers);
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
        canProcess: canProcess.canProcess,
        // Add resolution info
        maxResolution: user.getPlanResolutionLabel(),
        resolutionSettings: user.getPlanResolutionSettings()
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
          timestamp: new Date().toISOString(),
          apiKeyConfigured: !!status.apiKeyConfigured
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to check service status'
      });
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'RemoveIt Image Processing API'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Service unavailable'
      });
    }
  }

  /**
   * Test endpoint for debugging
   */
  async testEndpoint(req, res) {
    try {
      console.log('🧪 Test endpoint called');
      
      // Test with a simple image or echo
      res.status(200).json({
        success: true,
        data: {
          message: 'API is working',
          timestamp: new Date().toISOString(),
          user: req.user ? {
            id: req.user._id,
            email: req.user.email,
            plan: req.user.plan
          } : 'No user authenticated'
        }
      });
    } catch (error) {
      console.error('Test endpoint error:', error);
      res.status(500).json({
        success: false,
        error: 'Test failed'
      });
    }
  }
}

export default new ImageController();