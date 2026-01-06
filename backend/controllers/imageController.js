import RemoveBgService from '../services/RemoveBgService.js';

class ImageController {
  // Remove background
  async removeBackground(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      console.log(`📸 Processing image: ${req.file.originalname}`);
      
      // Process with remove.bg
      const result = await RemoveBgService.processImage(req.file.buffer);

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove background');
      }

      // Set response headers
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.buffer.length,
        'X-Resolution': result.resolution,
        'X-Processing-Time': result.processingTime,
        'X-File-Size': result.size,
        'X-Original-Size': req.file.size
      });

      // Send the processed image
      res.send(result.buffer);

    } catch (error) {
      console.error('❌ Controller error:', error.message);
      
      let statusCode = 500;
      let errorMessage = 'Failed to remove background';

      if (error.message.includes('Invalid image')) {
        statusCode = 400;
        errorMessage = 'Invalid image file';
      } else if (error.message.includes('too large')) {
        statusCode = 413;
        errorMessage = 'Image file is too large';
      } else if (error.message.includes('credits')) {
        statusCode = 402;
        errorMessage = 'Processing credits exhausted';
      } else if (error.message.includes('API key')) {
        statusCode = 500;
        errorMessage = 'Service configuration error';
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get stats
  async getStats(req, res) {
    try {
      const stats = await RemoveBgService.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get stats'
      });
    }
  }

  // Get account status
  async getAccountStatus(req, res) {
    try {
      const status = await RemoveBgService.getAccountStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get account status'
      });
    }
  }
}

export default new ImageController();