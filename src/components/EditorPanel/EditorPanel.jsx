// components/EditorPanel/EditorPanel.jsx
import React from 'react';
import { motion } from 'framer-motion';
import AdjustmentSliders from './AdjustmentSliders';
import BackgroundRemoval from './BackgroundRemovalPanel';

const EditorPanel = ({ 
  adjustments = {}, 
  onAdjustmentsChange, 
  activeTool, 
  onRemoveBackground, 
  onRestoreOriginal 
}) => {
  
  // Ensure adjustments has proper defaults
  const safeAdjustments = adjustments || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    zoom: 100,
    rotation: 0
  };

  const handleAdjustmentsChange = (newAdjustments) => {
    if (onAdjustmentsChange) {
      onAdjustmentsChange(newAdjustments);
    }
  };

  return (
    <div className="bg-black space-y-6">
      <h2 className="text-xl font-bold text-yellow-400 text-center">
        {activeTool === 'remove-bg' ? 'Background Removal' : 'Image Adjustments'}
      </h2>

      <div className="space-y-6">
        {activeTool === 'remove-bg' ? (
          <BackgroundRemoval
            onRemoveBackground={onRemoveBackground}
            onRestoreOriginal={onRestoreOriginal}
          />
        ) : (
          <AdjustmentSliders
            adjustments={safeAdjustments}
            onAdjustmentsChange={handleAdjustmentsChange}
          />
        )}
      </div>
    </div>
  );
};

export default EditorPanel;