import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../service/api';
import {
  FiUpload,
  FiImage,
  FiDownload,
  FiZap,
  FiCheck,
  FiX,
  FiLink,
  FiInfo,
  FiAward,
  FiShield,
  FiLock,
  FiStar,
  FiCamera
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const ImageUpload = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file');
  const [imageUrl, setImageUrl] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');
  
  const fileInputRef = useRef();
  const dropZoneRef = useRef();

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, or WebP images.');
      return;
    }

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 20MB.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setDownloadUrl('');
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-blue-500', 'bg-blue-500/10');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-500/10');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-500/10');
    }

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const event = {
        target: { files: [file] }
      };
      handleFileSelect(event);
    }
  };

  // Process image
  const processImage = async () => {
    if (uploadMethod === 'file' && !selectedFile) {
      toast.error('Please select an image file');
      return;
    }

    if (uploadMethod === 'url' && !imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    setProcessing(true);
    setDownloadUrl('');

    try {
      let response;

      if (uploadMethod === 'file') {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        response = await api.post('/images/process', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          responseType: 'blob'
        });
      } else {
        response = await api.post('/images/process-url', 
          { imageUrl: imageUrl.trim() },
          { responseType: 'blob' }
        );
      }

      // Create download URL
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      // Generate filename
      const filename = selectedFile 
        ? `removeit_${selectedFile.name.replace(/\.[^/.]+$/, '')}_processed.png`
        : `removeit_processed_${Date.now()}.png`;
      setDownloadFilename(filename);

      toast.success('✅ Background removed successfully!');

    } catch (error) {
      console.error('Processing error:', error);
      
      if (error.response?.status === 413) {
        toast.error('File too large. Maximum size is 20MB.');
      } else if (error.response?.status === 403) {
        toast.error('Monthly limit reached. Please upgrade your plan.');
      } else if (error.response?.status === 400) {
        toast.error('Invalid image file. Please try another image.');
      } else {
        toast.error('Failed to process image. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  // Reset everything
  const resetAll = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setImageUrl('');
    setDownloadUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Remove Background in{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Seconds
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            AI-powered background removal. No skills needed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Help & Info */}
          <div className="space-y-8">
            {/* Quick Start Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiInfo className="mr-2 text-blue-400" />
                How to Use
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Upload Your Image</h3>
                    <p className="text-gray-300 text-sm">
                      Drag & drop or click to upload any JPG, PNG, or WebP image (max 20MB).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">AI Removes Background</h3>
                    <p className="text-gray-300 text-sm">
                      Our AI automatically detects and removes the background in seconds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Download Result</h3>
                    <p className="text-gray-300 text-sm">
                      Download your image with transparent background as PNG.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiStar className="mr-2 text-yellow-400" />
                Best Results Tips
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck className="text-green-400 text-xs" />
                  </div>
                  <p className="text-gray-300 text-sm">
                    Use images with clear contrast between subject and background
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck className="text-green-400 text-xs" />
                  </div>
                  <p className="text-gray-300 text-sm">
                    Plain backgrounds work best with our algorithm
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck className="text-green-400 text-xs" />
                  </div>
                  <p className="text-gray-300 text-sm">
                    Well-lit photos produce cleaner edges
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck className="text-green-400 text-xs" />
                  </div>
                  <p className="text-gray-300 text-sm">
                    For complex images, upgrade to Pro for AI-powered removal
                  </p>
                </div>
              </div>
            </div>
            
            {/* Security Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <FiShield className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">100% Secure</h3>
                  <p className="text-gray-400 text-sm">Your privacy is our priority</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FiLock className="flex-shrink-0" />
                <p>Images are processed in real-time and immediately deleted. We never store your files.</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Background Removal Interface */}
          <div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              {/* Upload Method Tabs */}
              <div className="flex mb-6 border-b border-gray-800">
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    uploadMethod === 'file'
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FiUpload /> Upload File
                  </div>
                </button>
                <button
                  onClick={() => setUploadMethod('url')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    uploadMethod === 'url'
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FiLink /> From URL
                  </div>
                </button>
              </div>

              {/* Upload Area */}
              {uploadMethod === 'file' ? (
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center transition-all duration-300 hover:border-blue-500 cursor-pointer mb-6"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto max-w-md">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="rounded-lg max-h-80 mx-auto shadow-lg"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                          <div className="text-white text-sm">
                            <p className="font-medium truncate">{selectedFile?.name}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                        <FiUpload className="w-10 h-10 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Drop image here</h3>
                      <p className="text-gray-400 mb-4">or click to browse</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">JPG, PNG, WebP</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">≤ 20MB</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Paste image URL (https://example.com/image.jpg)"
                        className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (imageUrl) {
                          setPreviewUrl(imageUrl);
                          setSelectedFile(null);
                        }
                      }}
                      className="px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 whitespace-nowrap"
                    >
                      Preview
                    </button>
                  </div>

                  {previewUrl && (
                    <div className="border border-gray-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FiImage className="text-blue-500" />
                        <span className="text-white font-medium">URL Preview</span>
                      </div>
                      <img
                        src={previewUrl}
                        alt="URL Preview"
                        className="rounded-lg max-h-64 mx-auto"
                        onError={() => {
                          setPreviewUrl('');
                          toast.error('Failed to load image from URL');
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={processImage}
                disabled={processing || (!selectedFile && !imageUrl)}
                className={`w-full py-4 text-lg font-medium rounded-lg flex items-center justify-center gap-2 mb-4 ${
                  processing || (!selectedFile && !imageUrl)
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiZap /> Remove Background
                  </>
                )}
              </button>

              {/* Clear Button */}
              {(selectedFile || imageUrl) && !processing && (
                <button
                  onClick={resetAll}
                  className="w-full py-3 bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  <FiX /> Clear All
                </button>
              )}

              {/* Results Section */}
              {downloadUrl && (
                <div className="mt-6 border border-gray-700 rounded-xl p-6 bg-gray-900/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <FiCheck className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Background Removed!</h3>
                      <p className="text-gray-400 text-sm">Your image is ready to download</p>
                    </div>
                  </div>
                  
                  <a
                    href={downloadUrl}
                    download={downloadFilename}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <FiDownload /> Download Image (PNG)
                  </a>
                  
                  <button
                    onClick={resetAll}
                    className="w-full mt-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 text-gray-300"
                  >
                    Process Another Image
                  </button>
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