import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollReveal } from '../hooks/useIntersectionObserver';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiCheck, FiImage, FiZap, FiShield, FiUsers } from 'react-icons/fi';
import Alert from '../components/Alert';
import { validateEmail, validatePassword, validateName, getPasswordStrength } from '../utils/validators';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, level: 'Weak', color: 'text-red-400' });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    setAlert(null);
    
    try {
      const result = await register(formData.name, formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setAlert({
          type: 'error',
          message: result.error || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'An error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'At least 6 characters', met: formData.password.length >= 6 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains number', met: /[0-9]/.test(formData.password) },
    { text: 'Contains special character', met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  const passwordStrengthColors = [
    'bg-red-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-green-500'
  ];

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-900 to-gray-950 animate-fade-in">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Section - Info */}
        <div className="text-white space-y-8 p-6 lg:p-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Create your account and unlock professional background removal tools in seconds.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <FiImage className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">AI-Powered Removal</h3>
                <p className="text-gray-400">Remove backgrounds instantly with advanced AI technology.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <FiZap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Lightning Fast</h3>
                <p className="text-gray-400">Process images in seconds, not minutes.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-500/20 p-3 rounded-xl">
                <FiShield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Secure & Private</h3>
                <p className="text-gray-400">Your images are processed securely and deleted automatically.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-pink-500/20 p-3 rounded-xl">
                <FiUsers className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Join Thousands</h3>
                <p className="text-gray-400">Be part of our growing community of creators and professionals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full max-w-md lg:max-w-lg mx-auto">
          {/* Header */}
          

          {/* Alert */}
          {alert && (
            <div className="mb-6">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            </div>
          )}

          {/* Form Container */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Sign up to start using Removeio</p>
          </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full bg-gray-900/50 border ${errors.name ? 'border-red-500' : 'border-gray-600'} text-white rounded-lg py-3 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-gray-900/50 border ${errors.email ? 'border-red-500' : 'border-gray-600'} text-white rounded-lg py-3 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field with requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full bg-gray-900/50 border ${errors.password ? 'border-red-500' : 'border-gray-600'} text-white rounded-lg py-3 px-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength & Requirements */}
                {formData.password && (
                  <div className="mt-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Password strength:</span>
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>
                        {passwordStrength.level}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrengthColors[passwordStrength.score]}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-center">
                          <FiCheck className={`w-3 h-3 mr-2 ${req.met ? 'text-green-500' : 'text-gray-500'}`} />
                          <span className={`text-xs ${req.met ? 'text-green-400' : 'text-gray-500'}`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-gray-900/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'} text-white rounded-lg py-3 px-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 mt-1 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-900 focus:ring-2 focus:ring-offset-2"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-400 hover:text-blue-300 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-400 hover:text-blue-300 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
                      <div className="mt-8 text-center">
                        <p className="text-gray-400">
                          Already have an account?{' '}
                          <Link
                            to="/login"
                            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                          >
                            Login now
                          </Link>
                        </p>
                      </div>
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-center text-sm text-gray-400">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-blue-400 hover:text-blue-300 hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;