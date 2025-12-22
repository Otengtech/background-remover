import axios from 'axios';
import dotenv from "dotenv"
dotenv.config()

class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.baseURL = 'https://api.paystack.co';
  }

  // Initialize transaction
  async initializeTransaction(email, amount, metadata = {}) {
    try {
      // Paystack expects amount in kobo (100 kobo = 1 GHS)
      const amountInKobo = Math.round(amount * 100);
      
      console.log(`💰 Converting ${amount} GHS to ${amountInKobo} kobo`);
      
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        {
          email,
          amount: amountInKobo,
          currency: 'GHS',
          metadata,
          callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment_callback=true`
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Paystack initialization response:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Paystack initialization error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initialization failed'
      };
    }
  }

  // Verify transaction
  async verifyTransaction(reference) {
    try {
      console.log(`🔍 Verifying transaction: ${reference}`);
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );

      console.log('✅ Paystack verification response:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Paystack verification error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Payment verification failed'
      };
    }
  }
}

export default new PaystackService();