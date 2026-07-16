import { Link } from 'react-router-dom';
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
import { FaRegAddressBook } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Navbar = () => {
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

  return (
    <>
      <nav className="glass-effect sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-20">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-[#7c3aed]">
                Removerio
              </span>
            </Link>

            {/* Desktop Navigation Links - Center */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                Home
              </Link>
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200">
                Convertor
              </Link>
              <Link to="/features" className="text-gray-300 hover:text-white transition-colors duration-200">
                Features
              </Link>
              <Link to="/support" className="text-gray-300 hover:text-white transition-colors duration-200">
                Support
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200">
                About
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                Contact
              </Link>
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
                  Removerio
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
                to="/dashboard"
                onClick={handleNavLinkClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <FiHome className="w-5 h-5" />
                <span>Convertor</span>
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
              <Link
                to="/contact"
                onClick={handleNavLinkClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <FaRegAddressBook className="w-5 h-5" />
                <span>Contact</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
