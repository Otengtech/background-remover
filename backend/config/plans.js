const plans = {
  free: {
    name: 'Free',
    price: 0,
    imagesPerMonth: 10,
    resolution: '360p',
    maxFileSize: 5, // MB
    duration: null,
    features: [
      '10 images per month',
      '360p resolution',
      'Basic background removal',
      'JPG & PNG format',
      'Community support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 0.02, // GHS
    imagesPerMonth: 'unlimited',
    resolution: '4K Ultra HD',
    maxFileSize: 25, // MB
    duration: 30, // days
    features: [
      'Unlimited images',
      '4K Ultra HD resolution',
      'Premium AI processing',
      'All formats + TIFF',
      'Instant processing',
      'Commercial license',
      '24/7 priority support'
    ]
  }
};

// Calculate expiry date
const calculateExpiryDate = (planType) => {
  if (planType === 'free') return null;
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  return expiryDate;
};

// Get price in kobo for Paystack
const getPriceInKobo = (planType) => {
  const price = plans[planType].price;
  return Math.round(price * 100); // Convert GHS to kobo
};

export { plans, calculateExpiryDate, getPriceInKobo };