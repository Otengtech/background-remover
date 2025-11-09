// components/AdjustmentSliders/AdjustmentSliders.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiCircle, FiDroplet, FiZoomIn, FiRotateCw } from "react-icons/fi";
import { TbBlur } from "react-icons/tb";

const AdjustmentSliders = ({ adjustments, onAdjustmentsChange }) => {
  // Safe default adjustments
  const safeAdjustments = adjustments || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    zoom: 100,
    rotation: 0
  };

  const handleChange = (key, value) => {
    if (onAdjustmentsChange) {
      onAdjustmentsChange({
        ...safeAdjustments,
        [key]: value
      });
    }
  };

  const adjustmentConfigs = [
    {
      key: 'brightness',
      label: 'Brightness',
      icon: FiSun,
      min: 0,
      max: 200,
      step: 1,
      value: safeAdjustments.brightness || 100
    },
    {
      key: 'contrast',
      label: 'Contrast',
      icon: FiCircle,
      min: 0,
      max: 200,
      step: 1,
      value: safeAdjustments.contrast || 100
    },
    {
      key: 'saturation',
      label: 'Saturation',
      icon: FiDroplet,
      min: 0,
      max: 200,
      step: 1,
      value: safeAdjustments.saturation || 100
    },
    {
      key: 'blur',
      label: 'Blur',
      icon: TbBlur,
      min: 0,
      max: 20,
      step: 0.1,
      value: safeAdjustments.blur || 0
    },
    {
      key: 'zoom',
      label: 'Zoom',
      icon: FiZoomIn,
      min: 10,
      max: 300,
      step: 1,
      value: safeAdjustments.zoom || 100
    },
    {
      key: 'rotation',
      label: 'Rotation',
      icon: FiRotateCw,
      min: -180,
      max: 180,
      step: 1,
      value: safeAdjustments.rotation || 0
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-yellow-400 flex items-center space-x-2">
        <FiSun className="text-yellow-400" />
        <span>Image Adjustments</span>
      </h3>
      
      <div className="space-y-4">
        {adjustmentConfigs.map((config, index) => {
          const Icon = config.icon;
          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white">
                  <Icon size={16} className="text-yellow-400" />
                  <span className="font-medium">{config.label}</span>
                </div>
                <span className="text-yellow-400 font-mono text-sm">
                  {config.value}{config.key === 'rotation' ? '°' : '%'}
                </span>
              </div>
              
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={config.value}
                onChange={(e) => handleChange(config.key, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>{config.min}{config.key === 'rotation' ? '°' : '%'}</span>
                <span>{config.max}{config.key === 'rotation' ? '°' : '%'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdjustmentSliders;