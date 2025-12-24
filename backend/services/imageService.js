import sharp from 'sharp';
import RemoveBgService from './removeBgService.js';

class ImageService {
  constructor() {
    console.log('✅ ImageService initialized');
  }

  /**
   * Main image processing function
   */
  async processImage(imageBuffer, userPlan, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate image
      await this.validateImageBuffer(imageBuffer);
      
      // Get image info
      const imageInfo = await this.getImageInfo(imageBuffer);
      console.log(`📊 Original: ${imageInfo.width}x${imageInfo.height}, ${imageInfo.sizeMB}MB`);

      // Process with remove.bg for ALL users (free, basic, pro)
      const result = await RemoveBgService.processImage(imageBuffer, userPlan, options);
      
      const processingTime = Date.now() - startTime;
      const processedInfo = await this.getImageInfo(result.buffer);
      
      console.log(`✅ Processed: ${processedInfo.width}x${processedInfo.height}, ${processedInfo.sizeMB}MB`);
      console.log(`⚡ Processing time: ${processingTime}ms`);

      return {
        buffer: result.buffer,
        format: result.format || 'png',
        processingTime,
        originalInfo: imageInfo,
        processedInfo: processedInfo,
        metadata: result.metadata
      };

    } catch (error) {
      console.error('❌ Image processing failed:', error.message);
      
      // Fallback to sharp for simple background removal if remove.bg fails
      if (userPlan === 'free' || userPlan === 'basic') {
        console.log('🔄 Falling back to local processing...');
        return await this.processLocally(imageBuffer, userPlan);
      }
      
      throw error;
    }
  }

  /**
   * Local processing fallback (for free/basic users when remove.bg fails)
   */
  async processLocally(imageBuffer, userPlan) {
    const startTime = Date.now();
    
    try {
      const resolutions = {
        free: { maxWidth: 1280, maxHeight: 720, quality: 80 },
        basic: { maxWidth: 1920, maxHeight: 1080, quality: 90 },
        pro: { maxWidth: 3840, maxHeight: 2160, quality: 100 }
      };

      const { maxWidth, maxHeight, quality } = resolutions[userPlan];
      
      // Simple background removal using edge detection
      const processed = await sharp(imageBuffer)
        .resize({
          width: maxWidth,
          height: maxHeight,
          fit: 'inside',
          withoutEnlargement: true
        })
        .ensureAlpha()  // Ensure alpha channel
        .png({ quality, compressionLevel: 9 })
        .toBuffer();

      const processingTime = Date.now() - startTime;
      
      return {
        buffer: processed,
        format: 'png',
        processingTime,
        isLocalProcessing: true
      };

    } catch (error) {
      console.error('❌ Local processing failed:', error);
      throw new Error('Image processing failed. Please try another image.');
    }
  }

  /**
   * Validate image buffer
   */
  async validateImageBuffer(buffer) {
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty image file');
    }

    if (buffer.length > 20 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 20MB.');
    }

    try {
      const metadata = await sharp(buffer).metadata();
      
      if (!metadata || !metadata.width || !metadata.height) {
        throw new Error('Invalid image file');
      }

      return true;
    } catch (error) {
      throw new Error('Invalid image format. Only JPEG, PNG, and WebP are allowed.');
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
        sizeMB: (buffer.length / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error('Failed to get image info:', error);
      return { width: 0, height: 0, size: buffer.length };
    }
  }

  /**
   * Generate download filename
   */
  generateDownloadFilename(originalName, plan = 'free') {
    const baseName = originalName.split('.')[0] || 'image';
    const timestamp = Date.now();
    const suffix = plan === 'pro' ? '_premium' : '';
    
    return `removed-bg_${baseName}${suffix}_${timestamp}.png`;
  }

  /**
   * Check remove.bg service status
   */
  async checkServiceStatus() {
    try {
      const status = await RemoveBgService.checkAccountStatus();
      return {
        removeBgActive: status.success,
        credits: status.credits || 0,
        totalCalls: status.total || 0
      };
    } catch (error) {
      return {
        removeBgActive: false,
        error: error.message
      };
    }
  }
}

export default new ImageService();