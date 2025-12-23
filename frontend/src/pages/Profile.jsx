import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiMail, FiCreditCard, FiImage, 
  FiSettings, FiLogOut, FiEdit2, FiCheck,
  FiUpload, FiCalendar, FiDownload
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useScrollReveal, useScrollRevealMap } from '../hooks/useIntersectionObserver';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', avatar: '' });
  const [stats, setStats] = useState({
    imagesProcessed: 0,
    creditsRemaining: 0,
    memberSince: '',
    subscription: 'Free'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  // Scroll reveal refs
  const headerRef = useScrollReveal();
  const profileCardRef = useScrollReveal();
  const activityRef = useScrollReveal();
  const quickActionsRef = useScrollReveal();
  const accountInfoRef = useScrollReveal();
  const dangerRef = useScrollReveal();

  const statCardsRef = useScrollRevealMap(4);
  const activityItemsRef = useScrollRevealMap(4);
  const actionItemsRef = useScrollRevealMap(3);

  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name || '',
      email: user.email || '',
      avatar: user.avatar || ''
    });

    setStats({
      imagesProcessed: user.imagesProcessed || 24,
      creditsRemaining: user.credits || 50,
      memberSince: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : '2024-01-01',
      subscription: user.plan || 'Free'
    });

    setRecentActivity([
      { id: 1, action: 'Image processed', date: '2 hours ago', credits: -1 },
      { id: 2, action: 'Credits purchased', date: '1 day ago', credits: +100 },
      { id: 3, action: 'Profile updated', date: '3 days ago', credits: 0 },
      { id: 4, action: 'Image processed', date: '1 week ago', credits: -1 }
    ]);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view your profile</p>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white py-8 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div
          ref={headerRef}
          className="scroll-reveal from-bottom mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Profile Card */}
            <div
              ref={profileCardRef}
              className="scroll-reveal from-bottom bg-gray-800/50 border border-gray-700 rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <FiUser />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                      <FiEdit2 />
                      <input type="file" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{formData.name}</h2>
                    <p className="text-gray-400">{formData.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs bg-blue-900/30 text-blue-300 rounded-full">
                      {stats.subscription} Plan
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center px-4 py-2 bg-gray-700 rounded-lg"
                >
                  {isEditing ? <FiCheck className="mr-2" /> : <FiEdit2 className="mr-2" />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {!isEditing && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: <FiImage />, label: 'Images', value: stats.imagesProcessed },
                    { icon: <FiCreditCard />, label: 'Credits', value: stats.creditsRemaining },
                    { icon: <FiCalendar />, label: 'Member Since', value: stats.memberSince },
                    { icon: <FiSettings />, label: 'Plan', value: stats.subscription }
                  ].map((item, index) => (
                    <div
                      key={index}
                      ref={statCardsRef(index)}
                      className="scroll-reveal from-bottom p-4 bg-gray-900/30 rounded-lg"
                      style={{ transitionDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center text-gray-400 mb-1">
                        {item.icon}
                        <span className="ml-2 text-sm">{item.label}</span>
                      </div>
                      <p className="text-xl font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div
              ref={activityRef}
              className="scroll-reveal from-bottom bg-gray-800/50 border border-gray-700 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <div
                    key={item.id}
                    ref={activityItemsRef(index)}
                    className="scroll-reveal from-bottom p-3 bg-gray-900/30 rounded-lg"
                    style={{ transitionDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-gray-400">{item.date}</p>
                      </div>
                      <span className="text-sm text-gray-400">
                        {item.credits !== 0 && `${item.credits > 0 ? '+' : ''}${item.credits} credits`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <div
              ref={quickActionsRef}
              className="scroll-reveal from-bottom bg-gray-800/50 border border-gray-700 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { to: '/upload', icon: <FiUpload />, label: 'Upload Image' },
                  { to: '/buy-credits', icon: <FiCreditCard />, label: 'Buy Credits' },
                  { to: '/settings', icon: <FiSettings />, label: 'Account Settings' }
                ].map((action, index) => (
                  <Link
                    key={index}
                    ref={actionItemsRef(index)}
                    to={action.to}
                    className="scroll-reveal from-bottom flex items-center p-3 bg-gray-900/30 rounded-lg"
                    style={{ transitionDelay: `${index * 0.1}s` }}
                  >
                    {action.icon}
                    <span className="ml-3">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account Info */}
            <div
              ref={accountInfoRef}
              className="scroll-reveal from-bottom bg-gray-800/50 border border-gray-700 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-4">Account Information</h3>
              <p className="text-sm text-gray-400">User ID: {user.id || 'USR-001'}</p>
            </div>

            {/* Danger Zone */}
            <div
              ref={dangerRef}
              className="scroll-reveal from-bottom bg-gray-800/50 border border-red-700/30 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h3>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 bg-red-900/20 rounded-lg text-red-400"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
