import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

const NotFoundPage = () => {
  const recentPages = [
    { name: 'Background Remover', path: '/remove-background' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'API Documentation', path: '/docs' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="md:flex">
            {/* Left Side */}
            <div className="md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 p-8 md:p-12 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 mb-8">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
                <div className="relative w-full h-full flex items-center justify-center text-white text-center">
                  <div>
                    <div className="text-8xl font-bold mb-2">404</div>
                    <div className="text-2xl font-semibold opacity-90">
                      Page Not Found
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-white/90 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <FiAlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  The page you're looking for doesn't exist or has been moved.
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="md:w-1/2 p-8 md:p-12">
              <h1 className="text-3xl font-bold text-slate-800 mb-4">
                Oops! Lost in the digital space?
              </h1>

              <p className="text-slate-600 mb-8">
                Don't worry, even the best images need cropping sometimes.
                Let's get you back on track.
              </p>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Link
                  to="/"
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-3 hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <FiHome className="w-5 h-5" />
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
