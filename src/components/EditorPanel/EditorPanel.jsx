// components/EditorPanel/EditorPanel.jsx
import React from 'react';
import AdjustmentSliders from './AdjustmentSliders';
import BackgroundRemovalPanel from './BackgroundRemovalPanel';

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
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 space-y-6 slide-in">
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        {activeTool === 'remove-bg' ? 'Background Removal' : 'Image Adjustments'}
      </h2>

      <div className="space-y-6">
        {activeTool === 'remove-bg' ? (
          <BackgroundRemovalPanel
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

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-400 text-center">
          <p>Use Undo/Redo in sidebar to revert changes</p>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;