import dotenv from 'dotenv';
dotenv.config();

export const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  baseUrl: 'https://api.paystack.co',
  
  // Plan IDs (you'll create these in Paystack dashboard)
  plans: {
    basic: process.env.PAYSTACK_BASIC_PLAN_ID,
    pro: process.env.PAYSTACK_PRO_PLAN_ID
  },
  
  // Webhook secret for verifying Paystack calls
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET
};

// Validate config
if (!paystackConfig.secretKey) {
  console.error('❌ PAYSTACK_SECRET_KEY is not configured!');
}

if (!paystackConfig.publicKey) {
  console.error('❌ PAYSTACK_PUBLIC_KEY is not configured!');
}