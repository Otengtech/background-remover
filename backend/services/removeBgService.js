import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

class RemoveBgService {
  constructor() {
    this.apiKey = process.env.REMOVE_BG_API_KEY;
    this.baseUrl = "https://api.remove.bg/v1.0/removebg";

    if (!this.apiKey) {
      console.error("❌ REMOVE_BG_API_KEY is not configured");
    }
  }

  /**
   * Get plan-based configuration (STRICTLY VALID)
   */
  getPlanConfig(userPlan = "free", options = {}) {
    const configs = {
      free: {
        size: "auto", // ONLY allowed for free
      },

      basic: {
        size: "regular",
        format: "png",
        bg_color: options.bg_color || "transparent",
        crop: options.crop || false,
      },

      pro: {
        size: "hd",
        format: options.format || "png",
        bg_color: options.bg_color || "transparent",
        crop: options.crop || false,
        crop_margin: options.crop_margin || "0px",
        scale: options.scale || "original",
        position: options.position || "original",
        add_shadow: options.add_shadow || false,
        semitransparency: true,
      },
    };

    return configs[userPlan] || configs.free;
  }

  /**
   * Remove background using remove.bg
   */
  async processImage(imageBuffer, userPlan = "free", options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error("Remove.bg API key missing");
      }

      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error("Invalid or empty image buffer");
      }

      const config = this.getPlanConfig(userPlan, options);

      const mimeType = options.mimetype || "image/jpeg";
      const extension = mimeType.split("/")[1] || "jpg";

      console.log(
        `🔄 remove.bg → plan: ${userPlan}, size: ${config.size}, type: ${mimeType}`
      );

      const formData = new FormData();

      formData.append("image_file", imageBuffer, {
        filename: `image_${Date.now()}.${extension}`,
        contentType: mimeType,
      });

      // Append ONLY valid params
      Object.entries(config).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const response = await axios.post(this.baseUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": this.apiKey,
        },
        responseType: "arraybuffer",
        timeout: 30000,
        maxBodyLength: Infinity,
      });

      return {
        success: true,
        buffer: Buffer.from(response.data),
        size: response.data.length,
        format: config.format || "png",
        rateLimit: {
          remaining: response.headers["x-ratelimit-remaining"] || null,
          reset: response.headers["x-ratelimit-reset"] || null,
        },
      };
    } catch (error) {
      const status = error.response?.status || 500;

      let message = "Image processing failed";

      if (status === 400) message = "Invalid image or parameters";
      if (status === 402) message = "remove.bg credits exhausted";
      if (status === 403) message = "Invalid remove.bg API key";
      if (status === 413) message = "Image too large";
      if (status === 429) message = "Rate limit exceeded";

      console.error("❌ remove.bg error:", status, error.message);

      throw {
        success: false,
        statusCode: status,
        message,
      };
    }
  }

  /**
   * Check remove.bg account status
   */
  async checkAccountStatus() {
    try {
      const response = await axios.get(
        "https://api.remove.bg/v1.0/account",
        {
          headers: {
            "X-Api-Key": this.apiKey,
          },
        }
      );

      return {
        success: true,
        credits:
          response.data?.data?.attributes?.credits?.remaining ?? 0,
        plan: response.data?.data?.attributes?.plan || "unknown",
      };
    } catch (error) {
      console.error("❌ remove.bg account check failed:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new RemoveBgService();
