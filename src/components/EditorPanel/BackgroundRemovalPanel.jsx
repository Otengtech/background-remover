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
      className="space-y-6"
    >
      {/* Info Section */}
      <div className="text-sm text-gray-300">
        <p className="leading-relaxed">
          Remove the background from your image using AI technology.
          <br />
          For best results, use clear images with sharp subject outlines.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRemove}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
        >
          Remove Background
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestoreOriginal}
          className="w-full py-3 bg-gray-800 border-2 border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
        >
          Restore Original
        </motion.button>
      </div>

      {/* Tips */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-300 space-y-2">
        <h5 className="text-blue-400 font-semibold flex items-center gap-2">
          <span className="text-lg">💡</span> Pro Tips
        </h5>
        <ul className="space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Works best on clear foreground subjects</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Images with uniform backgrounds remove more accurately</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Restore image anytime using "Restore Original"</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default BackgroundRemovalPanel;