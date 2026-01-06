import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';

class RemoveBgService {
  constructor() {
    this.apiKey = process.env.REMOVE_BG_API_KEY;
    this.baseUrl = 'https://api.remove.bg/v1.0/removebg';
    
    if (!this.apiKey) {
      console.error('❌ REMOVE_BG_API_KEY is not configured');
    } else {
      console.log('✅ Remove.bg Service initialized');
    }
  }

  // Process image with remove.bg
  async processImage(imageBuffer) {
    const startTime = Date.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('Remove.bg API key is not configured');
      }

      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Invalid image buffer');
      }

      console.log(`📊 Image size: ${(imageBuffer.length / (1024 * 1024)).toFixed(2)}MB`);

      // Get original image metadata
      const originalMetadata = await sharp(imageBuffer).metadata();
      console.log(`📐 Original dimensions: ${originalMetadata.width}x${originalMetadata.height}`);

      // Prepare form data for remove.bg
      const formData = new FormData();
      formData.append('image_file', imageBuffer, {
        filename: `image_${Date.now()}.jpg`,
        contentType: 'image/jpeg'
      });
      
      // Configure for high quality
      formData.append('size', 'auto'); // Auto detect best size
      formData.append('type', 'auto'); // Auto detect subject
      formData.append('format', 'png');
      formData.append('channels', 'rgba');
      formData.append('bg_color', 'transparent');
      formData.append('semitransparency', 'true');

      // Call remove.bg API
      console.log('🚀 Calling remove.bg API...');
      const response = await axios.post(this.baseUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': this.apiKey,
        },
        responseType: 'arraybuffer',
        timeout: 60000,
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('Empty response from remove.bg');
      }

      // Verify it's a PNG
      const magicNumber = response.data.slice(0, 8).toString('hex');
      const isPNG = magicNumber === '89504e470d0a1a0a';
      
      if (!isPNG) {
        // Might be an error message
        const errorText = Buffer.from(response.data).toString('utf-8');
        console.error('Remove.bg error response:', errorText.substring(0, 200));
        throw new Error('Invalid response from remove.bg API');
      }

      // Get processed image metadata
      const processedMetadata = await sharp(response.data).metadata();
      const processingTime = Date.now() - startTime;

      console.log(`✅ Background removed successfully!`);
      console.log(`📐 Processed dimensions: ${processedMetadata.width}x${processedMetadata.height}`);
      console.log(`🎨 Has transparency: ${processedMetadata.hasAlpha}`);
      console.log(`⏱️ Processing time: ${processingTime}ms`);
      console.log(`💾 Output size: ${(response.data.length / (1024 * 1024)).toFixed(2)}MB`);

      // Generate filename
      const timestamp = Date.now();
      const filename = `background-removed_${timestamp}.png`;

      return {
        success: true,
        buffer: Buffer.from(response.data),
        filename: filename,
        size: response.data.length,
        processingTime: processingTime,
        resolution: `${processedMetadata.width}x${processedMetadata.height}`,
        hasTransparency: processedMetadata.hasAlpha || false,
        originalSize: imageBuffer.length
      };

    } catch (error) {
      console.error('❌ Remove.bg processing error:', error.message);
      
      let errorDetails = 'Failed to remove background';
      let apiError = null;

      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        
        if (error.response.data) {
          try {
            const errorText = Buffer.from(error.response.data).toString('utf-8');
            console.error('Error details:', errorText.substring(0, 500));
            
            try {
              apiError = JSON.parse(errorText);
              if (apiError.errors && apiError.errors[0]) {
                errorDetails = apiError.errors[0].title;
              }
            } catch (e) {
              errorDetails = 'API returned an error';
            }
          } catch (e) {
            console.error('Binary error data');
          }
        }

        // Handle specific status codes
        switch (error.response.status) {
          case 400:
            errorDetails = 'Invalid image. Try a clearer image with distinct foreground.';
            break;
          case 402:
            errorDetails = 'Processing credits exhausted. Please try again later.';
            break;
          case 403:
            errorDetails = 'API authentication failed. Check your API key.';
            break;
          case 413:
            errorDetails = 'Image file is too large. Maximum size is 25MB.';
            break;
          case 429:
            errorDetails = 'Too many requests. Please wait a moment.';
            break;
          default:
            errorDetails = `API error (${error.response.status})`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorDetails = 'Request timeout. The image might be too large or the server is busy.';
      } else if (error.message.includes('API key')) {
        errorDetails = 'Service configuration error. Contact support.';
      }

      throw {
        success: false,
        error: errorDetails,
        originalError: error.message,
        apiError: apiError
      };
    }
  }

  // Get account status
  async getAccountStatus() {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'API key not configured'
        };
      }

      const response = await axios.get('https://api.remove.bg/v1.0/account', {
        headers: {
          'X-Api-Key': this.apiKey,
        },
        timeout: 10000,
      });

      const data = response.data?.data?.attributes || {};
      const credits = data.credits || {};
      
      const remaining = (credits.total || 0) - (credits.used || 0);
      
      console.log('📊 Remove.bg Account Status:');
      console.log('   Plan:', data.plan || 'free');
      console.log('   Credits:', `${remaining}/${credits.total || 0}`);
      console.log('   API calls:', credits.api_calls || 0);

      return {
        success: true,
        plan: data.plan || 'free',
        credits: {
          total: credits.total || 0,
          used: credits.used || 0,
          remaining: remaining,
          apiCalls: credits.api_calls || 0
        }
      };
    } catch (error) {
      console.error('❌ Failed to get account status:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get service stats
  async getStats() {
    try {
      const accountStatus = await this.getAccountStatus();
      
      return {
        service: 'remove.bg',
        status: 'operational',
        account: accountStatus.success ? accountStatus : { error: 'Cannot fetch account info' },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'remove.bg',
        status: 'unknown',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new RemoveBgService();