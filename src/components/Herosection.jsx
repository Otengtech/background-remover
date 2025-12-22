import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollReveal, useScrollRevealMap } from '../hooks/useIntersectionObserver';
import heroImage from "../assets/heroImage.avif"
import {
  FiZap,
  FiCheck,
  FiArrowRight,
  FiUpload,
  FiShield,
  FiBarChart2,
  FiCloud,
  FiClock,
  FiDownload
} from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  // Create refs for animations
  const heroTagRef = useScrollReveal();
  const titleRef = useScrollReveal();
  const subtitleRef = useScrollReveal();
  const ctaRef = useScrollReveal();
  const imageRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const sectionTitleRef = useScrollReveal();
  const stepsRef = useScrollRevealMap(3);

  const steps = [
    { icon: <FiCloud />, title: "Upload Image", desc: "Drag & drop any image format" },
    { icon: <FiClock />, title: "AI Processing", desc: "Instant background removal" },
    { icon: <FiDownload />, title: "Download", desc: "Get transparent PNG instantly" },
  ];

  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden md:px-20 pt-20">
        <div className="container mx-auto px-6 relative z-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Hero Tag */}
              <div 
                ref={heroTagRef}
                className="scroll-reveal from-bottom inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20"
              >
                <FiZap className="text-primary-400" />
                <span className="text-primary-400 text-sm font-medium">
                  AI-Powered Background Removal
                </span>
              </div>

              {/* Main Title */}
              <h1 
                ref={titleRef}
                className="scroll-reveal from-left text-5xl md:text-6xl font-bold text-white"
              >
                Remove Backgrounds <br />
                <span className="text-[#7c3aed]">
                  In Seconds
                </span>
              </h1>

              {/* Subtitle */}
              <p 
                className="text-gray-300 text-xl max-w-xl"
                style={{ transitionDelay: "0.2s" }}
              >
                Upload any image and get professional-grade transparent backgrounds instantly.
              </p>

              {/* CTA Buttons */}
              <div ref={ctaRef} 
                className="scroll-reveal from-left flex gap-4 flex-wrap"
                style={{ transitionDelay: "0.3s" }}
              >
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="btn-primary px-8 py-4 flex items-center gap-2"
                  >
                    Dashboard <FiArrowRight />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn-primary px-8 py-4 flex items-center gap-2"
                    >
                      Start Free <FiArrowRight />
                    </Link>
                    <Link
                      to="/login"
                      className="btn-secondary px-8 py-4"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Features Grid */}
              <div 
                ref={featuresRef}
                className="scroll-reveal from-bottom stagger-container"
                style={{ transitionDelay: "0.4s" }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <Feature icon={<FiCheck />} text="Secured Payment" index={0} />
                  <Feature icon={<FiUpload />} text="Unlimited Uploads" index={1} />
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div 
              ref={imageRef}
              className="scroll-reveal from-right"
            >
              <img 
                src={heroImage} 
                alt="AI Background Removal Demo" 
                className="rounded-full shadow-2xl shadow-primary-500/20 hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-dark-card/30">
        <div className="container mx-auto max-w-6xl">
          <h2 
            ref={sectionTitleRef}
            className="scroll-reveal from-bottom text-center text-4xl md:text-5xl font-bold text-white mb-16"
          >
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={stepsRef(index)}
                className="scroll-reveal from-bottom card hover:border-primary-500/50 transition-all duration-500"
                style={{ 
                  "--stagger-index": index,
                  transitionDelay: `${index * 0.15}s`
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-6">
                    <div className="text-primary-500 text-2xl">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
};

// Feature Component with Animation
const Feature = ({ icon, text, index }) => {
  const featureRef = useScrollReveal();
  
  return (
    <div 
      ref={featureRef}
      className="scroll-reveal from-bottom flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300"
      style={{ "--stagger-index": index }}
    >
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
};

// Additional Features Section
const FeaturesSection = () => {
  const sectionRef = useScrollReveal();
  const featureCardsRef = useScrollRevealMap(3);
  
  const features = [
    {
      icon: <FiZap />,
      title: "Lightning Fast",
      desc: "Process images in under 2 seconds with our optimized AI"
    },
    {
      icon: <FiShield />,
      title: "Privacy First",
      desc: "Your images are automatically deleted after processing"
    },
    {
      icon: <FiBarChart2 />,
      title: "High Quality",
      desc: "4K resolution support with perfect edge detection"
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <h2 
          ref={sectionRef}
          className="scroll-reveal from-bottom text-center text-4xl md:text-5xl font-bold text-[#7c3aed] mb-16"
        >
          Why Choose Removeio
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={featureCardsRef(index)}
              className="scroll-reveal from-bottom card hover:scale-[1.02] hover:border-primary-500/50 transition-all duration-500 group"
              style={{ 
                "--stagger-index": index,
                transitionDelay: `${index * 0.1}s`
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors">
                  <div className="text-primary-500 text-2xl group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard number="50K+" label="Images Processed" delay="0s" />
          <StatCard number="99.9%" label="Accuracy Rate" delay="0.1s" />
          <StatCard number="2s" label="Avg. Processing" delay="0.2s" />
          <StatCard number="24/7" label="Uptime" delay="0.3s" />
        </div>
      </div>
    </section>
  );
};

// Stat Card Component
const StatCard = ({ number, label, delay }) => {
  const statRef = useScrollReveal();
  
  return (
    <div 
      ref={statRef}
      className="scroll-reveal from-bottom text-center p-6 bg-dark-card/50 rounded-xl border border-dark-border hover:border-primary-500/30 transition-colors duration-300"
      style={{ transitionDelay: delay }}
    >
      <div className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">{number}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
};

export default Home;