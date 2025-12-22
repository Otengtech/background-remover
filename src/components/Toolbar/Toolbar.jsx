// components/Toolbar/Toolbar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiRotateCcw, FiRotateCw, FiSettings, FiZap } from 'react-icons/fi';

const Toolbar = ({ tools, activeTool, onToolSelect, onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="space-y-4">
      {/* Undo/Redo */}
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#1e293b" }}
          whileTap={{ scale: 0.95 }}
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex-1 py-3 rounded-lg flex items-center justify-center space-x-2 border transition-all ${
            canUndo 
              ? 'border-blue-500 bg-gray-900 hover:bg-gray-800 text-blue-400' 
              : 'border-gray-700 bg-gray-900 text-gray-600 cursor-not-allowed'
          }`}
        >
          <FiRotateCcw />
          <span>Undo</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#1e293b" }}
          whileTap={{ scale: 0.95 }}
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex-1 py-3 rounded-lg flex items-center justify-center space-x-2 border transition-all ${
            canRedo 
              ? 'border-blue-500 bg-gray-900 hover:bg-gray-800 text-blue-400' 
              : 'border-gray-700 bg-gray-900 text-gray-600 cursor-not-allowed'
          }`}
        >
          <FiRotateCw />
          <span>Redo</span>
        </motion.button>
      </div>

      {/* Tools */}
      <div className="space-y-2">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <motion.button
              key={tool.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onToolSelect(tool.id);
                tool.action?.();
              }}
              className={`w-full p-4 rounded-xl flex items-center space-x-3 transition-all border ${
                activeTool === tool.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg'
                  : 'border-blue-500 bg-gray-900 hover:bg-gray-800 text-blue-400'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{tool.name}</span>
              {tool.premium && (
                <FiZap size={12} className="text-yellow-400 ml-auto" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Toolbar;