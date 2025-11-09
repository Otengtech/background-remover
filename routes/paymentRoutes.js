// routes/paymentRoutes.js
import express from "express";
import axios from "axios";

const router = express.Router();

// 🚨 Check if process is available
console.log('🔧 Payment Routes - Process check:', typeof process !== 'undefined' ? 'Available' : 'Undefined');

// 🚨 Get the secret key
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

console.log('🔑 Payment Routes Loaded - Secret Key Status:', {
  hasKey: !!SECRET_KEY,
  keyPreview: SECRET_KEY ? SECRET_KEY.substring(0, 10) + '...' : 'MISSING!'
});

// Simple test route
router.get('/test', (req, res) => {
  res.json({ 
    message: "Payment routes working",
    processAvailable: typeof process !== 'undefined',
    secretKeyExists: !!SECRET_KEY
  });
});

router.post('/verify-payment', async (req, res) => {
  console.log('🎯 Verify Payment Called');
  console.log('🔑 SECRET_KEY available:', !!SECRET_KEY);
  
  // Check if secret key is available
  if (!SECRET_KEY) {
    console.error('❌ PAYSTACK_SECRET_KEY is missing!');
    return res.status(500).json({
      success: false,
      error: "Server configuration error",
      details: "Paystack secret key not configured"
    });
  }

  const { reference } = req.body;
  
  if (!reference) {
    return res.status(400).json({ 
      success: false, 
      error: "Reference is required" 
    });
  }

  try {
    console.log('📞 Calling Paystack with reference:', reference);
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
        },
        timeout: 10000,
      }
    );

    console.log('✅ Paystack response received');
    
    if (response.data.data.status === 'success') {
      res.json({ 
        success: true, 
        data: response.data.data 
      });
    } else {
      res.json({ 
        success: false, 
        error: `Payment status: ${response.data.data.status}` 
      });
    }
  }catch (error) {
  console.error('💥 FULL VERIFICATION ERROR:');
  
  if (error.response) {
    // Paystack returned an error
    console.error('📊 Paystack Response:', {
      status: error.response.status,
      data: error.response.data,
      reference: reference
    });
    
    if (error.response.status === 404) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found - Invalid reference"
      });
    }
    
    return res.status(error.response.status).json({
      success: false,
      error: error.response.data.message || "Paystack API error"
    });
  }
  
  console.error('📡 Network Error:', error.message);
  res.status(500).json({ 
    success: false, 
    error: "Network error during verification" 
  });
  }
});

export default router;