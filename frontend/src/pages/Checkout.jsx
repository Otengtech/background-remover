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
  const { user, isAuthenticated, updateUser } = useAuth(); // Added updateUser
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentData, setPaymentData] = useState(null);
  const [updatedUserData, setUpdatedUserData] = useState(null);

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
  }, [plan, isAuthenticated, user, navigate]);

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
        
        // Store reference in localStorage before redirecting
        localStorage.setItem('payment_reference', data.reference);
        
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
        console.log('📊 Updated user data:', response.data.data.user);
        setPaymentStatus('success');
        setUpdatedUserData(response.data.data.user);
        
        // ✅ CRITICAL FIX: Update user context with new data
        if (response.data.data.user && updateUser) {
          console.log('🔄 Updating global user context...');
          updateUser(response.data.data.user);
        }
        
        // Also store in localStorage as backup
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
        
        // Remove payment reference from localStorage
        localStorage.removeItem('payment_reference');
        
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

  const refreshUserData = async () => {
    try {
      console.log('🔄 Manually refreshing user data...');
      const response = await api.get('/auth/me'); // Adjust to your user endpoint
      if (response.data.success && updateUser) {
        updateUser(response.data.data);
        console.log('✅ User data refreshed');
      }
    } catch (err) {
      console.error('❌ Failed to refresh user data:', err);
    }
  };

  const currentPlan = plans[plan];

  if (!currentPlan) {
    return (
      <div className="checkout-error">
        <h1>Invalid Plan</h1>
        <button
          onClick={() => navigate('/pricing')}
          className="btn-primary"
        >
          Back to Pricing
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        {/* Back button */}
        <button
          onClick={() => navigate('/pricing')}
          className="back-button"
        >
          <FiArrowLeft /> Back to Pricing
        </button>

        <div className="checkout-grid">
          {/* Left Column - Order Summary */}
          <div className="order-column">
            <h1 className="checkout-title">Complete Your Purchase</h1>
            <p className="checkout-subtitle">You're upgrading to {currentPlan.name}</p>

            {/* Order Summary Card */}
            <div className="order-card">
              <h2>Order Summary</h2>
              
              <div className="order-details">
                <div className="order-row">
                  <span>Plan</span>
                  <span className="plan-name">{currentPlan.name}</span>
                </div>
                
                <div className="order-row">
                  <span>Duration</span>
                  <span>{currentPlan.duration}</span>
                </div>
                
                <div className="order-row">
                  <span>Price</span>
                  <span className="plan-price">{currentPlan.price}</span>
                </div>
              </div>

              <div className="order-divider">
                <div className="order-total">
                  <span>Total</span>
                  <span className="total-price">{currentPlan.price}</span>
                </div>
                <p className="currency-note">All prices in Ghanaian Cedis (GHS)</p>
              </div>
            </div>

            {/* Features */}
            <div className="features-card">
              <h3>What you'll get:</h3>
              <ul className="features-list">
                {currentPlan.features.map((feature, index) => (
                  <li key={index}>
                    <FiCheck className="feature-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Payment Status */}
          <div className="payment-column">
            <div className="payment-card">
              {verifying ? (
                <div className="verifying-state">
                  <FiLoader className="verifying-spinner" />
                  <h3>Verifying Payment</h3>
                  <p>Please wait while we confirm your payment...</p>
                </div>
              ) : paymentStatus === 'success' ? (
                <div className="success-state">
                  <div className="success-icon-circle">
                    <FiCheck className="success-icon" />
                  </div>
                  <h2>Payment Successful! 🎉</h2>
                  <p>
                    Your {currentPlan.name} has been activated. Redirecting to dashboard...
                  </p>
                  
                  {updatedUserData && (
                    <div className="plan-info">
                      <h4>Your New Plan:</h4>
                      <div className={`plan-badge ${updatedUserData.plan}`}>
                        {updatedUserData.plan?.toUpperCase()}
                      </div>
                      <p>Expires: {new Date(updatedUserData.planExpiry).toLocaleDateString()}</p>
                      <p>Status: <span className="status-active">Active</span></p>
                      
                      <button 
                        onClick={refreshUserData}
                        className="refresh-btn"
                      >
                        Refresh User Data
                      </button>
                    </div>
                  )}
                  
                  <FiLoader className="redirect-spinner" />
                </div>
              ) : paymentStatus === 'failed' ? (
                <div className="failed-state">
                  <div className="failed-icon-circle">
                    <FiAlertCircle className="failed-icon" />
                  </div>
                  <h2>Payment Failed</h2>
                  <p className="error-message">{error || 'Something went wrong with your payment.'}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <h2>Payment Details</h2>
                  
                  {error && (
                    <div className="error-alert">
                      <FiAlertCircle className="alert-icon" />
                      <div>
                        <p>{error}</p>
                        <button
                          onClick={initializePayment}
                          className="retry-link"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="payment-info">
                    {/* Payment Methods Info */}
                    <div className="payment-methods">
                      <div className="method-header">
                        <FiExternalLink className="method-icon" />
                        <span>External Payment</span>
                      </div>
                      <p>
                        You'll be redirected to Paystack's secure payment page to complete your transaction.
                        Paystack supports all major payment methods in Ghana.
                      </p>
                      <div className="method-tags">
                        <span>Mobile Money</span>
                        <span>Visa/MasterCard</span>
                        <span>Bank Transfer</span>
                        <span>Visa QR</span>
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="security-info">
                      <FiShield className="security-icon" />
                      <div>
                        <p>Secure Payment</p>
                        <p>
                          Your payment is processed securely on Paystack's platform. 
                          We never see or store your payment details.
                        </p>
                      </div>
                    </div>

                    {/* Processing Info */}
                    <div className="processing-info">
                      <FiClock className="processing-icon" />
                      <div>
                        <p>Instant Activation</p>
                        <p>
                          Your plan will be activated immediately after successful payment.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                      <button
                        onClick={initializePayment}
                        disabled={loading}
                        className="pay-button"
                      >
                        {loading ? (
                          <>
                            <FiLoader className="button-spinner" />
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
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment Flow Info */}
            <div className="payment-flow">
              <p>Payment Flow:</p>
              <ol>
                <li>Click "Pay via Paystack" button</li>
                <li>You'll be redirected to Paystack's secure payment page</li>
                <li>Complete payment using your preferred method</li>
                <li>Paystack will redirect you back to our site</li>
                <li>We'll verify and activate your plan automatically</li>
              </ol>
            </div>

            {/* Reference Info */}
            {reference && (
              <div className="reference-info">
                <p>
                  Reference: <code>{reference}</code>
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