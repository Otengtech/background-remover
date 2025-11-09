// components/Preview/Preview.jsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
      className="relative bg-black overflow-hidden shadow-lg"
    >
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Image Container */}
      <div className="relative min-h-[450px] flex items-center justify-center p-6">
        {processedImage || originalImage ? (
          <motion.img
            ref={imageRef}
            src={processedImage || originalImage}
            alt="Processed"
            className="max-w-full max-h-[420px] object-contain transition-all duration-300 select-none pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        ) : (
          <p className="text-gray-500 text-center italic">
            Upload or process an image to preview it here.
          </p>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};

export default Preview;