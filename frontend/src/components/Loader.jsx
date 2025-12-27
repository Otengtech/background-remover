const Loader = ({ 
  size = "md",
  color = "primary",
  fullScreen = false,
  withText = false,
  text = "Loading..."
}) => {
  // Size variants
  const sizes = {
    sm: "w-8 h-8 border-3",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4",
    xl: "w-20 h-20 border-4"
  };

  // Color variants
  const colors = {
    primary: {
      track: "border-primary-500/20",
      active: "border-t-primary-500"
    },
    secondary: {
      track: "border-gray-400/20",
      active: "border-t-gray-600"
    },
    white: {
      track: "border-white/20",
      active: "border-t-white"
    },
    success: {
      track: "border-green-500/20",
      active: "border-t-green-500"
    },
    warning: {
      track: "border-yellow-500/20",
      active: "border-t-yellow-500"
    },
    danger: {
      track: "border-red-500/20",
      active: "border-t-red-500"
    }
  };

  const selectedSize = sizes[size] || sizes.md;
  const selectedColor = colors[color] || colors.primary;

  return (
    <div 
      className={`flex flex-col items-center justify-center ${
        fullScreen ? "min-h-screen" : "min-h-[200px]"
      }`}
      role="status"
      aria-live="polite"
      aria-label={withText ? text : "Loading content"}
    >
      {/* Spinner Container */}
      <div className="relative">
        {/* Background track */}
        <div 
          className={`${selectedSize} rounded-full ${selectedColor.track}`}
          aria-hidden="true"
        />
        
        {/* Animated spinner */}
        <div 
          className={`${selectedSize} border-transparent rounded-full animate-spin absolute top-0 left-0 ${selectedColor.active}`}
          aria-hidden="true"
        />
        
        {/* Reduced motion alternative */}
        <style jsx>{`
          @media (prefers-reduced-motion: reduce) {
            .animate-spin {
              animation: spin 1.5s linear infinite;
            }
          }
        `}</style>
      </div>

      {/* Optional loading text */}
      {withText && (
        <p className={`mt-4 text-sm font-medium ${
          color === 'white' ? 'text-white' : 'text-gray-600'
        }`}>
          {text}
        </p>
      )}

      {/* Screen reader only text */}
      <span className="sr-only">
        {text}
      </span>
    </div>
  );
};

// Standalone spinner variant (for inline loading)
export const Spinner = ({ size = "md", color = "primary" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-3",
    lg: "w-8 h-8 border-3"
  };

  const colors = {
    primary: "border-t-primary-500 border-transparent",
    white: "border-t-white border-transparent",
    gray: "border-t-gray-500 border-transparent"
  };

  const selectedSize = sizes[size] || sizes.md;
  const selectedColor = colors[color] || colors.primary;

  return (
    <div className="relative inline-flex items-center justify-center" role="status">
      <div className={`${selectedSize} border-gray-200 rounded-full`} aria-hidden="true" />
      <div 
        className={`${selectedSize} rounded-full animate-spin absolute ${selectedColor}`}
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;