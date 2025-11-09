// components/ExportPanel/ExportPanel.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiDownload,
  FiX,
  FiCreditCard,
  FiLock,
  FiCheck,
  FiStar,
} from "react-icons/fi";
import axios from "axios";

const ExportPanel = ({ processedImage, onClose }) => {
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(50);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "https://removerio.vercel.app/";

  const PAYSTACK_PUBLIC_KEY =
    "pk_live_f7820d0d82ecf9255b6c9fc69205c9d7b1dc7ce3";
  const AMOUNT_IN_CEDIS = 0.2;
  const AMOUNT_IN_PESEWAS = Math.round(AMOUNT_IN_CEDIS * 100);

  const FREE_MAX_QUALITY = 50;
  const FREE_MAX_DIMENSION = 800;

  useEffect(() => {
    if (processedImage) {
      const img = new Image();
      img.onload = () =>
        setImageDimensions({ width: img.width, height: img.height });
      img.src = processedImage;
    }
  }, [processedImage]);

  const requiresPayment = () => quality > FREE_MAX_QUALITY;

  const handleDownload = async () => {
    if (!processedImage) return;

    if (requiresPayment()) {
      setShowPayment(true);
      return;
    }

    await processDownload();
  };

  const processDownload = async (isPremium = false) => {
    setIsDownloading(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = processedImage;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let outputWidth = img.width;
      let outputHeight = img.height;
      let downloadQuality = quality;

      if (!isPremium) {
        if (
          outputWidth > FREE_MAX_DIMENSION ||
          outputHeight > FREE_MAX_DIMENSION
        ) {
          const scale =
            FREE_MAX_DIMENSION / Math.max(outputWidth, outputHeight);
          outputWidth = Math.floor(outputWidth * scale);
          outputHeight = Math.floor(outputHeight * scale);
        }
        downloadQuality = Math.min(quality, FREE_MAX_QUALITY);
      }

      canvas.width = outputWidth;
      canvas.height = outputHeight;
      if (isPremium) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }

      ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

      let mimeType = "image/png";
      let fileExtension = "png";
      if (format === "jpeg") {
        mimeType = "image/jpeg";
        fileExtension = "jpg";
      } else if (format === "webp") {
        mimeType = "image/webp";
        fileExtension = "webp";
      }

      const finalQuality = isPremium
        ? downloadQuality / 100
        : FREE_MAX_QUALITY / 100;
      const dataURL = canvas.toDataURL(mimeType, finalQuality);
      triggerDownload(dataURL, fileExtension);

      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const triggerDownload = (dataURL, extension) => {
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `bg-removed-${timestamp}.${extension}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // In your ExportPanel.jsx - enhanced verifyPayment function
  const verifyPayment = async (reference) => {
    try {
      console.log("🔍 Verifying payment:", reference);

      const response = await axios.post(
        `${BACKEND_URL}/api/verify-payment`,
        {
          reference: reference,
        },
        {
          timeout: 15000, // 15 second timeout
        }
      );

      console.log("Verification response:", response.data);

      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        console.error("Payment verification failed:", response.data.error);
        return {
          success: false,
          error: response.data.error || "Payment failed",
        };
      }
    } catch (error) {
      console.error("Verification request failed:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });

      // User-friendly error messages
      if (error.response?.status === 401) {
        return { success: false, error: "Payment service configuration error" };
      }
      if (error.response?.status === 404) {
        return { success: false, error: "Transaction not found" };
      }
      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Verification timeout - please try again",
        };
      }
      if (error.response?.status >= 500) {
        return {
          success: false,
          error: "Payment service temporarily unavailable",
        };
      }

      return {
        success: false,
        error: "Network error - please check your connection",
      };
    }
  };

  // Handle payment callback
  const handlePaymentCallback = async (response) => {
    try {
      console.log("Payment callback received:", response);

      // Verify payment with backend
      const verification = await verifyPayment(response.reference);

      if (verification.success) {
        setPaymentSuccess(true);

        // Download premium image immediately
        await processDownload(true);

        // Close payment modal after successful download
        setTimeout(() => {
          setShowPayment(false);
          setPaymentSuccess(false);
        }, 2000);
      } else {
        alert(`Payment verification failed: ${verification.error}`);
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      alert("Payment processing failed. Please contact support.");
      setIsProcessingPayment(false);
    }
  };

  // Initialize Paystack payment
  const initializePayment = () => {
    if (!userEmail || !userEmail.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsProcessingPayment(true);

    const reference = `BGPRO_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Load Paystack script if not already loaded
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => {
        initializePaystackPayment(reference);
      };
      script.onerror = () => {
        alert("Failed to load payment system. Please refresh and try again.");
        setIsProcessingPayment(false);
      };
      document.body.appendChild(script);
    } else {
      initializePaystackPayment(reference);
    }
  };

  const initializePaystackPayment = (reference) => {
    window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: AMOUNT_IN_PESEWAS,
      currency: "GHS",
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: "Product",
            variable_name: "product",
            value: "High Quality Background Removal",
          },
          {
            display_name: "Quality",
            variable_name: "quality",
            value: `${quality}%`,
          },
          {
            display_name: "Format",
            variable_name: "format",
            value: format.toUpperCase(),
          },
        ],
      },
      callback: function (response) {
        handlePaymentCallback(response);
      },
      onClose: function () {
        if (!paymentSuccess) {
          setIsProcessingPayment(false);
          console.log("Payment window closed.");
        }
      },
    }).openIframe();
  };

  if (!processedImage) return null;

  // Payment Success Modal
  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black border-2 border-green-500 rounded-2xl p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-500 mb-2">
            Payment Successful!
          </h2>
          <p className="text-white mb-6">
            Your premium download is starting...
          </p>
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  // Payment Modal
  if (showPayment) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black border-2 border-yellow-400 rounded-2xl p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <FiStar className="text-yellow-300" /> Premium Download
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPayment(false)}
              className="p-2 text-yellow-400 hover:bg-black rounded-full border border-yellow-400"
              disabled={isProcessingPayment}
            >
              <FiX size={20} />
            </motion.button>
          </div>

          {/* Order summary */}
          <div className="space-y-4 mb-6">
            <div className="bg-black p-4 border border-yellow-400 rounded-lg">
              <div className="flex justify-between text-white font-semibold">
                <span>High Quality Download</span>
                <span>GHS {AMOUNT_IN_PESEWAS / 100}</span>
              </div>
              <div className="flex justify-between text-yellow-400 font-semibold mt-2">
                <span>Quality</span>
                <span>{quality}%</span>
              </div>
              <div className="flex justify-between text-yellow-400 font-semibold mt-2">
                <span>Format</span>
                <span>{format.toUpperCase()}</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-yellow-400 font-semibold mb-2 text-sm">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-4 bg-black border-2 border-yellow-400/60 text-white placeholder-gray-200 focus:outline-none focus:border-yellow-300 text-sm"
                disabled={isProcessingPayment}
              />
            </div>

            {/* Pay button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={initializePayment}
              disabled={isProcessingPayment || !userEmail}
              className="w-full p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FiCreditCard size={20} />
              <span>
                {isProcessingPayment
                  ? "Processing..."
                  : `Pay GHS ${AMOUNT_IN_PESEWAS / 100}`}
              </span>
              {isProcessingPayment && (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              )}
            </motion.button>

            {/* Security notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <FiLock size={12} />
              <span>Secure payment powered by Paystack</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Export Panel (same as before)
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-black border-2 border-yellow-400 rounded-2xl p-6 w-full max-w-2xl"
      >
        {/* Header & preview */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-yellow-400">Export Image</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-yellow-400 hover:bg-black rounded-full border border-yellow-400"
          >
            <FiX size={20} />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6">
          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-md">Preview</h3>
            <div className="overflow-hidden border-2 border-yellow-400/80 bg-black">
              <img
                src={processedImage}
                alt="Processed preview"
                className="w-full h-48 object-contain p-2"
              />
            </div>
            <div className="text-center text-gray-300 text-sm">
              {imageDimensions.width} × {imageDimensions.height}px
              {quality <= FREE_MAX_QUALITY && (
                <div className="text-yellow-400 mt-1">
                  Free version: Max {FREE_MAX_DIMENSION}px
                </div>
              )}
            </div>
          </div>

          {/* Export settings */}
          <div className="space-y-6">
            {/* Format selection */}
            <div>
              <label className="block text-yellow-400 font-semibold mb-3 text-sm">
                Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["png", "jpeg", "webp"].map((fmt) => (
                  <motion.button
                    key={fmt}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormat(fmt)}
                    className={`p-3 rounded-full text-sm font-semibold ${
                      format === fmt
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : " text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quality slider */}
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-yellow-400 font-semibold text-sm">
                  Quality
                </label>
                <span
                  className={`text-sm font-semibold ${
                    requiresPayment() ? "text-yellow-400" : "text-white"
                  }`}
                >
                  {quality}%
                  {requiresPayment() && (
                    <FiStar className="inline ml-1" size={12} />
                  )}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={quality}
                onChange={(e) => setQuality(+e.target.value)}
                className="w-full h-2 bg-white rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-yellow-400"
              />
              <div className="flex justify-between text-xs text-gray-300 mt-2">
                <span>Free ({FREE_MAX_QUALITY}%)</span>
                <span>Pro (100%)</span>
              </div>
            </div>

            {/* Download button */}
            <motion.button
              onClick={handleDownload}
              disabled={isDownloading}
              whileHover={{ scale: requiresPayment() ? 1.02 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-4 font-bold rounded-full flex items-center justify-center gap-3 disabled:opacity-50 text-sm ${
                requiresPayment()
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Downloading...
                </>
              ) : requiresPayment() ? (
                <>
                  <FiCreditCard size={18} />
                  Upgrade to Download - GHS {AMOUNT_IN_PESEWAS / 100}
                </>
              ) : (
                <>
                  <FiDownload size={18} />
                  Download Free Version
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExportPanel;
