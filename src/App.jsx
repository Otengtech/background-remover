// App.js - Complete Redesign with Landing Page
import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumProvider } from './hooks/usePremium';
import {
  FiUpload,
  FiDownload,
  FiSettings,
  FiEdit,
  FiImage,
  FiHome, 
  FiUser,
  FiCreditCard,
  FiHelpCircle,
  FiMenu,
  FiX,
  FiRotateCcw,
  FiRotateCw,
  FiCheck,
  FiStar,
  FiZap,
  FiShield,
  FiGlobe,
  FiCamera,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiArrowRight,
  FiPlay
} from "react-icons/fi";
import { IoColorPalette, IoCut, IoResize } from "react-icons/io5";
import "./App.css";

import ImageUploader from "./components/ImageUploader/ImageUploader";
import EditorPanel from "./components/EditorPanel/EditorPanel";
import Preview from "./components/Preview/Preview";
import ExportPanel from "./components/ExportPanel/ExportPanel";
import { useImageProcessor } from "./hooks/useImageProcessor";
import { useUndoRedo } from "./hooks/useUndoRedo";

import "react-toastify/dist/ReactToastify.css";

function App() {
  const {
    originalImage,
    processedImage,
    isProcessing,
    processImage,
    clearImages,
    removeBackground,
    restoreOriginal,
  } = useImageProcessor();

  const initialAdjustments = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    zoom: 100,
    rotation: 0,
  };

  const { state, setState, undo, redo, canUndo, canRedo } =
    useUndoRedo(initialAdjustments);

  const [activeTool, setActiveTool] = useState("remove-bg");
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState("tools");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLandingPage, setIsLandingPage] = useState(true); // New state for landing page

  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Auto scroll to features when coming from landing page
  useEffect(() => {
    if (!isLandingPage && featuresRef.current) {
      setTimeout(() => {
        featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [isLandingPage]);

  // Ad script (keep as is)
  useEffect(() => {
    const container = document.getElementById("ad-container-300x250");
    if (container) {
      container.innerHTML = "";
      const script = document.createElement("script");
      script.innerHTML = `
        atOptions = {
          'key' : '6676d68ba7d23941b9617404b8afd159',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;
      container.appendChild(script);

      const script2 = document.createElement("script");
      script2.src =
        "//www.highperformanceformat.com/6676d68ba7d23941b9617404b8afd159/invoke.js";
      script2.async = true;
      container.appendChild(script2);
    }
  }, []);

  // HelpModal Component
  const HelpModal = ({ isOpen, onClose, content, title }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-black border-2 border-blue-500 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-500">{title}</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-blue-500 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </motion.button>
          </div>
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <div className="flex justify-end mt-6 pt-4 border-t border-blue-500/30">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-black font-semibold rounded-lg hover:bg-blue-400 transition-colors"
            >
              Got it!
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  };

  const [helpModal, setHelpModal] = useState({
    isOpen: false,
    content: "",
    title: "",
  });

  const handleImageUpload = async (file) => {
    if (!file) return toast.error("No file provided");
    try {
      await processImage(file);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to process image");
    }
  };

  const handleBackgroundRemove = async (method = "api", options = {}) => {
    if (!originalImage) return toast.warning("Upload an image first");
    try {
      await removeBackground(method, options);
      setActiveTool("remove-bg");
    } catch (error) {
      toast.error("Failed to remove background");
    }
  };

  const handleExport = () => {
    if (!processedImage && !originalImage) {
      toast.warning("No image to export");
      return;
    }
    if (!processedImage) {
      toast.info("No processed image found. Using original image for export.");
    }
    setShowExportPanel(true);
  };

  const handleGetStarted = () => {
    setIsLandingPage(false);
  };

  const handleGoToLanding = () => {
    setIsLandingPage(true);
    if (heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Landing Page Components
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="scroll-reveal from-bottom"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Removeio
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                AI-Powered Background Removal & Image Editing Studio
                <br />
                <span className="text-blue-400 font-semibold">
                  Professional results in seconds
                </span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="scroll-reveal from-bottom"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full text-lg flex items-center gap-2 hover:shadow-2xl hover:shadow-blue-500/30 transition-all"
                >
                  <FiZap />
                  Start Editing Free
                  <FiArrowRight />
                </motion.button>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
              {[
                { value: "10M+", label: "Images Processed", icon: FiCamera },
                { value: "99.8%", label: "Accuracy Rate", icon: FiAward },
                { value: "50K+", label: "Happy Users", icon: FiUsers },
                { value: "<2s", label: "Processing Time", icon: FiTrendingUp },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="scroll-reveal from-bottom"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all hover:scale-105">
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4 scroll-reveal from-bottom"
            >
              Why Choose <span className="text-blue-500">Removeio</span>?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-400 scroll-reveal from-bottom"
              style={{ transitionDelay: "0.1s" }}
            >
              Everything you need for professional image background remover
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FiZap,
                title: "Lightning Fast AI",
                description: "Remove backgrounds in under 2 seconds with our advanced AI algorithms",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: FiShield,
                title: "Privacy First",
                description: "Your images are never stored or shared. Processed securely in real-time",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: IoColorPalette,
                title: "Advanced Tools",
                description: "Complete editing suite with filters, adjustments, and effects",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: FiGlobe,
                title: "Multi-Format",
                description: "Export in PNG, JPG, WebP with transparent backgrounds",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: FiStar,
                title: "Pro Results",
                description: "Crisp, clean edges perfect for e-commerce and professionals",
                color: "from-yellow-500 to-amber-500"
              },
              {
                icon: FiDownload,
                title: "Batch Processing",
                description: "Coming soon: Process multiple images at once",
                color: "from-indigo-500 to-blue-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="scroll-reveal from-bottom"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-blue-500/50 transition-all h-full hover:scale-[1.02]">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="scroll-reveal section-entrance"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Images?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of creators, marketers, and professionals who trust Removeio
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );

  // Main Editor App (existing functionality)
  const EditorApp = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <AnimatePresence>
        {helpModal.isOpen && (
          <HelpModal
            isOpen={helpModal.isOpen}
            onClose={() =>
              setHelpModal({ isOpen: false, content: "", title: "" })
            }
            content={helpModal.content}
            title={helpModal.title}
          />
        )}
      </AnimatePresence>

      {/* HEADER */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-gray-800 p-4 flex justify-between items-center bg-gray-900/80 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-3 md:pl-16 pl-4">
          <button 
            onClick={handleGoToLanding}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Removeio
            </h1>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-3 md:pr-16 pr-4">
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSidebarTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all ${
                  activeSidebarTab === tab.id
                    ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                    : "bg-transparent text-blue-400 hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                <span className="font-semibold">{tab.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "#1f2937" }}
          whileTap={{ scale: 0.9 }}
          className="lg:hidden bg-gray-800 text-blue-400 p-2 rounded-lg"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? <FiX size={22} /> : <FiMenu size={24} />}
        </motion.button>
      </motion.header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-80 z-40"
              onClick={() => setMobileNavOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed top-0 left-0 w-full h-full bg-gray-900 border-blue-500 z-50 overflow-y-auto"
            >
              <div className="p-6 border-b border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-blue-500">
                      Removeio
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileNavOpen(false)}
                    className="p-2 text-blue-500 hover:bg-gray-800 rounded-lg"
                  >
                    <FiX size={24} />
                  </motion.button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {sidebarTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveSidebarTab(tab.id);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full p-4 rounded-xl flex items-center space-x-4 transition-all ${
                        activeSidebarTab === tab.id
                          ? "bg-blue-500 text-white font-bold"
                          : "bg-gray-800 hover:bg-gray-700 text-blue-400"
                      }`}
                    >
                      <Icon size={22} />
                      <span className="text-lg font-semibold">{tab.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar content */}
        <div className="hidden lg:block">{renderSidebarContent()}</div>
        <div className="lg:hidden">{renderSidebarContent()}</div>

        {/* MAIN EDITOR */}
        <div className="lg:col-span-2">
          <div className="my-2 flex justify-center">
            <div id="ad-container-300x250"></div>
          </div>
          
          <AnimatePresence mode="wait">
            {!originalImage ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <ImageUploader onImageUpload={handleImageUpload} />
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <Preview
                  originalImage={originalImage}
                  processedImage={processedImage}
                  canvasRef={canvasRef}
                  adjustments={state}
                  isProcessing={isProcessing}
                />
                <div className="flex space-x-4 md:px-6">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#1f2937" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearImages}
                    className="flex-1 px-6 py-3 rounded-full hover:bg-gray-800 transition-colors text-blue-400 font-semibold border border-gray-700"
                  >
                    Upload New Image
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full hover:from-blue-400 hover:to-purple-400 transition-all shadow-lg hover:shadow-blue-500/30"
                  >
                    Export Image
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TOOL PANEL */}
        {originalImage && activeSidebarTab === "tools" && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1"
          >
            <EditorPanel
              adjustments={state}
              onAdjustmentsChange={setState}
              activeTool={activeTool}
              onRemoveBackground={handleBackgroundRemove}
              onRestoreOriginal={restoreOriginal}
            />
          </motion.div>
        )}
      </div>

      {/* EXPORT MODAL */}
      <AnimatePresence>
        {showExportPanel && (
          <ExportPanel
            processedImage={processedImage || originalImage}
            onClose={() => setShowExportPanel(false)}
          />
        )}
      </AnimatePresence>
      
      <ToastContainer
        position="bottom-right"
        theme="dark"
        toastClassName="bg-gray-800 border-2 border-blue-500 text-white font-semibold"
        progressClassName="bg-gradient-to-r from-blue-500 to-purple-500"
      />
    </div>
  );

  const sidebarTabs = [
    { id: "tools", name: "Tools", icon: FiHome },
    { id: "help", name: "Help & Support", icon: FiHelpCircle },
  ];

  const tools = [
    {
      id: "remove-bg",
      name: "Remove Background",
      icon: IoCut,
      action: () => handleBackgroundRemove("api"),
      description: "AI-powered background removal",
    },
    {
      id: "adjust",
      name: "Adjustments",
      icon: FiEdit,
      description: "Brightness, contrast, saturation",
    },
  ];

  const sectionWrapper = (children, className = "") => (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 ${className}`}>
      {children}
    </div>
  );

  const renderSidebarContent = () => {
    switch (activeSidebarTab) {
      case "tools":
        return sectionWrapper(
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 flex items-center space-x-2">
                <FiRotateCcw className="text-blue-400" />
                <span>History</span>
              </h3>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#1f2937" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={undo}
                  disabled={!canUndo}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                    canUndo
                      ? "bg-gray-800 hover:bg-gray-700 border-2 border-blue-500 text-blue-400"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed border-2 border-gray-700"
                  }`}
                >
                  <FiRotateCcw size={18} />
                  <span className="font-medium">Undo</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#1f2937" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={redo}
                  disabled={!canRedo}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                    canRedo
                      ? "bg-gray-800 hover:bg-gray-700 border-2 border-blue-500 text-blue-400"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed border-2 border-gray-700"
                  }`}
                >
                  <FiRotateCw size={18} />
                  <span className="font-medium">Redo</span>
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 flex items-center space-x-2">
                <FiSettings className="text-blue-400" />
                <span>Editing Tools</span>
              </h3>
              <div className="space-y-3">
                {tools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.button
                      key={tool.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: activeTool === tool.id ? "" : "#1f2937",
                        borderColor: "#3b82f6",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTool(tool.id);
                        tool.action?.();
                      }}
                      className={`w-full p-4 rounded-xl flex items-start space-x-3 transition-all text-left ${
                        activeTool === tool.id
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg"
                          : "bg-gray-800 hover:bg-gray-700 border-blue-500 text-white"
                      }`}
                    >
                      <Icon size={22} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold">{tool.name}</div>
                        {tool.description && (
                          <div className={`text-sm mt-1 ${
                            activeTool === tool.id
                              ? "text-gray-200"
                              : "text-gray-400"
                          }`}>
                            {tool.description}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "help":
        return sectionWrapper(
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-400 flex items-center space-x-2">
              <FiHelpCircle className="text-blue-400" />
              <span>Help & Support</span>
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Documentation",
                  description: "Complete guide to using Removerio",
                  content: `<h2>Complete Documentation</h2><p>Switch to the Background Remover tab and upload high resolution image, click on the remove background button.
                  After that, click on export image to choose for either free or paid image resolution. Choose your format 
                  to download it instantly. Payments are secured so your details ate protected. No other user info are collected 
                  on this website. You can switch to the adjustments tab to also adjust the contrast and other features of you image </p>`
                },
                {
                  title: "Tips & Tricks",
                  description: "Get the most out of the editor",
                  content: `<h2>Pro Tips</h2><p>Always use high resolution images. Export images using paid plan to enjoy exporting 
                  fully high image resolution</p>`
                },
              ].map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, backgroundColor: "#1f2937" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setHelpModal({
                      isOpen: true,
                      content: item.content,
                      title: item.title,
                    })
                  }
                  className="w-full p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all text-left border-2 border-blue-500 group"
                >
                  <div className="font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                    {item.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PremiumProvider>
      {isLandingPage ? <LandingPage /> : <EditorApp />}
    </PremiumProvider>
  );
}

export default App;