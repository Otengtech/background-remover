import { FiUsers, FiTarget, FiAward, FiHeart } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import {Link} from "react-router-dom"

const AboutUs = () => {
  const { isAuthenticated } = useAuth();
  const stats = [
    {
      icon: <FiUsers className="w-6 h-6" />,
      value: "50K+",
      label: "Active Users",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FiTarget className="w-6 h-6" />,
      value: "1M+",
      label: "Images Processed",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      value: "99.9%",
      label: "Accuracy Rate",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FiHeart className="w-6 h-6" />,
      value: "24/7",
      label: "Support",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-20 md:px-28 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-primary-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="space-y-8">
            {/* Section Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 mb-4">
                <span className="text-primary-400 text-sm font-medium">
                  About Removeio
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                More Than Just
                <span className="block bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  Background Removal
                </span>
              </h2>

              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                At Removeio, we're on a mission to simplify creative work. What
                started as a simple tool to remove backgrounds has evolved into
                a comprehensive platform for designers, photographers, and
                content creators worldwide.
              </p>
            </div>

            {/* Mission Statement */}
            <div className="glass-card rounded-2xl p-6 border border-gray-800/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 flex items-center justify-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-purple-400 rounded-md"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Our Mission
                  </h3>
                  <p className="text-gray-300">
                    To empower creators with AI-powered tools that are both
                    powerful and accessible, removing technical barriers and
                    letting creativity flow.
                  </p>
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                </div>
                <span className="text-gray-300">
                  AI-powered precision for perfect results
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                </div>
                <span className="text-gray-300">
                  User-friendly interface for everyone
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-gray-300">
                  Commitment to privacy and security
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Visual */}
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass-card rounded-xl p-6 border border-gray-800/50 hover:border-primary-500/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Team Quote */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">"</span>
              </div>
              <div className="glass-card rounded-2xl p-8 border border-gray-800/50">
                <p className="text-gray-300 italic mb-4">
                  "We believe that great tools should be accessible to everyone.
                  That's why we built RemoveIt - to give creators of all skill
                  levels the power to produce professional results without the
                  complexity."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600"></div>
                  <div>
                    <div className="font-semibold text-white">
                      Ebenezer Oteng
                    </div>
                    <div className="text-sm text-gray-400">Founder & CEO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA at the bottom */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-800 rounded-2xl px-8 py-6">
            <div className="text-left">
              <h3 className="text-xl font-bold text-white mb-1">
                Ready to transform your workflow?
              </h3>
              <p className="text-gray-400">
                Join thousands of creators who trust Removeio
              </p>
            </div>
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:bg-gray-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-purple-700 transition-all duration-300"
              >
                Get Started Free
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:bg-gray-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-purple-700 transition-all duration-300"
              >
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
