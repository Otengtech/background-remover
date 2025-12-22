const plans = {
  free: {
    name: 'Free',
    price: 0,
    imagesPerMonth: 10,
    resolution: '720p',
    duration: null,
    features: [
      'Basic background removal',
      'Standard resolution (720p)',
      '10 images per month',
      'JPG & PNG format',
      'Community support'
    ]
  },
  basic: {
    name: 'Basic',
    price: 0.2,
    imagesPerMonth: 100,
    resolution: '1080p',
    duration: 30,
    features: [
      'Advanced AI processing',
      'HD resolution (1080p)',
      '100 images per month',
      'All formats (PNG, JPG, WebP)',
      'Priority processing',
      'No watermark',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 5,
    imagesPerMonth: 'unlimited',
    resolution: '4K',
    duration: 30,
    features: [
      'Premium AI processing',
      '4K Ultra HD resolution',
      'Unlimited images',
      'All formats + TIFF',
      'Instant processing',
      'Commercial license',
      'API access',
      '24/7 priority support',
      'White-label options'
    ]
  }
};

// Calculate expiry date based on plan
const calculateExpiryDate = (planType) => {
  if (planType === 'free') return null;
  
  const duration = plans[planType].duration;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + duration);
  return expiryDate;
};

// Get plan price in kobo (Paystack expects amount in kobo)
const getPriceInKobo = (planType) => {
  const price = plans[planType].price;
  return Math.round(price * 100);
};

export { plans, calculateExpiryDate, getPriceInKobo };