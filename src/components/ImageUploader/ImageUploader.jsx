// components/ImageUploader/ImageUploader.jsx
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiImage } from 'react-icons/fi';

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
      className="border-2 border-dashed border-gray-600 rounded-2xl p-12 text-center hover:border-yellow-400 transition-colors"
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
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <FiUpload className="text-black text-2xl" />
        </div>
        
        <h3 className="text-2xl font-bold mb-2">
          Drop your image here
        </h3>
        
        <p className="text-gray-400 mb-6">
          or click to browse files
        </p>
        
        <div className="flex justify-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <FiImage />
            <span>PNG, JPG, WEBP</span>
          </div>
          <span>•</span>
          <span>Max 10MB</span>
        </div>
      </motion.label>
    </motion.div>
  );
};

export default ImageUploader;