// components/EditorPanel/BackgroundRemovalPanel.jsx
import React from "react";
import { motion } from "framer-motion";

const BackgroundRemovalPanel = ({ onRemoveBackground, onRestoreOriginal }) => {
  const handleRemove = () => {
    onRemoveBackground("api", { sensitivity: 0.15 });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col space-y-6" /* ← h-full removed */
    >
      {/* Info Section */}
      <div className="text-sm text-gray-100">
        <p className="leading-relaxed">
          Remove the background from your image using AI technology.
          <br />
          For best results, use clear images with sharp subject outlines.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleRemove}
          className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition"
        >
          Remove Background
        </button>

        <button
          onClick={onRestoreOriginal}
          className="w-full py-3 bg-black border border-yellow-400 text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition"
        >
          Restore Original
        </button>
      </div>

      {/* Tips */}
      <div className="bg-black text-sm text-gray-100 space-y-1">
        <h5 className="text-yellow-400">💡 Tips</h5>
        <p>• Works best on clear foreground subjects</p>
        <p>• Images with uniform backgrounds remove more accurately</p>
        <p>• Restore image anytime using "Restore Original"</p>
      </div>
    </motion.div>
  );
};

export default BackgroundRemovalPanel;
