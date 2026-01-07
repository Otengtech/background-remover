import { Link } from "react-router-dom";
import {
  useScrollReveal,
  useScrollRevealMap,
} from "../hooks/useIntersectionObserver";
import heroImage from "../assets/heroImage.avif";
import {
  FiZap,
  FiCheck,
  FiArrowRight,
  FiUpload,
  FiShield,
  FiBarChart2,
  FiDownload,
  FiCpu,
  FiMessageSquare,
  FiUploadCloud,
  FiUsers,
  FiClock,
} from "react-icons/fi";
import MetaTags from '../components/MetaTags';

const Home = () => {

  // Create refs for animations
  const heroTagRef = useScrollReveal();
  const titleRef = useScrollReveal();
  const headingRef = useScrollReveal();
  const subtitleRef = useScrollReveal();
  const ctaRef = useScrollReveal();
  const imageRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const sectionTitleRef = useScrollReveal();
  const stepsRef = useScrollRevealMap(3);

  const steps = [
    {
      icon: <FiUploadCloud />,
      title: "Upload Your Image",
      description: "Drag & drop or select any image format",
      details: "Supports JPG, PNG, WebP, SVG, and more",
      color: "from-blue-500 to-cyan-500",
      action: "Select File",
      time: "Instant",
    },
    {
      icon: <FiCpu />,
      title: "AI Magic Processing",
      description: "Advanced AI removes backgrounds perfectly",
      details: "Uses neural networks for precise edge detection",
      color: "from-purple-500 to-pink-500",
      action: "Process Now",
      time: "2-5 seconds",
    },
    {
      icon: <FiDownload />,
      title: "Download & Share",
      description: "Get high-quality transparent PNG",
      details: "Also available as JPG with custom background",
      color: "from-orange-500 to-red-500",
      action: "Download",
      time: "Instant",
    },
  ];

  return (
    <div className="">
      <MetaTags
        title="Remove Backgrounds Instantly | Free AI Background Remover - Removerio"
        description="Remove image backgrounds instantly with AI. 100% FREE, no signup required."
      />
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
                <span className="text-[#7c3aed]">In Seconds</span>
              </h1>

              {/* Subtitle */}
              <p
                className="text-gray-300 text-xl max-w-xl"
                style={{ transitionDelay: "0.2s" }}
              >
                Upload any image and get professional-grade transparent
                backgrounds instantly.
              </p>

              {/* CTA Buttons */}
              <div
                ref={ctaRef}
                className="scroll-reveal from-left flex gap-4 flex-wrap"
                style={{ transitionDelay: "0.3s" }}
              >
                  <div className="flex items-center justify-center space-x-3">
                    <Link
                      to="/dashboard"
                      className="btn-primary px-8 py-4 flex items-center gap-2"
                    >
                      Try Now
                      <FiArrowRight />
                    </Link>
                    <Link
                      to="/support"
                      className="btn-primary px-8 py-4 flex items-center gap-2"
                    >
                      Support
                      <FiArrowRight />
                    </Link>
                  </div>
              </div>
            </div>

            {/* Right Image */}
            <div ref={imageRef} className="scroll-reveal from-right">
              <img
                src={heroImage}
                alt="AI Background Removal Demo"
                className="rounded-full shadow-2xl shadow-primary-500/20 hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      <div className=" text-white md:py-28 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Hero Section */}
          <div
            className="text-center scroll-reveal from-bottom mb-16"
            ref={headingRef}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About <span className=" text-[#7c3aed]">Removerio</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Making background removal simple, fast, and accessible for
              everyone
            </p>
          </div>

          {/* Our Story */}
          <div className="scroll-reveal from-bottom mb-8" ref={subtitleRef}>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FiUsers className="mr-3 text-blue-400" />
              Our Story
            </h2>
            <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 items-center justify-center leading-[2rem] gap-4 text-md text-gray-300">
              <p>
                Removerio was born from a simple observation: removing
                backgrounds from images shouldn't require expensive software or
                complex skills. We saw individuals and businesses struggling
                with clunky tools and decided to build something better.
              </p>
              <p>
                Founded in 2025, our mission is to democratize professional
                image editing by providing AI-powered tools that are both
                powerful and easy to use. What started as a small project has
                grown into a platform trusted by thousands of users worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

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
                className="scroll-reveal from-bottom card hover:border-primary-500/50 transition-all duration-500 group"
                style={{
                  "--stagger-index": index,
                  transitionDelay: `${index * 0.15}s`,
                }}
              >
                <div className="flex flex-col items-center text-lleft p-6">
                  {/* Step Number */}
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-300">
                    {index + 1}
                  </div>

                  {/* Icon with gradient background */}
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="text-white text-3xl">{step.icon}</div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 mb-2">{step.description}</p>

                  {/* Details */}
                  <p className="text-sm text-gray-400 mb-4">{step.details}</p>

                  {/* Time indicator */}
                  <div
                    className={`flex items-center ${step.color} justify-center text-md mb-4`}
                  >
                    <FiClock className="mr-2" />
                    {step.time}
                  </div>
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
  const contactRef = useScrollReveal();
  const features = [
    {
      icon: <FiZap />,
      title: "Lightning Fast",
      desc: "Process images in under 2 seconds with our optimized AI",
    },
    {
      icon: <FiShield />,
      title: "Privacy First",
      desc: "Your images are automatically deleted after processing",
    },
    {
      icon: <FiBarChart2 />,
      title: "High Quality",
      desc: "4K resolution support with perfect edge detection",
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <h2
          ref={sectionRef}
          className="scroll-reveal from-bottom text-center text-4xl md:text-5xl font-bold text-white mb-16"
        >
          Why Choose Removerio
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={featureCardsRef(index)}
              className="scroll-reveal from-bottom card hover:scale-[1.02] hover:border-primary-500/50 transition-all duration-500 group"
              style={{
                "--stagger-index": index,
                transitionDelay: `${index * 0.1}s`,
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors">
                  <div className="text-purple-500 text-4xl group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
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
      {/* Contact */}
      <section
        ref={contactRef}
        className="scroll-reveal from-bottom mt-10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-2xl p-8 text-center"
      >
        <FiMessageSquare className="text-4xl text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Start processing images</h2>
          <div>
            <p className="text-gray-300 mb-6">
              Move to bg remover page to start processing images.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
              >
                Start Removing
              </Link>
            </div>
          </div>
      </section>
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
      <div className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">
        {number}
      </div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
};

export default Home;
