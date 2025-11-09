// App.js - Fixed Mobile Menu and Export Section
import React, { useState, useRef } from "react";
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

  // In App.js - ensure this is defined properly
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

  const canvasRef = useRef(null);

  // Add this to your state declarations
  const [helpModal, setHelpModal] = useState({
    isOpen: false,
    content: "",
    title: "",
  });

  // HelpModal Component (add this to your App.js or create as separate component)
  const HelpModal = ({ isOpen, onClose, content, title }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-black border-2 border-yellow-400 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-yellow-400">{title}</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-yellow-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </motion.button>
          </div>

          {/* Content */}
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Footer */}
          <div className="flex justify-end mt-6 pt-4 border-t border-yellow-400/30">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Got it!
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  };

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

  // Enhanced export handler
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

  // Enhanced section wrapper with better styling
  const sectionWrapper = (children, className = "") => (
    <div className={`bg-black ${className}`}>{children}</div>
  );

  const renderSidebarContent = () => {
    switch (activeSidebarTab) {
      case "tools":
        return sectionWrapper(
          <div className="space-y-6">
            {/* Undo/Redo Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-yellow-400 flex items-center space-x-2">
                <FiRotateCcw className="text-yellow-400" />
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
                      ? "bg-black hover:bg-gray-800 border-2 border-yellow-400 text-yellow-400"
                      : "bg-black text-gray-600 cursor-not-allowed border-2 border-gray-700"
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
                      ? "bg-black hover:bg-gray-800 border-2 border-yellow-400 text-yellow-400"
                      : "bg-black text-gray-600 cursor-not-allowed border-2 border-gray-700"
                  }`}
                >
                  <FiRotateCw size={18} />
                  <span className="font-medium">Redo</span>
                </motion.button>
              </div>
            </div>

            {/* Tools Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-yellow-400 flex items-center space-x-2">
                <FiSettings className="text-yellow-400" />
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
                        backgroundColor:
                          activeTool === tool.id ? "" : "#1f2937",
                        borderColor: "#fbbf24",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTool(tool.id);
                        tool.action?.();
                      }}
                      className={`w-full p-4 rounded-xl flex items-start space-x-3 transition-all text-left ${
                        activeTool === tool.id
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold shadow-lg"
                          : "bg-black hover:yellow-200 border-yellow-400 text-white"
                      }`}
                    >
                      <Icon size={22} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold">{tool.name}</div>
                        {tool.description && (
                          <div
                            className={`text-sm mt-1 ${
                              activeTool === tool.id
                                ? "text-gray-800"
                                : "text-gray-400"
                            }`}
                          >
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
            <h3 className="text-lg font-semibold text-yellow-400 flex items-center space-x-2">
              <FiHelpCircle className="text-yellow-400" />
              <span>Help & Support</span>
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Documentation",
                  description: "Complete guide to using BG Remover Pro",
                  content: `
              <h2 class="text-2xl font-bold text-yellow-400 mb-4">BG Remover Pro Documentation</h2>
              
              <div class="space-y-4">
                <div class="bg-black rounded-lg p-4 border border-yellow-400">
                  <h3 class="text-lg font-semibold text-white mb-2">Getting Started</h3>
                  <p class="text-gray-300">Upload your image and use the AI-powered tools to remove backgrounds instantly.</p>
                </div>
                
                <div class="bg-black rounded-lg p-4 border border-yellow-400">
                  <h3 class="text-lg font-semibold text-white mb-2">Tools Available</h3>
                  <ul class="text-gray-300 list-disc list-inside space-y-1">
                    <li><strong>Remove BG:</strong> AI background removal</li>
                    <li><strong>Adjust:</strong> Brightness, contrast, saturation</li>
                  </ul>
                </div>
                
                <div class="bg-black rounded-lg p-4 border border-yellow-400">
                  <h3 class="text-lg font-semibold text-white mb-2">Export Options</h3>
                  <p class="text-gray-300">Download in PNG, JPG, or WebP format with quality controls.</p>
                </div>
              </div>
            `,
                },
                {
                  title: "💡 Tips & Tricks",
                  description: "Get the most out of the editor",
                  content: `
              <h2 class="text-2xl font-bold text-yellow-400 mb-4">Pro Tips & Tricks</h2>
              
              <div class="space-y-4">
                <div class="bg-black rounded-lg p-4 border border-yellow-400">
                  <h3 class="text-lg font-semibold text-white mb-2">Better Background Removal</h3>
                  <ul class="text-gray-300 list-disc list-inside space-y-1">
                    <li>Use high-contrast images for best results</li>
                    <li>Ensure good lighting in original photos</li>
                    <li>Use the manual brush for fine-tuning edges</li>
                  </ul>
                </div>
                
                <div class="bg-black rounded-lg p-4 border border-yellow-400">
                  <h3 class="text-lg font-semibold text-white mb-2">Keyboard Shortcuts</h3>
                  <ul class="text-gray-300 list-disc list-inside space-y-1">
                    <li><kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+Z</kbd> - Undo</li>
                    <li><kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+Y</kbd> - Redo</li>
                    <li><kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+D</kbd> - Download</li>
                  </ul>
                </div>
                
                <div class="bg-black rounded-lg p-4 border border-yellow-400">
                  <h3 class="text-lg font-semibold text-white mb-2">Export Tips</h3>
                  <ul class="text-gray-300 list-disc list-inside space-y-1">
                    <li>Use PNG for transparent backgrounds</li>
                    <li>Use JPG for smaller file sizes</li>
                    <li>WebP offers best compression</li>
                    <li>Adjust quality to balance size vs clarity</li>
                  </ul>
                </div>
              </div>
            `,
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
                  className="w-full p-4 bg-black rounded-xl hover:bg-gray-800 transition-all text-left border-2 border-yellow-400 group"
                >
                  <div className="font-semibold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                    {item.description}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Quick Support Links */}
            <div className="bg-gray-black">
              <h4 className="text-yellow-400 font-semibold mb-2">
                Quick Links
              </h4>
              <div className="text-sm text-gray-100 space-y-1">
                <div>• File formats: PNG, JPG, WebP</div>
                <div>• Max file size: 10MB</div>
                <div>• Supported: All modern browsers</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PremiumProvider>
    <div className="min-h-screen bg-black text-white">
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
        className="border-b border-gray-800 p-4 flex justify-between items-center bg-black"
      >
        <div className="flex items-center space-x-3 md:pl-16 pl-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            RemoveIt
          </h1>
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
                    ? "bg-yellow-400 text-black border-yellow-400 shadow-lg"
                    : "bg-transparent text-yellow-400"
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
          className="lg:hidden bg-black text-yellow-400"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? <FiX size={22} /> : <FiMenu size={24} />}
        </motion.button>
      </motion.header>
      {/* Enhanced Mobile Slide-Out Navigation - Full Screen Width */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-80 z-40"
              onClick={() => setMobileNavOpen(false)}
            />

            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed top-0 left-0 w-full h-full bg-black border-yellow-400 z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-yellow-400/30 bg-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-yellow-400">
                      RemoveIt
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileNavOpen(false)}
                    className="p-2 text-yellow-400 hover:bg-gray-800 rounded-lg"
                  >
                    <FiX size={24} />
                  </motion.button>
                </div>
              </div>

              {/* Navigation Tabs */}
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
                          ? "bg-yellow-400 text-black font-bold"
                          : "bg-gray-black hover:bg-gray-black text-yellow-400"
                      }`}
                    >
                      <Icon size={22} />
                      <span className="text-lg font-semibold">{tab.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick Stats/Info */}
              <div className="p-6 border-t border-yellow-400/30">
                <div className="bg-black">
                  <h3 className="text-yellow-400 font-semibold mb-2">
                    Quick Tips
                  </h3>
                  <ul className="text-gray-100 text-sm space-y-1">
                    <li>Use Remove BG for automatic background removal</li>
                    <li>Adjust settings for fine-tuning</li>
                    <li>Export in PNG for transparent backgrounds</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar content - only visible when Tools tab is active on desktop */}
        <div className="hidden lg:block">{renderSidebarContent()}</div>

        {/* Mobile Sidebar - shows all tabs */}
        <div className="lg:hidden">{renderSidebarContent()}</div>

        {/* MAIN EDITOR */}
        <div className="lg:col-span-2">
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
                    className="flex-1 px-6 py-3 rounded-full hover:bg-gray-800 transition-colors text-yellow-400 font-semibold"
                  >
                    Upload New Image
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg"
                  >
                    Export Image
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TOOL PANEL - Only show when tools tab is active and image is loaded */}
        {originalImage && activeSidebarTab === "tools" && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1"
          >
            <EditorPanel
              adjustments={state} // This should now be defined
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
        toastClassName="bg-gray-800 border-2 border-yellow-400 text-white font-semibold"
        progressClassName="bg-gradient-to-r from-yellow-400 to-orange-500"
      />
    </div>
    </PremiumProvider>
  );
}

export default App;
