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
  FiX,
  FiSave,
  FiRefreshCw,
  FiTrash2,
  FiDownload,
  FiBell,
  FiGlobe,
  FiDatabase
} from 'react-icons/fi';

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
    account: false
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [accountStats, setAccountStats] = useState({
    memberSince: '',
    lastLogin: '',
    imagesProcessed: 0,
    totalSize: '0 MB',
    activeSessions: 1
  });

  // Initialize data
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
      
      // Set account stats
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
        totalSize: formatBytes((user.imagesProcessed || 0) * 2 * 1024 * 1024), // Estimate 2MB per image
        activeSessions: 1
      });
    }
  }, [user]);

  // Format bytes to readable size
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
        email: profileData.email
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
      // Simulate API call - replace with actual password change endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call your actual password change endpoint here
      // const result = await changePassword(profileData.currentPassword, profileData.newPassword);
      
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
      
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  // Handle Account Export
  const handleExportData = async () => {
    setLoading({ ...loading, account: true });
    
    try {
      // Simulate data export
      const userData = {
        profile: {
          name: user.name,
          email: user.email,
          memberSince: user.createdAt,
          plan: user.plan
        },
        stats: {
          imagesProcessed: user.imagesProcessed || 0,
          lastLogin: user.lastLogin
        },
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `removeit-data-${user.email}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading({ ...loading, account: false });
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      return;
    }
    
    if (!window.confirm('⚠️ FINAL WARNING: This will permanently delete all your images, settings, and account data. Please type "DELETE" to confirm.')) {
      return;
    }
    
    const userInput = prompt('Type "DELETE" to confirm account deletion:');
    if (userInput !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }
    
    setLoading({ ...loading, account: true });
    
    try {
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call your actual account deletion endpoint here
      // await deleteAccount();
      
      toast.success('Account scheduled for deletion');
      setTimeout(() => {
        logout();
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading({ ...loading, account: false });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          <p className="text-gray-400">Manage your account, security, and data</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Account Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <FiUser className="mr-2 text-blue-400" />
                  Profile Information
                </h2>
                <span className="px-3 py-1 text-sm bg-blue-900/30 text-blue-300 rounded-full">
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
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
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

            {/* Change Password Card */}
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

            {/* Account Management Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FiDatabase className="mr-2 text-purple-400" />
                Data Management
              </h2>

              <div className="space-y-4">
                <button
                  onClick={handleExportData}
                  disabled={loading.account}
                  className="w-full flex items-center justify-between p-4 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <FiDownload className="mr-3 text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium">Export Account Data</div>
                      <div className="text-sm text-gray-400">Download all your data in JSON format</div>
                    </div>
                  </div>
                  {loading.account && <FiRefreshCw className="animate-spin" />}
                </button>

                <button
                  onClick={handleDeleteAccount}
                  disabled={loading.account}
                  className="w-full flex items-center justify-between p-4 bg-red-900/20 border border-red-700/30 rounded-lg hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <FiTrash2 className="mr-3 text-red-400" />
                    <div className="text-left">
                      <div className="font-medium text-red-400">Delete Account</div>
                      <div className="text-sm text-red-400/70">Permanently delete all your data</div>
                    </div>
                  </div>
                  {loading.account && <FiRefreshCw className="animate-spin text-red-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Account Overview */}
          <div className="space-y-8">
            {/* Account Overview Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FiUser className="mr-2 text-blue-400" />
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

                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                  <span className="text-gray-400">Total Data Size</span>
                  <span className="font-medium">{accountStats.totalSize}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                  <span className="text-gray-400">Active Sessions</span>
                  <span className="font-medium">{accountStats.activeSessions}</span>
                </div>
              </div>
            </div>

            {/* Security Status Card */}
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
                    <span>Password Age</span>
                  </div>
                  <span className="text-gray-400">30+ days</span>
                </div>

                <button className="w-full mt-4 py-2 px-4 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2">
                  <FiShield />
                  Enhance Security
                </button>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FiCreditCard className="mr-2 text-yellow-400" />
                Subscription
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-700/30">
                  <div className="text-2xl font-bold mb-1">{user.plan?.toUpperCase() || 'FREE'}</div>
                  <div className="text-sm text-gray-400">Current Plan</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Monthly Images</span>
                    <span className="font-medium">
                      {user.plan === 'pro' ? 'Unlimited' : 
                       user.plan === 'basic' ? '100' : '10'}
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

                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all font-medium"
                >
                  {user.plan === 'pro' ? 'Manage Subscription' : 'Upgrade Plan'}
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
                  <FiCalendar className="mr-3 text-green-400" />
                  Upload Images
                </button>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center p-3 bg-red-900/20 rounded-lg hover:bg-red-900/30 transition-colors text-red-400"
                >
                  <FiX className="mr-3" />
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