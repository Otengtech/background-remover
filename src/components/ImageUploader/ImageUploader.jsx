// components/ImageUploader/ImageUploader.jsx
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiImage, FiZap } from 'react-icons/fi';

const ImageUploader = ({ onImageUpload }) => {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-8 md:p-12 text-center hover:border-blue-500 transition-all duration-300"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      
      <motion.label
        htmlFor="file-upload"
        className="cursor-pointer block"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <FiUpload className="text-white text-3xl" />
        </div>
        
        <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Drop Your Image Here
        </h3>
        
        <p className="text-gray-400 mb-6 text-lg">
          Or click to browse files
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-gray-400 mb-8">
          <div className="flex items-center justify-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full">
            <FiImage className="text-blue-400" />
            <span>PNG, JPG, WEBP</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full">
            <FiZap className="text-purple-400" />
            <span>Max 10MB</span>
          </div>
        </div>

        {/* Upload hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-500 bg-gray-900/30 rounded-lg p-3 inline-block"
        >
          Tip: Use high-contrast images for best AI results
        </motion.div>
      </motion.label>
    </motion.div>
  );
};

export default ImageUploader;