import axios from 'axios';
import FormData from 'form-data';

class RemoveBgService {
  constructor() {
    this.apiKey = process.env.REMOVE_BG_API_KEY;
    this.baseUrl = 'https://api.remove.bg/v1.0/removebg';
    
    if (!this.apiKey) {
      console.error('❌ REMOVE_BG_API_KEY is not configured');
    }
  }

  /**
   * Get plan-based parameters for remove.bg API
   */
  getPlanConfig(userPlan, options = {}) {
    const configs = {
      free: {
        size: 'preview',           // 0.25MP (625x625 max)
        quality: 'regular',
        channels: 'rgba',
        format: 'png',
        type: 'auto',
        bg_color: options.bg_color || 'transparent',
        bg_image_url: options.bg_image_url || null
      },
      basic: {
        size: 'regular',           // 10MP (4000x4000 max)
        quality: 'hd',
        channels: 'rgba',
        format: 'png',
        type: 'auto',
        bg_color: options.bg_color || 'transparent',
        bg_image_url: options.bg_image_url || null,
        crop: options.crop || false,
        scale: options.scale || 'original',
        position: options.position || 'original'
      },
      pro: {
        size: 'hd',                // 25MP (6000x6000 max)
        quality: 'hd',
        channels: 'rgba',
        format: options.format || 'png',
        type: 'auto',
        bg_color: options.bg_color || 'transparent',
        bg_image_url: options.bg_image_url || null,
        crop: options.crop || false,
        crop_margin: options.crop_margin || '0px',
        scale: options.scale || 'original',
        position: options.position || 'original',
        add_shadow: options.add_shadow || false,
        semitransparency: true
      }
    };
    
    return configs[userPlan] || configs.free;
  }

  /**
   * Process image using remove.bg API
   */
  async processImage(imageBuffer, userPlan = 'free', options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('Remove.bg API key not configured');
      }

      const config = this.getPlanConfig(userPlan, options);
      
      console.log(`🔄 Processing with remove.bg for ${userPlan} plan, size: ${config.size}`);

      const formData = new FormData();
      formData.append('image_file', imageBuffer, {
        filename: `image_${Date.now()}.jpg`,
        contentType: 'image/jpeg'
      });

      // Add all parameters
      Object.keys(config).forEach(key => {
        if (config[key] !== null && config[key] !== undefined) {
          formData.append(key, config[key]);
        }
      });

      const response = await axios.post(this.baseUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': this.apiKey
        },
        responseType: 'arraybuffer',
        timeout: 30000,
        maxContentLength: 100 * 1024 * 1024
      });

      // Parse response headers
      const rateLimitInfo = {
        remaining: response.headers['x-ratelimit-remaining'] || 'unknown',
        reset: response.headers['x-ratelimit-reset'] || 'unknown'
      };

      return {
        success: true,
        buffer: Buffer.from(response.data),
        format: config.format,
        size: response.data.length,
        rateLimit: rateLimitInfo,
        metadata: config
      };

    } catch (error) {
      console.error('Remove.bg API Error:', error.response?.status, error.message);
      
      let errorMessage = 'Failed to process image';
      let statusCode = 500;

      if (error.response) {
        statusCode = error.response.status;
        
        if (statusCode === 402) {
          errorMessage = 'Insufficient credits on remove.bg account';
        } else if (statusCode === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later';
        } else if (statusCode === 413) {
          errorMessage = 'Image file too large';
        } else if (statusCode === 422) {
          errorMessage = 'Unprocessable image. Please try another image';
        } else if (statusCode === 403) {
          errorMessage = 'Invalid API key';
        }
      }

      throw {
        message: errorMessage,
        statusCode: statusCode,
        originalError: error.message
      };
    }
  }

  /**
   * Check remove.bg account status
   */
  async checkAccountStatus() {
    try {
      const response = await axios.get('https://api.remove.bg/v1.0/account', {
        headers: {
          'X-Api-Key': this.apiKey
        }
      });

      return {
        success: true,
        credits: response.data.data?.attributes?.credits || 0,
        total: response.data.data?.attributes?.api.free_calls || 0
      };
    } catch (error) {
      console.error('Failed to check remove.bg account:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new RemoveBgService();