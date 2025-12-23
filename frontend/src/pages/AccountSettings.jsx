import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiLock,
  FiKey,
  FiShield,
  FiCreditCard,
  FiCalendar,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiSave,
  FiRefreshCw,
  FiTrash2,
  FiDownload,
  FiDatabase,
  FiImage,
  FiZap,
  FiBell,
  FiGlobe,
  FiAlertCircle
} from 'react-icons/fi';
import api from '../service/api';

const AccountSettings = () => {
  const { user, updateProfile, logout } = useAuth();
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // UI State
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    account: false,
    subscription: false
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [accountStats, setAccountStats] = useState({
    memberSince: '',
    lastLogin: '',
    imagesProcessed: 0,
    monthlyImagesUsed: 0,
    monthlyLimit: 10,
    remainingDays: Infinity,
    isPlanActive: true,
    subscriptionStatus: 'inactive'
  });
//   const [paymentHistory, setPaymentHistory] = useState([]);

  // Initialize data
useEffect(() => {
  if (user) {
    setProfileData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || ''
    }));
    
    // FIXED: Calculate plan status manually instead of calling model methods
    const isPlanActive = () => {
      if (user.plan === 'free') return true;
      if (!user.planExpiry) return false;
      return new Date() < new Date(user.planExpiry);
    };
    
    const getPlanRemainingDays = () => {
      if (user.plan === 'free' || !user.planExpiry) return Infinity;
      const now = new Date();
      const expiry = new Date(user.planExpiry);
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    };
    
    const monthlyLimit = user.plan === 'pro' ? Infinity : user.plan === 'basic' ? 100 : 10;
    
    setAccountStats({
      memberSince: user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'N/A',
      lastLogin: user.lastLogin 
        ? new Date(user.lastLogin).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Never',
      imagesProcessed: user.imagesProcessed || 0,
      monthlyImagesUsed: user.monthlyImagesUsed || 0,
      monthlyLimit,
      remainingDays: getPlanRemainingDays(), // ✅ Fixed: Call the function
      isPlanActive: isPlanActive(), // ✅ Fixed: Call the function
      subscriptionStatus: user.subscription?.status || 'inactive'
    });

    // Load payment history if available
    // if (user.paymentHistory) {
    //   setPaymentHistory(user.paymentHistory);
    // } else {
    //   fetchPaymentHistory();
    // }
  }
}, [user]);

  // Fetch payment history
//   const fetchPaymentHistory = async () => {
//     try {
//       const response = await api.get('/payments/history');
//       if (response.data.success) {
//         setPaymentHistory(response.data.data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch payment history:', error);
//     }
//   };

  // Format currency
//   const formatCurrency = (amount, currency = 'GHS') => {
//     return new Intl.NumberFormat('en-GH', {
//       style: 'currency',
//       currency: currency
//     }).format(amount);
//   };

//   // Format date
//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

  // Validators
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validate name
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }
    
    // Validate email
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before saving');
      return;
    }
    
    setLoading({ ...loading, profile: true });
    setErrors({});
    
    try {
      const result = await updateProfile({
        name: profileData.name,
        email: profileData.email.toLowerCase()
      });
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setLoading({ ...loading, profile: false });
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validate current password
    if (!profileData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    // Validate new password
    const passwordError = validatePassword(profileData.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }
    
    // Validate confirm password
    if (!profileData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (profileData.newPassword !== profileData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before changing password');
      return;
    }
    
    setLoading({ ...loading, password: true });
    setErrors({});
    
    try {
      const response = await api.put('/auth/updatepassword', {
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        toast.error(response.data.error || 'Failed to change password');
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Password change failed';
      toast.error(errorMessage);
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  // Handle Account Export
  const handleExportData = async () => {
    setLoading({ ...loading, account: true });
    
    try {
      const userData = {
        profile: {
          name: user.name,
          email: user.email,
          memberSince: user.createdAt,
          plan: user.plan,
          planExpiry: user.planExpiry
        },
        stats: {
          imagesProcessed: user.imagesProcessed || 0,
          monthlyImagesUsed: user.monthlyImagesUsed || 0,
          lastLogin: user.lastLogin
        },
        subscription: user.subscription || {},
        // paymentHistory: paymentHistory,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `removeit-account-data-${user.email}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Account data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading({ ...loading, account: false });
    }
  };

  // Handle Subscription Management
  const handleManageSubscription = async () => {
    setLoading({ ...loading, subscription: true });
    
    try {
      // Redirect to subscription management page
      window.location.href = '/subscription';
    } catch (error) {
      toast.error('Failed to load subscription page');
    } finally {
      setLoading({ ...loading, subscription: false });
    }
  };

  // Handle Cancel Subscription
  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }
    
    setLoading({ ...loading, subscription: true });
    
    try {
      const response = await api.post('/payments/cancel-subscription');
      
      if (response.data.success) {
        toast.success('Subscription cancelled. You can continue using premium features until the end of your billing period.');
        // Refresh user data
        window.location.reload();
      } else {
        toast.error(response.data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel subscription';
      toast.error(errorMessage);
    } finally {
      setLoading({ ...loading, subscription: false });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view account settings</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your account, security, and subscription</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Security */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <FiUser className="mr-2 text-blue-400" />
                  Profile Information
                </h2>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  user.plan === 'pro' ? 'bg-purple-900/30 text-purple-300' :
                  user.plan === 'basic' ? 'bg-blue-900/30 text-blue-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {user.plan?.toUpperCase() || 'FREE'} PLAN
                </span>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className={`w-full bg-gray-900/50 border ${errors.name ? 'border-red-500' : 'border-gray-600'} text-white rounded-lg py-3 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Your name"
                        maxLength={50}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 text-right">
                      {profileData.name.length}/50 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className={`w-full bg-gray-900/50 border ${errors.email ? 'border-red-500' : 'border-gray-600'} text-white rounded-lg py-3 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading.profile}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.profile ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Save Profile Changes
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FiLock className="mr-2 text-green-400" />
                Change Password
              </h2>

              <form onSubmit={handlePasswordChange}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                        className={`w-full bg-gray-900/50 border ${errors.currentPassword ? 'border-red-500' : 'border-gray-600'} text-white rounded-lg py-3 px-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                        className={`w-full bg-gray-900/50 border ${errors.newPassword ? 'border-red-500' : 'border-gray-600'} text-white rounded-lg py-3 px-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                        className={`w-full bg-gray-900/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'} text-white rounded-lg py-3 px-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className={`flex items-center ${profileData.newPassword.length >= 6 ? 'text-green-400' : 'text-gray-500'}`}>
                        <FiCheck className="mr-2" /> At least 6 characters
                      </li>
                      <li className={`flex items-center ${/[A-Z]/.test(profileData.newPassword) ? 'text-green-400' : 'text-gray-500'}`}>
                        <FiCheck className="mr-2" /> One uppercase letter
                      </li>
                      <li className={`flex items-center ${/[0-9]/.test(profileData.newPassword) ? 'text-green-400' : 'text-gray-500'}`}>
                        <FiCheck className="mr-2" /> One number
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading.password}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.password ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <FiKey />
                      Change Password
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Payment History */}
            {/* {paymentHistory.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <FiCreditCard className="mr-2 text-yellow-400" />
                  Payment History
                </h2>

                <div className="space-y-3">
                  {paymentHistory.slice(0, 5).map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                      <div>
                        <div className="font-medium">{payment.plan?.toUpperCase() || 'PLAN'} Plan</div>
                        <div className="text-sm text-gray-400">
                          {payment.reference ? `Ref: ${payment.reference}` : formatDate(payment.paidAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(payment.amount, payment.currency)}</div>
                        <div className={`text-sm ${payment.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                          {payment.status?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {paymentHistory.length > 5 && (
                    <button className="w-full py-2 text-center text-gray-400 hover:text-white text-sm">
                      View all {paymentHistory.length} payments →
                    </button>
                  )}
                </div>
              </div>
            )} */}
          </div>

          {/* Right Column - Account & Subscription */}
          <div className="space-y-8">
            {/* Account Overview */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FiDatabase className="mr-2 text-blue-400" />
                Account Overview
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                  <span className="text-gray-400">Member Since</span>
                  <span className="font-medium">{accountStats.memberSince}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                  <span className="text-gray-400">Last Login</span>
                  <span className="font-medium">{accountStats.lastLogin}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                  <span className="text-gray-400">Images Processed</span>
                  <span className="font-medium">{accountStats.imagesProcessed.toLocaleString()}</span>
                </div>

                {/* Monthly Usage Progress */}
                <div className="p-3 bg-gray-900/30 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Monthly Usage</span>
                    <span className="font-medium">
                      {accountStats.monthlyImagesUsed} / {accountStats.monthlyLimit === Infinity ? '∞' : accountStats.monthlyLimit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        accountStats.monthlyImagesUsed >= accountStats.monthlyLimit ? 'bg-red-500' :
                        accountStats.monthlyImagesUsed >= accountStats.monthlyLimit * 0.8 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{
                        width: accountStats.monthlyLimit === Infinity 
                          ? '100%' 
                          : `${Math.min((accountStats.monthlyImagesUsed / accountStats.monthlyLimit) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleExportData}
                  disabled={loading.account}
                  className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.account ? (
                    <FiRefreshCw className="animate-spin" />
                  ) : (
                    <>
                      <FiDownload />
                      Export Account Data
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Subscription Management */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FiCreditCard className="mr-2 text-purple-400" />
                Subscription
              </h2>

              <div className="space-y-4">
                {/* Plan Status */}
                <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold">{user.plan?.toUpperCase() || 'FREE'}</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      accountStats.subscriptionStatus === 'active' ? 'bg-green-900/30 text-green-400' :
                      accountStats.subscriptionStatus === 'cancelled' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {accountStats.subscriptionStatus?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">Current Plan</div>
                  
                  {user.plan !== 'free' && user.planExpiry && (
                    <div className="mt-3 text-sm">
                      <div className="flex items-center text-gray-300">
                        <FiCalendar className="mr-2" />
                        {accountStats.remainingDays === Infinity ? 'Lifetime' : 
                         accountStats.remainingDays > 0 ? `Expires in ${accountStats.remainingDays} days` :
                         'Expired'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Plan Features */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Monthly Images</span>
                    <span className="font-medium">
                      {accountStats.monthlyLimit === Infinity ? 'Unlimited' : accountStats.monthlyLimit}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Max Resolution</span>
                    <span className="font-medium">
                      {user.plan === 'pro' ? '4K' : 
                       user.plan === 'basic' ? '1080p' : '720p'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">AI Processing</span>
                    <span className={`font-medium ${user.plan === 'pro' ? 'text-green-400' : 'text-gray-400'}`}>
                      {user.plan === 'pro' ? 'Enabled' : 'Basic'}
                    </span>
                  </div>
                </div>

                {/* Subscription Actions */}
                <div className="space-y-3">
                  {user.plan === 'free' ? (
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                    >
                      Upgrade to Premium
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleManageSubscription}
                        disabled={loading.subscription}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading.subscription ? (
                          <FiRefreshCw className="animate-spin" />
                        ) : (
                          <>
                            <FiCreditCard />
                            Manage Subscription
                          </>
                        )}
                      </button>
                      
                      {accountStats.subscriptionStatus === 'active' && (
                        <button
                          onClick={handleCancelSubscription}
                          disabled={loading.subscription}
                          className="w-full py-2 px-4 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors text-sm"
                        >
                          Cancel Subscription
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FiShield className="mr-2 text-green-400" />
                Security Status
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${user.email ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>Email Verified</span>
                  </div>
                  <span className={`font-medium ${user.email ? 'text-green-400' : 'text-red-400'}`}>
                    {user.email ? 'Verified' : 'Not Verified'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3 bg-green-500" />
                    <span>2FA Status</span>
                  </div>
                  <span className="text-gray-400">Not Enabled</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3 bg-green-500" />
                    <span>Account Status</span>
                  </div>
                  <span className={`font-medium ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <button className="w-full mt-4 py-2 px-4 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2">
                  <FiShield />
                  Enhance Security
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full flex items-center p-3 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors"
                >
                  <FiUser className="mr-3 text-blue-400" />
                  Go to Dashboard
                </button>
                
                <button
                  onClick={() => window.location.href = '/upload'}
                  className="w-full flex items-center p-3 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors"
                >
                  <FiImage className="mr-3 text-green-400" />
                  Upload Images
                </button>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center p-3 bg-red-900/20 rounded-lg hover:bg-red-900/30 transition-colors text-red-400"
                >
                  <FiKey className="mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;