import { FiZap, FiShield, FiGlobe, FiUsers, FiAward } from 'react-icons/fi';
import { useScrollReveal } from '../hooks/useIntersectionObserver';
import MetaTags from '../components/MetaTags';

const AboutUs = () => {
  const revealRefs = [
    useScrollReveal(),
    useScrollReveal(),
    useScrollReveal(),
    useScrollReveal()
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white py-12 px-4">
      <MetaTags
        title="About page for Removerio | Know more about Removerio"
        description="Removerio is one of the powerful accepted website that provide best background removing tool. Best for fast, quality and protected features."
      />
      <div className="container mx-auto max-w-5xl">
        
        {/* Hero Section */}
        <div className="text-center scroll-reveal from-bottom mb-16" ref={revealRefs[0]}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Removerio</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Making background removal simple, fast, and accessible for everyone
          </p>
        </div>

        {/* Our Story */}
        <div className="scroll-reveal from-bottom bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-12" ref={revealRefs[1]}>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FiUsers className="mr-3 text-blue-400" />
            Our Story
          </h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Removerio was born from a simple observation: removing backgrounds from images 
              shouldn't require expensive software or complex skills. We saw individuals and 
              businesses struggling with clunky tools and decided to build something better.
            </p>
            <p>
              Founded in 2025, our mission is to democratize professional image editing by 
              providing AI-powered tools that are both powerful and easy to use. What started 
              as a small project has grown into a platform trusted by thousands of users 
              worldwide.
            </p>
            <p>
              Today, we're proud to serve photographers, e-commerce businesses, marketers, 
              and creatives who need quick, reliable background removal for their projects.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-12">
          <h2 ref={revealRefs} className="scroll-reveal from-bottom text-2xl font-bold mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4">
                <FiZap className="text-blue-400 text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Speed & Efficiency</h3>
              <p className="text-gray-400">
                Process images in seconds, not hours. We optimize every step for maximum speed.
              </p>
            </div>

            <div className=" bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto mb-4">
                <FiShield className="text-green-400 text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Privacy First</h3>
              <p className="text-gray-400">
                Your images are processed securely and never stored on our servers.
              </p>
            </div>

            <div className="scroll-reveal from-bottom bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center" ref={revealRefs[2]}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
                <FiGlobe className="text-purple-400 text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Accessibility</h3>
              <p className="text-gray-400">
                Professional tools for everyone, from beginners to experts.
              </p>
            </div>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="scroll-reveal from-bottom bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-12" ref={revealRefs[3]}>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FiAward className="mr-3 text-yellow-400" />
            Why Choose Removerio?
          </h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                <span className="text-blue-400 font-bold">✓</span>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-1">AI-Powered Precision</h4>
                <p className="text-gray-400">
                  Our advanced AI detects edges with pixel-perfect accuracy, even on complex backgrounds.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                <span className="text-green-400 font-bold">✓</span>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-1">No Learning Curve</h4>
                <p className="text-gray-400">
                  Upload, process, download. Our intuitive interface requires zero technical skills.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                <span className="text-purple-400 font-bold">✓</span>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-1">Transparent Pricing</h4>
                <p className="text-gray-400">
                  Free tier for casual users, affordable plans for professionals. No hidden fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;