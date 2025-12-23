import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiCheck,
  FiX,
  FiZap,
  FiShield,
  FiUsers,
  FiGlobe,
  FiClock,
  FiDownload,
  FiStar,
  FiHelpCircle,
  FiArrowRight,
  FiCreditCard,
  FiImage,
  FiTrendingUp,
  FiAward
} from 'react-icons/fi';

const Pricing = () => {
  const { isAuthenticated, user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
  
  // Convert to GHS (Ghanaian Cedis)
  // For testing: Basic = 0.2 GHS, Pro = 5 GHS
  const plans = [
    {
      name: 'Free',
      tagline: 'Perfect for getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      color: 'from-gray-600 to-gray-700',
      buttonColor: 'bg-gray-700 hover:bg-gray-600',
      features: [
        { included: true, text: '10 images per month' },
        { included: true, text: 'SD Resolution (720p)' },
        { included: true, text: 'Basic background removal' },
        { included: true, text: 'JPG & PNG format' },
        { included: false, text: 'HD Resolution (1080p)' },
        { included: false, text: 'Priority processing' },
        { included: false, text: 'No watermark' },
        { included: false, text: 'Commercial license' },
      ],
      limits: {
        resolution: '720p (SD)',
        imagesPerMonth: 10,
        processingSpeed: 'Standard',
        formats: ['PNG', 'JPG'],
        apiAccess: false,
        support: 'Community'
      },
      cta: isAuthenticated && user?.plan === 'free' ? 'Current Plan' : 'Get Started Free',
      popular: false,
      planType: 'free'
    },
    {
      name: 'Basic',
      tagline: 'For regular users',
      monthlyPrice: 0.2,
      yearlyPrice: 2, // Save 17%
      color: 'from-primary-500 to-blue-600',
      buttonColor: 'bg-gradient-to-r from-primary-500 to-blue-600',
      features: [
        { included: true, text: '100 images per month' },
        { included: true, text: 'HD Resolution (1080p)' },
        { included: true, text: 'Advanced AI processing' },
        { included: true, text: 'All formats (PNG, JPG, WebP)' },
        { included: true, text: 'Priority processing' },
        { included: true, text: 'No watermark' },
        { included: false, text: 'Commercial license' },
        { included: false, text: 'API access' },
      ],
      limits: {
        resolution: '1080p (HD)',
        imagesPerMonth: 100,
        processingSpeed: 'Priority',
        formats: ['PNG', 'JPG', 'WebP'],
        apiAccess: false,
        support: 'Email Support'
      },
      cta: isAuthenticated && user?.plan === 'basic' ? 'Current Plan' : 'Upgrade to Basic',
      popular: true,
      planType: 'basic'
    },
    {
      name: 'Pro',
      tagline: 'For professionals & businesses',
      monthlyPrice: 5,
      yearlyPrice: 50, // Save 17%
      color: 'from-purple-500 to-pink-600',
      buttonColor: 'bg-gradient-to-r from-purple-500 to-pink-600',
      features: [
        { included: true, text: 'Unlimited images' },
        { included: true, text: '4K Ultra HD Resolution' },
        { included: true, text: 'Premium AI processing' },
        { included: true, text: 'All formats + TIFF' },
        { included: true, text: 'Instant processing' },
        { included: true, text: 'Commercial license' },
        { included: true, text: 'API access' },
        { included: true, text: 'White-label options' },
      ],
      limits: {
        resolution: '4K (Ultra HD)',
        imagesPerMonth: 'Unlimited',
        processingSpeed: 'Instant',
        formats: ['PNG', 'JPG', 'WebP', 'TIFF'],
        apiAccess: true,
        support: '24/7 Priority Support'
      },
      cta: isAuthenticated && user?.plan === 'pro' ? 'Current Plan' : 'Go Pro',
      popular: false,
      planType: 'pro'
    },
  ];

  const faqs = [
    {
      question: 'How does the free plan work?',
      answer: 'Free users get 10 high-quality background removals per month at 720p resolution. Perfect for occasional use.'
    },
    {
      question: 'Can I upgrade/downgrade anytime?',
      answer: 'Yes! You can change your plan at any time. Upgrades take effect immediately, downgrades apply at the next billing cycle.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods in Ghana including Mobile Money (MTN, Vodafone), Visa, MasterCard, and bank transfers.'
    },
    {
      question: 'Do you store my images?',
      answer: 'No, we process images in real-time and delete them immediately after processing. Your privacy is our priority.'
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel anytime. Your subscription will remain active until the end of your billing period.'
    },
    {
      question: 'What happens if I exceed my monthly limit?',
      answer: 'Free/Basic users can purchase additional image packs. Pro users have unlimited access.'
    },
  ];

  const paymentFeatures = [
    {
      icon: <FiShield />,
      title: 'Secure Payments',
      desc: '256-bit SSL encryption. We never store payment details'
    },
    {
      icon: <FiClock />,
      title: 'Instant Activation',
      desc: 'Get access to premium features immediately after payment'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Flexible Plans',
      desc: 'Upgrade, downgrade, or cancel anytime'
    },
    {
      icon: <FiAward />,
      title: 'Money Back Guarantee',
      desc: '14-day refund policy on all paid plans'
    },
  ];

  // Check if user is on this plan
  const isCurrentPlan = (planType) => {
    return isAuthenticated && user?.plan === planType;
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
              <FiStar className="text-primary-400" />
              <span className="text-primary-400 text-sm font-medium">
                Simple Pricing in GHS
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Plans for{' '}
              <span className=" text-[#7c3aed]">
                Every Creator
              </span>
            </h1>
            
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
              Start removing backgrounds for free. Upgrade anytime for higher resolution and more features.
            </p>
            
            {/* Billing Toggle */}
            {!isAuthenticated && (
              <div className="inline-flex items-center bg-dark-card rounded-full p-1 mb-12">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    billingCycle === 'monthly'
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    billingCycle === 'yearly'
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Yearly <span className="text-green-400 text-sm ml-2">Save 17%</span>
                </button>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`card relative transform transition-all duration-500 hover:scale-[1.02] ${
                  plan.popular ? 'border-primary-500/50 shadow-2xl shadow-primary-500/10' : ''
                } ${isCurrentPlan(plan.planType) ? 'ring-2 ring-primary-500' : ''}`}
              >
                {/* Current Plan Badge */}
                {isCurrentPlan(plan.planType) && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </div>
                  </div>
                )}
                
                {/* Popular Badge */}
                {plan.popular && !isCurrentPlan(plan.planType) && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-6">{plan.tagline}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-white">
                        ₵{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </span>
                      <span className="text-gray-400 ml-2">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {plan.monthlyPrice > 0 && billingCycle === 'yearly' && (
                      <p className="text-green-400 text-sm mt-2">
                        ₵{(plan.yearlyPrice / 12).toFixed(2)} per month
                      </p>
                    )}
                  </div>
                  
                  <Link
                    to={isAuthenticated ? `/checkout/${plan.planType}` : '/register'}
                    className={`${
                      isCurrentPlan(plan.planType)
                        ? 'bg-gray-700 cursor-not-allowed'
                        : plan.buttonColor
                    } text-white font-medium py-3 px-6 rounded-lg w-full inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
                    onClick={(e) => isCurrentPlan(plan.planType) && e.preventDefault()}
                  >
                    {plan.cta} {!isCurrentPlan(plan.planType) && <FiArrowRight />}
                  </Link>
                </div>
                
                {/* Plan Limits */}
                <div className="mb-6 p-4 rounded-lg bg-gray-900/50">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resolution:</span>
                      <span className="text-white font-medium">{plan.limits.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Images/Month:</span>
                      <span className="text-white font-medium">{plan.limits.imagesPerMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Speed:</span>
                      <span className="text-white font-medium">{plan.limits.processingSpeed}</span>
                    </div>
                  </div>
                </div>
                
                {/* Features */}
                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                      ) : (
                        <FiX className="text-gray-600 mt-1 flex-shrink-0" />
                      )}
                      <span className={`${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Secure & Hassle-Free Payments
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paymentFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="card hover:border-primary-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                      <div className="text-primary-500 text-xl">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 mb-6">
                <FiHelpCircle className="text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">
                  Frequently Asked Questions
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white">Common Questions</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="card hover:border-gray-700 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          {!isAuthenticated && (
            <div className="text-center mb-20">
              <div className="glass-effect rounded-2xl p-12 max-w-3xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                  <FiImage className="text-white text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
                <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of creators who trust RemoveIt for their background removal needs. 
                  No credit card required to start with our free plan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4"
                  >
                    Create Free Account <FiArrowRight />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4"
                  >
                    Sign In to Account
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="bg-dark-card/50 py-8 rounded-2xl">
            <div className="container mx-auto max-w-6xl px-6">
              <p className="text-gray-400 text-center text-sm mb-6">We Accept in Ghana</p>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="text-center">
                  <div className="w-16 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-sm">MTN</span>
                  </div>
                  <span className="text-gray-500 text-xs">Mobile Money</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-sm">Vodafone</span>
                  </div>
                  <span className="text-gray-500 text-xs">Mobile Money</span>
                </div>
                <div className="text-center">
                  <FiCreditCard className="text-blue-500 text-3xl mx-auto mb-2" />
                  <span className="text-gray-500 text-xs">Visa/MasterCard</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">Bank Transfer</span>
                  </div>
                  <span className="text-gray-500 text-xs">All Banks</span>
                </div>
              </div>
              <p className="text-gray-600 text-center text-xs mt-6 max-w-2xl mx-auto">
                All payments are processed securely via Paystack. We never store your payment details. 
                Payments are in Ghanaian Cedis (GHS).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;