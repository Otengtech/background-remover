import { FiZap, FiShield, FiLayers, FiTrendingUp } from "react-icons/fi";
import { useScrollReveal, useScrollRevealMap } from "../hooks/useIntersectionObserver";

const Features = () => {
  // Create refs for animations
  const containerRef = useScrollReveal();
  const titleRef = useScrollReveal();
  const subtitleRef = useScrollReveal();
  const featuresRef = useScrollRevealMap(4); // Create array of 4 refs
  const ctaButtonsRef = useScrollRevealMap(2); // Create array of 2 refs for buttons

  const features = [
    {
      icon: <FiZap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Process images in seconds with optimized AI algorithms",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FiLayers className="w-6 h-6" />,
      title: "Pixel Perfect",
      description: "Crisp edge detection for professional-grade results",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your images are never stored or shared",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />,
      title: "Batch Processing",
      description: "Remove backgrounds from multiple images at once",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
            <span ref={containerRef} className="scroll-reveal from-bottom text-primary-400 text-sm font-medium">
              Why Choose Removeio
            </span>
          </div>
          
          <h2 ref={titleRef} className="scroll-reveal from-right text-3xl md:text-4xl font-bold text-white mb-4">
            Professional Background Removal,
            <span className="block text-primary-300">Simplified</span>
          </h2>
          
          <p ref={subtitleRef} className="scroll-reveal text-gray-300 max-w-2xl mx-auto">
            Everything you need for perfect background removal in one powerful tool.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={featuresRef(index)}
              className="scroll-reveal from-bottom group p-6 rounded-xl border border-gray-800/50 hover:border-primary-500/30 transition-all duration-300 hover:translate-y-[-4px]"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <div className="text-white">{feature.icon}</div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              
              <p className="text-gray-300 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Simple CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <button
              ref={ctaButtonsRef[0]}
              className="scroll-reveal from-bottom px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105"
            >
              Try Free Now
            </button>
            <button
              ref={ctaButtonsRef[1]}
              className="scroll-reveal px-6 py-3 border border-gray-700 hover:border-gray-600 text-white font-medium rounded-lg transition-all duration-300"
            >
              See Pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;