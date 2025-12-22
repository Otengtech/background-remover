import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

class ImageService {
  constructor() {
    this.removeBgApiKey = process.env.REMOVE_BG_API_KEY;
  }

  // Process image with plan-based resolution
  async processImage(imageBuffer, userPlan, useRemoveBg = false) {
    try {
      const planResolutions = {
        free: { maxWidth: 1280, maxHeight: 720, quality: 80 },
        basic: { maxWidth: 1920, maxHeight: 1080, quality: 90 },
        pro: { maxWidth: null, maxHeight: null, quality: 100 }
      };

      const { maxWidth, maxHeight, quality } = planResolutions[userPlan];

      // Use Remove.bg API if available and user requests it
      if (useRemoveBg && this.removeBgApiKey) {
        return await this.processWithRemoveBg(imageBuffer, maxWidth, maxHeight, quality);
      }

      // Use manual background removal with sharp
      return await this.processWithSharp(imageBuffer, maxWidth, maxHeight, quality);
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  // Process using Remove.bg API
  async processWithRemoveBg(imageBuffer, maxWidth, maxHeight, quality) {
    try {
      const formData = new FormData();
      const blob = new Blob([imageBuffer]);
      formData.append('image_file', blob, 'image.jpg');
      formData.append('size', 'auto');

      const response = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        formData,
        {
          headers: {
            'X-Api-Key': this.removeBgApiKey,
            'Content-Type': 'multipart/form-data'
          },
          responseType: 'arraybuffer'
        }
      );

      let resultBuffer = Buffer.from(response.data);

      // Resize if needed (for free/basic plans)
      if (maxWidth || maxHeight) {
        resultBuffer = await this.resizeImage(resultBuffer, maxWidth, maxHeight, quality);
      }

      return resultBuffer;
    } catch (error) {
      console.warn('Remove.bg API failed, falling back to manual removal:', error.message);
      return this.processWithSharp(imageBuffer, maxWidth, maxHeight, quality);
    }
  }

  // Process using Sharp (Manual background removal)
  async processWithSharp(imageBuffer, maxWidth, maxHeight, quality) {
    try {
      let image = sharp(imageBuffer);
      const metadata = await image.metadata();

      // Resize if needed
      if ((maxWidth && metadata.width > maxWidth) || (maxHeight && metadata.height > maxHeight)) {
        image = image.resize({
          width: maxWidth,
          height: maxHeight,
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Apply simple background removal (edge detection)
      const processedBuffer = await this.applySimpleBackgroundRemoval(image);

      // Convert to PNG with quality settings
      return await sharp(processedBuffer)
        .png({ 
          quality,
          compressionLevel: 9
        })
        .toBuffer();

    } catch (error) {
      throw new Error(`Sharp processing failed: ${error.message}`);
    }
  }

  // Simple background removal for Vercel compatibility
  async applySimpleBackgroundRemoval(image) {
    try {
      const { data, info } = await image
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const pixels = new Uint8ClampedArray(data);
      
      // Simple threshold-based background removal
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Simple logic: keep pixels that aren't near-white
        const isBackground = r > 240 && g > 240 && b > 240;
        
        if (isBackground) {
          pixels[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      return Buffer.from(pixels);
    } catch (error) {
      // If background removal fails, return original with transparency
      return await image.png().toBuffer();
    }
  }

  // Resize image utility
  async resizeImage(buffer, maxWidth, maxHeight, quality) {
    return await sharp(buffer)
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality })
      .toBuffer();
  }

  // Validate image file
  validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 20MB.');
    }

    return true;
  }
}

export default new ImageService();