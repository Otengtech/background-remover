import React, { useState, useRef } from 'react';
import { FiUpload, FiDownload, FiImage, FiTrash2, FiCheck, FiLoader } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import MetaTags from '../components/MetaTags';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processedUrl, setProcessedUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [imageInfo, setImageInfo] = useState(null);
  const [processingStats, setProcessingStats] = useState(null);

  const fileInputRef = useRef();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP, etc.)');
      return;
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 25MB');
      return;
    }

    // Get image info
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        name: file.name,
        width: img.width,
        height: img.height,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type.split('/')[1].toUpperCase()
      });
    };
    img.src = URL.createObjectURL(file);

    // Reset previous results
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setProcessedUrl('');
    setProcessingStats(null);

    toast.info('Image selected and ready to remove background!');
  };

  // Remove background
  const handleRemoveBackground = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      toast.info('Removing background... Please wait.');

      const response = await axios.post(`${API_URL}/api/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const { url, metrics } = response.data;
        
        // Set processed image URL
        const fullUrl = `${API_URL}${url}`;
        setProcessedUrl(fullUrl);
        setProcessingStats(metrics);

        toast.success(
          <div>
            <div className="font-bold text-lg">✅ Background Removed!</div>
            <div className="text-sm mt-1">
              Image processed in {metrics.processingTime}
              <br />
              Size reduced by {metrics.reduction}
            </div>
          </div>,
          { autoClose: 5000 }
        );
      } else {
        throw new Error(response.data.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      
      let errorMessage = 'Failed to remove background';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Processing took too long. Try a smaller image.';
      }
      
      toast.error(
        <div>
          <div className="font-bold">❌ Error</div>
          <div className="text-sm mt-1">{errorMessage}</div>
        </div>
      );
    } finally {
      setProcessing(false);
    }
  };

 // Handle download - DIRECT TO DEVICE STORAGE
const handleDownload = async () => {
  if (!processedUrl) {
    toast.error('No processed image to download');
    return;
  }

  try {
    // Fetch the processed image as blob
    const response = await fetch(processedUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Create filename with timestamp
    const timestamp = new Date().getTime();
    const originalName = imageInfo?.name ? 
      imageInfo.name.replace(/\.[^/.]+$/, "") : 'image'; // Remove extension
    const filename = `background-removed_${originalName}_${timestamp}.png`;
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Append to body and trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success(`✅ Image saved as "${filename}"`);
    
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download image to storage');
  }
};

  // Reset everything
  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setPreviewUrl('');
    setProcessedUrl('');
    setImageInfo(null);
    setProcessingStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    toast.info('Ready for a new image!');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <MetaTags 
        title="Remove Backgrounds Instantly | Free AI Background Remover - Removerio"
        description="Remove image backgrounds instantly with AI. 100% FREE, no signup required."
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-6">
            <FiImage className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#7c3aed] mb-3">
            Remove Image Background
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Upload any image and get a transparent background in seconds. 100% free and accurate.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Original Image */}
          <div className="space-y-8">
            {/* Upload Card */}
            <div className="glass-effect rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-[#7c3aed] mb-6 flex items-center gap-2">
                <FiUpload className="" />
                Upload Image
              </h2>

              {/* Upload Area */}
              <div
                onClick={() => !processing && fileInputRef.current?.click()}
                className={`border-3 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  processing 
                    ? 'opacity-50 cursor-not-allowed glass-effect' 
                    : 'hover:border-blue-400'
                } ${previewUrl ? 'border-green-400' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={processing}
                />

                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="rounded-lg max-h-64 mx-auto shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-[#7c3aed] text-white text-xs font-bold px-3 py-1 rounded-full">
                      Original
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-white border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <FiUpload className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">
                      Click to upload image
                    </p>
                    <p className="text-gray-400 text-sm">
                      Supports JPG, PNG, WebP up to 25MB
                    </p>
                  </>
                )}
              </div>

              {/* Image Info */}
              {imageInfo && (
                <div className="mt-6 glass-effect border border-white/10 rounded-xl p-4">
                  <h3 className="font-medium text-[[#7c3aed]] mb-3">Image Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-200">Name</p>
                      <p className="font-medium truncate">{imageInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Size</p>
                      <p className="font-medium">{imageInfo.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Dimensions</p>
                      <p className="font-medium">{imageInfo.width} × {imageInfo.height}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Format</p>
                      <p className="font-medium">{imageInfo.type}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={handleRemoveBackground}
                disabled={processing || !selectedFile}
                className={`w-full py-4 rounded-full font-bold text-lg mt-6 flex items-center justify-center gap-3 transition-all ${
                  processing || !selectedFile
                    ? 'bg-gray-200/20 text-gray-400 cursor-not-allowed'
                    : 'bg-[#7c3aed] text-white'
                }`}
              >
                {processing ? (
                  <>
                    <FiLoader className="w-6 h-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiImage className="w-6 h-6" />
                    Remove Background
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-8">
            {/* Results Card */}
            <div className="glass-effect border border-white/10 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-[#7c3aed] mb-6 flex items-center gap-2">
                <FiCheck className="" />
                Results
              </h2>

              {processedUrl ? (
                <div className="space-y-6">
                  {/* Processed Image Preview */}
                  <div className="relative bg-transparent rounded-xl p-4">
                    <img
                      src={processedUrl}
                      alt="Background Removed"
                      className="rounded-lg max-h-64 mx-auto shadow-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="200" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="%23999">Preview not available</text></svg>';
                      }}
                    />
                    <div className="absolute -top-2 -right-2 glass-effect border border-white/10 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Processed
                    </div>
                  </div>

                  {/* Processing Stats */}
                  {processingStats && (
                    <div className="glass-effect rounded-xl p-5 border border-white/10">
                      <h3 className="font-bold text-gray-50 mb-3">Processing Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-30">Time</p>
                          <p className="text-lg font-bold text-gray-300">{processingStats.processingTime}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-300">Size Reduced</p>
                          <p className="text-lg font-bold text-green-300">{processingStats.reduction}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-50">Original Size</p>
                          <p className="text-lg font-bold text-gray-300">
                            {(processingStats.originalSize / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-200">New Size</p>
                          <p className="text-lg font-bold text-gray-200">
                            {(processingStats.processedSize / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleDownload}
                      className="py-4 bg-[#7c3aed] text-white font-bold rounded-full flex items-center justify-center gap-3 transition-all"
                    >
                      <FiDownload className="w-5 h-5" />
                      Download PNG
                    </button>
                    <button
                      onClick={handleReset}
                      className="py-4 glass-effect border border-white/10 rounded-full font-bold text-lg shadow hover:shadow-md transition-all flex items-center justify-center gap-3"
                    >
                      <FiTrash2 className="w-5 h-5" />
                      New Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                    <FiImage className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No Processed Image
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Upload an image and click "Remove Background" to see the results here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;