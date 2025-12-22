import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../service/api';
import {
  FiCheck,
  FiArrowLeft,
  FiCreditCard,
  FiShield,
  FiClock,
  FiAlertCircle,
  FiLoader,
  FiExternalLink
} from 'react-icons/fi';

const Checkout = () => {
  const { plan } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentData, setPaymentData] = useState(null);

  const plans = {
    basic: {
      name: 'Basic Plan',
      price: '₵0.20',
      amount: 0.2,
      duration: '30 days',
      features: [
        '100 images per month',
        'HD Resolution (1080p)',
        'Priority processing',
        'All formats (PNG, JPG, WebP)',
        'No watermark'
      ]
    },
    pro: {
      name: 'Pro Plan',
      price: '₵5.00',
      amount: 5,
      duration: '30 days',
      features: [
        'Unlimited images',
        '4K Ultra HD Resolution',
        'Instant processing',
        'All formats + TIFF',
        'Commercial license',
        'API access',
        '24/7 Priority support'
      ]
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/checkout/${plan}` } });
      return;
    }

    if (!['basic', 'pro'].includes(plan)) {
      navigate('/pricing');
      return;
    }

    if (user?.plan === plan && user?.isPlanActive()) {
      navigate('/dashboard');
      return;
    }

    // Check if there's a reference in URL (callback from Paystack)
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference');
    const trxref = params.get('trxref');
    
    const paymentRef = ref || trxref;
    
    if (paymentRef) {
      console.log('🔍 Payment reference found in URL:', paymentRef);
      setReference(paymentRef);
      verifyPayment(paymentRef);
    } else {
      console.log('🔄 No reference found, normal checkout flow');
    }
  }, [plan, isAuthenticated, user]);

  const initializePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('💰 Initializing payment for plan:', plan);
      const response = await api.post('/payments/initialize', { plan });
      
      if (response.data.success) {
        const data = response.data.data;
        setPaymentData(data);
        setReference(data.reference);
        
        console.log('✅ Payment initialized, redirecting to:', data.authorization_url);
        
        // IMPORTANT: Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        setError(response.data.error || 'Failed to initialize payment');
        console.error('❌ Payment initialization failed:', response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment initialization failed');
      console.error('❌ Payment initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (ref) => {
    setVerifying(true);
    setError('');
    
    try {
      console.log('🔍 Verifying payment reference:', ref);
      const response = await api.post('/payments/verify', { reference: ref });
      
      if (response.data.success) {
        console.log('✅ Payment verified successfully');
        setPaymentStatus('success');
        
        // Update user context if needed
        // You might want to refresh user data here
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        console.error('❌ Payment verification failed:', response.data.error);
        setPaymentStatus('failed');
        setError(response.data.error || 'Payment verification failed');
      }
    } catch (err) {
      console.error('❌ Payment verification error:', err);
      setPaymentStatus('failed');
      setError(err.response?.data?.error || 'Payment verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const currentPlan = plans[plan];

  if (!currentPlan) {
    return (
      <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Plan</h1>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-primary"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to Pricing
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Complete Your Purchase</h1>
            <p className="text-gray-400 mb-8">You're upgrading to {currentPlan.name}</p>

            {/* Order Summary Card */}
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-white font-medium">{currentPlan.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white font-medium">{currentPlan.duration}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price</span>
                  <span className="text-2xl font-bold text-white">{currentPlan.price}</span>
                </div>
              </div>

              <div className="border-t border-gray-800 my-6 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total</span>
                  <span className="text-3xl font-bold text-white">{currentPlan.price}</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">All prices in Ghanaian Cedis (GHS)</p>
              </div>
            </div>

            {/* Features */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-4">What you'll get:</h3>
              <ul className="space-y-3">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Payment Status */}
          <div>
            <div className="card">
              {verifying ? (
                <div className="text-center py-12">
                  <FiLoader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-6" />
                  <h3 className="text-lg font-bold text-white mb-2">Verifying Payment</h3>
                  <p className="text-gray-400">Please wait while we confirm your payment...</p>
                </div>
              ) : paymentStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
                    <FiCheck className="text-white text-3xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Payment Successful! 🎉</h2>
                  <p className="text-gray-400 mb-8">
                    Your {currentPlan.name} has been activated. Redirecting to dashboard...
                  </p>
                  <div className="flex justify-center">
                    <FiLoader className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                </div>
              ) : paymentStatus === 'failed' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center mx-auto mb-6">
                    <FiAlertCircle className="text-white text-3xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Payment Failed</h2>
                  <p className="text-gray-400 mb-6">{error || 'Something went wrong with your payment.'}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-primary w-full"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-6">Payment Details</h2>
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <FiAlertCircle className="text-red-400 mt-1" />
                        <div>
                          <p className="text-red-400">{error}</p>
                          <button
                            onClick={initializePayment}
                            className="text-red-300 hover:text-red-200 text-sm mt-2"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Payment Methods Info */}
                    <div className="p-4 rounded-lg bg-gray-900/50">
                      <div className="flex items-center gap-3 mb-4">
                        <FiExternalLink className="text-primary-500" />
                        <span className="text-white font-medium">External Payment</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        You'll be redirected to Paystack's secure payment page to complete your transaction.
                        Paystack supports all major payment methods in Ghana.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">Mobile Money</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">Visa/MasterCard</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">Bank Transfer</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">Visa QR</span>
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="flex items-start gap-3">
                      <FiShield className="text-green-500 mt-1" />
                      <div>
                        <p className="text-white font-medium">Secure Payment</p>
                        <p className="text-gray-400 text-sm">
                          Your payment is processed securely on Paystack's platform. We never see or store your payment details.
                        </p>
                      </div>
                    </div>

                    {/* Processing Info */}
                    <div className="flex items-start gap-3">
                      <FiClock className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-white font-medium">Instant Activation</p>
                        <p className="text-gray-400 text-sm">
                          Your plan will be activated immediately after successful payment.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <button
                        onClick={initializePayment}
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <FiLoader className="animate-spin" />
                            Preparing payment...
                          </>
                        ) : (
                          <>
                            Pay {currentPlan.price} via Paystack
                            <FiExternalLink />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => navigate('/pricing')}
                        className="btn-secondary w-full"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment Flow Info */}
            <div className="mt-6 text-sm text-gray-500">
              <p className="mb-2">Payment Flow:</p>
              <ol className="space-y-2 ml-4 list-decimal">
                <li>Click "Pay via Paystack" button</li>
                <li>You'll be redirected to Paystack's secure payment page</li>
                <li>Complete payment using your preferred method</li>
                <li>Paystack will redirect you back to our site</li>
                <li>We'll verify and activate your plan automatically</li>
              </ol>
            </div>

            {/* Reference Info */}
            {reference && (
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  Reference: <span className="font-mono text-gray-400">{reference}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;