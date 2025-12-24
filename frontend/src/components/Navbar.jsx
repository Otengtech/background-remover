import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiLogIn, 
  FiUserPlus, 
  FiUser, 
  FiLogOut, 
  FiImage, 
  FiMenu, 
  FiX,
  FiHome,
  FiStar,
  FiDollarSign,
  FiInfo
} from 'react-icons/fi';
import { RiDashboardLine } from 'react-icons/ri';
import { FaRegAddressBook } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowMobileMenu(false);
      setIsClosing(false);
    }, 300); // Match this with CSS transition duration
  };

  const handleNavLinkClick = () => {
    closeMobileMenu();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="glass-effect sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FiImage className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary-100">
                Removeio
              </span>
            </Link>

            {/* Desktop Navigation Links - Center */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                Home
              </Link>
              <Link to="/features" className="text-gray-300 hover:text-white transition-colors duration-200">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors duration-200">
                Pricing
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200">
                About
              </Link>
              <Link to="/support" className="text-gray-300 hover:text-white transition-colors duration-200">
                Support
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-dark-card border border-dark-border hover:bg-gray-800 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <span>{user?.name}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-300">
                      {user?.plan}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-lg py-2 animate-fade-in z-50">
                      <Link
                        to="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-800 transition-colors duration-200"
                      >
                        <RiDashboardLine className="w-4 h-4" />
                        <span>BG Remover</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-800 transition-colors duration-200 text-red-400"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-dark-border hover:bg-gray-800 transition-colors duration-200"
                  >
                    <FiLogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-300 hover:text-white p-2"
              onClick={() => setShowMobileMenu(true)}
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className={`md:hidden fixed inset-0 z-50 ${
            isClosing ? 'animate-fade-out' : 'animate-fade-in'
          }`}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* Mobile Menu Panel */}
          <div 
            className={`absolute inset-y-0 left-0 w-3/4 max-w-sm bg-[#0f0f23] shadow-xl transform ${
              isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
            }`}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <Link 
                to="/" 
                className="flex items-center space-x-2"
                onClick={handleNavLinkClick}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiImage className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-primary-100">
                  Removeio
                </span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-gray-300 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="p-4 space-y-2">
              <Link
                to="/"
                onClick={handleNavLinkClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <FiHome className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link
                to="/features"
                onClick={handleNavLinkClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <FiStar className="w-5 h-5" />
                <span>Features</span>
              </Link>
              <Link
                to="/pricing"
                onClick={handleNavLinkClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <FiDollarSign className="w-5 h-5" />
                <span>Pricing</span>
              </Link>
              <Link
                to="/support"
                onClick={handleNavLinkClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <FiInfo className="w-5 h-5" />
                <span>Support</span>
              </Link>
              <Link
                to="/about"
                onClick={handleNavLinkClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <FaRegAddressBook className="w-5 h-5" />
                <span>About</span>
              </Link>
            </div>

            {/* Mobile Auth Section */}
            <div className="p-4">
              {isAuthenticated ? (
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-900 rounded-lg">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <FiUser className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-primary-300">{user?.plan} Plan</p>
                    </div>
                  </div>

                  {/* User Menu Links */}
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      onClick={handleNavLinkClick}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    >
                      <RiDashboardLine className="w-5 h-5" />
                      <span>BG Remover</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={handleNavLinkClick}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    >
                      <FiUser className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-red-400"
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={handleNavLinkClick}
                    className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border border-dark-border hover:bg-gray-800 transition-colors duration-200"
                  >
                    <FiLogIn className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleNavLinkClick}
                    className="btn-primary flex items-center justify-center space-x-2 px-4 py-3"
                  >
                    <FiUserPlus className="w-5 h-5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;