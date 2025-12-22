// components/Preview/Preview.jsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

const Preview = ({ originalImage, processedImage, canvasRef, adjustments, isProcessing }) => {
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current && adjustments) {
      const { brightness, contrast, saturation, blur, zoom, rotation } = adjustments;

      imageRef.current.style.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        blur(${blur}px)
      `.trim();

      imageRef.current.style.transform = `
        scale(${zoom / 100})
        rotate(${rotation}deg)
      `.trim();
    }
  }, [adjustments]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
    >
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
          />
          <div className="text-center">
            <p className="text-white font-semibold text-lg mb-2">
              AI is processing your image
            </p>
            <p className="text-blue-400 text-sm">
              Removing background with AI...
            </p>
          </div>
        </div>
      )}

      {/* Image Container */}
      <div className="relative min-h-[500px] flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-black">
        {processedImage || originalImage ? (
          <motion.img
            ref={imageRef}
            src={processedImage || originalImage}
            alt="Processed"
            className="max-w-full max-h-[460px] object-contain transition-all duration-500 select-none pointer-events-none shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <FiLoader className="text-blue-400 text-2xl animate-pulse" />
            </div>
            <p className="text-gray-500 text-lg italic">
              Upload an image to start editing
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Your processed image will appear here
            </p>
          </div>
        )}
      </div>

      {/* Image Info Bar */}
      {(processedImage || originalImage) && !isProcessing && (
        <div className="bg-gray-900/80 border-t border-gray-800 p-4">
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-400">
              {adjustments && (
                <div className="flex gap-4">
                  <span className="text-blue-400">Zoom: {adjustments.zoom}%</span>
                  <span className="text-purple-400">Rotate: {adjustments.rotation}°</span>
                </div>
              )}
            </div>
            <div className="text-gray-500">
              {processedImage ? "Processed" : "Original"} Image
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};

export default Preview;