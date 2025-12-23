import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../service/api';
import {
  FiUpload,
  FiImage,
  FiDownload,
  FiZap,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiLink,
  FiBarChart2,
  FiClock,
  FiRefreshCw,
  FiInfo,
  FiAward,
  FiShield,
  FiLock
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const ImageUpload = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');
  const [stats, setStats] = useState(null);
  const [fileSize, setFileSize] = useState('');
  const [originalDimensions, setOriginalDimensions] = useState('');
  
  const fileInputRef = useRef();
  const dropZoneRef = useRef();
  const previewImgRef = useRef();

  // Fetch user stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch user stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/images/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

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
    setFileSize(formatFileSize(file.size));
    setDownloadUrl('');
    
    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions(`${img.width} × ${img.height}`);
    };
    img.src = url;
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-primary-500', 'bg-primary-500/10');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-primary-500', 'bg-primary-500/10');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-primary-500', 'bg-primary-500/10');
    }

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      // Simulate file input change
      const event = {
        target: { files: [file] }
      };
      handleFileSelect(event);
    }
  };

  // Process image - FIXED VERSION
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
    setProcessingTime(null);
    setDownloadUrl('');

    try {
      let response;

      if (uploadMethod === 'file') {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        console.log('Processing file:', selectedFile.name, selectedFile.size, 'bytes');

        response = await api.post('/images/process', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          responseType: 'blob'
        });
      } else {
        console.log('Processing URL:', imageUrl);
        response = await api.post('/images/process-url', 
          { imageUrl: imageUrl.trim() },
          { responseType: 'blob' }
        );
      }

      console.log('Response received:', {
        status: response.status,
        headers: response.headers,
        dataSize: response.data.size
      });

      // Get metadata from headers
      const processingTime = response.headers['x-processing-time'] || 'N/A';
      const resolution = response.headers['x-resolution'] || 'Unknown';
      const remaining = response.headers['x-images-remaining'] || 'N/A';

      setProcessingTime(processingTime);

      // Create download URL
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      // Generate filename
      const filename = selectedFile 
        ? `removeit_${selectedFile.name.replace(/\.[^/.]+$/, '')}_processed.png`
        : `removeit_processed_${Date.now()}.png`;
      setDownloadFilename(filename);

      // Refresh stats
      await fetchStats();

      toast.success(`✅ Image processed in ${processingTime}ms! (${resolution})`);

    } catch (error) {
      console.error('❌ Processing error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 413) {
        toast.error('File too large. Maximum size is 20MB.');
      } else if (error.response?.status === 403) {
        const errorMsg = error.response?.data?.error || 'Monthly limit reached';
        toast.error(errorMsg);
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || 'Invalid image file';
        toast.error(errorMsg);
      } else {
        toast.error(error.response?.data?.error || 'Failed to process image. Please try again.');
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
    setProcessingTime(null);
    setFileSize('');
    setOriginalDimensions('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get plan color
  const getPlanColor = () => {
    switch (user?.plan) {
      case 'pro': return 'from-purple-500 to-pink-600';
      case 'basic': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  // Get plan icon
  const getPlanIcon = () => {
    switch (user?.plan) {
      case 'pro': return '👑';
      case 'basic': return '⚡';
      default: return '🎯';
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Remove Background <span className="text-primary-400">Instantly</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Upload any image and get a transparent background in seconds. AI-powered for perfect results.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Preview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Image</h2>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getPlanColor()}`}>
                    {getPlanIcon()} {user?.plan?.toUpperCase() || 'FREE'}
                  </div>
                </div>
              </div>

              {/* Upload Method Tabs */}
              <div className="flex mb-6 border-b border-gray-800">
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    uploadMethod === 'file'
                      ? 'border-b-2 border-primary-500 text-primary-400'
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
                      ? 'border-b-2 border-primary-500 text-primary-400'
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
                  className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center transition-all duration-300 hover:border-primary-500 cursor-pointer mb-6"
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
                          ref={previewImgRef}
                          src={previewUrl}
                          alt="Preview"
                          className="rounded-lg max-h-80 mx-auto shadow-lg"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                          <div className="text-white text-sm">
                            <p className="font-medium truncate">{selectedFile?.name}</p>
                            <p className="text-gray-300">{fileSize} • {originalDimensions}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                        <FiUpload className="w-10 h-10 text-primary-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Drop your image here</h3>
                      <p className="text-gray-400 mb-4">or click to browse files</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">JPG</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">PNG</span>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">WebP</span>
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
                        className="input-field"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (imageUrl) {
                          setPreviewUrl(imageUrl);
                          setSelectedFile(null);
                        }
                      }}
                      className="btn-secondary whitespace-nowrap"
                    >
                      Preview
                    </button>
                  </div>

                  {previewUrl && (
                    <div className="border border-gray-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FiImage className="text-primary-500" />
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={processImage}
                  disabled={processing || (!selectedFile && !imageUrl)}
                  className={`btn-primary flex-1 flex items-center justify-center gap-2 py-4 text-lg ${
                    processing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiZap /> Remove Background Now
                    </>
                  )}
                </button>

                {(selectedFile || imageUrl) && (
                  <button
                    onClick={resetAll}
                    className="btn-secondary py-4 px-6"
                  >
                    <FiX /> Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Results Section */}
            {downloadUrl && (
              <div className="card animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">🎉 Results</h2>
                  <div className="flex items-center gap-2 text-green-400">
                    <FiCheck />
                    <span className="font-medium">Success!</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gray-900/50">
                      <div className="text-2xl font-bold text-white mb-1">
                        {processingTime || 'N/A'}ms
                      </div>
                      <div className="text-sm text-gray-400">Processing Time</div>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-gray-900/50">
                      <div className="text-2xl font-bold text-white mb-1">
                        {stats?.allowedResolution || 'SD'}
                      </div>
                      <div className="text-sm text-gray-400">Quality</div>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-gray-900/50">
                      <div className="text-2xl font-bold text-white mb-1">
                        PNG
                      </div>
                      <div className="text-sm text-gray-400">Format</div>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-gray-900/50">
                      <div className="text-2xl font-bold text-white mb-1">
                        {user?.plan === 'pro' ? 'AI' : 'Auto'}
                      </div>
                      <div className="text-sm text-gray-400">Method</div>
                    </div>
                  </div>

                  {/* Download Card */}
                  <div className="border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                        <FiDownload className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Download Ready</h3>
                        <p className="text-gray-400">Your background-free image is prepared</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <a
                        href={downloadUrl}
                        download={downloadFilename}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
                      >
                        <FiDownload /> Download Image
                      </a>
                      
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">
                          Right-click → "Save link as..." or click to download
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="border-t border-gray-800 pt-6">
                    <h3 className="text-lg font-bold text-white mb-4">What's Next?</h3>
                    <div className="space-y-3">
                      <button
                        onClick={resetAll}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-white">Process Another Image</span>
                        <FiUpload className="text-gray-400" />
                      </button>
                      
                      {stats?.imagesRemaining === 0 && (
                        <button
                          onClick={() => window.location.href = '/pricing'}
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary-500/20 to-purple-500/20 hover:from-primary-500/30 hover:to-purple-500/30 transition-all"
                        >
                          <span className="text-white">Upgrade for More Images</span>
                          <FiAward className="text-primary-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-8">
            {/* User Stats Card */}
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-6">Your Usage</h2>
              
              {stats ? (
                <div className="space-y-6">
                  {/* Plan Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Current Plan</span>
                      <span className={`font-medium ${
                        stats.plan === 'pro' ? 'text-purple-400' :
                        stats.plan === 'basic' ? 'text-blue-400' :
                        'text-gray-300'
                      }`}>
                        {stats.plan.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Resolution</span>
                      <span className="font-medium text-white">{stats.allowedResolution}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">AI Processing</span>
                      <span className={`font-medium ${stats.canUseRemoveBg ? 'text-green-400' : 'text-gray-400'}`}>
                        {stats.canUseRemoveBg ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Monthly Usage</span>
                      <span className="text-white">{stats.monthlyImagesUsed} / {stats.monthlyLimit === 'unlimited' ? '∞' : stats.monthlyLimit}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.plan === 'pro' ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                          stats.plan === 'basic' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                          'bg-gradient-to-r from-gray-600 to-gray-500'
                        }`}
                        style={{
                          width: stats.monthlyLimit === 'unlimited' 
                            ? '100%' 
                            : `${(stats.monthlyImagesUsed / stats.monthlyLimit) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-gray-900/50">
                      <div className="text-2xl font-bold text-white mb-1">{stats.imagesRemaining}</div>
                      <div className="text-xs text-gray-400">Images Left</div>
                    </div>
                    
                    <div className="text-center p-3 rounded-lg bg-gray-900/50">
                      <div className="text-2xl font-bold text-white mb-1">{stats.totalImagesProcessed}</div>
                      <div className="text-xs text-gray-400">Total Processed</div>
                    </div>
                  </div>

                  {/* Warning Message */}
                  {!stats.canProcess && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-red-400">
                        <FiAlertCircle />
                        <span className="text-sm">{stats.canProcess ? '' : 'Limit reached. Upgrade for more.'}</span>
                      </div>
                    </div>
                  )}

                  {/* Upgrade CTA */}
                  {stats.plan !== 'pro' && (
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-purple-700 transition-all"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiRefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading stats...</p>
                </div>
              )}
            </div>

            {/* Features Card */}
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-6">Features by Plan</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <FiZap className="text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Processing Speed</h3>
                    <p className="text-gray-400 text-sm">
                      {user?.plan === 'pro' ? 'Instant (<1s)' : 
                       user?.plan === 'basic' ? 'Fast (2-5s)' : 
                       'Standard (5-10s)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <FiBarChart2 className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Max Resolution</h3>
                    <p className="text-gray-400 text-sm">
                      {user?.plan === 'pro' ? '4K Ultra HD' : 
                       user?.plan === 'basic' ? 'Full HD (1080p)' : 
                       'HD (720p)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <FiImage className="text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Background Removal</h3>
                    <p className="text-gray-400 text-sm">
                      {user?.plan === 'pro' ? 'AI-Powered (Premium)' : 
                       'Algorithm-Based (Standard)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <FiShield className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Privacy</h3>
                    <p className="text-gray-400 text-sm">Images never stored • Secure processing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-6">💡 Pro Tips</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-400 text-xs">1</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Use images with high contrast between subject and background
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-400 text-xs">2</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Plain backgrounds yield the best results with our algorithm
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-400 text-xs">3</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Upgrade to Pro for AI-powered removal and 4K resolution
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-400 text-xs">4</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Processed images download instantly - nothing is stored
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex items-center gap-3 text-gray-400">
                  <FiLock className="flex-shrink-0" />
                  <p className="text-sm">Your images are processed securely and never stored on our servers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FiCheck className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-white">No Storage</h3>
            </div>
            <p className="text-gray-400">
              Images are processed in real-time and immediately deleted. Your privacy is guaranteed.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FiZap className="text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-white">High Speed</h3>
            </div>
            <p className="text-gray-400">
              Process images in seconds with our optimized algorithms and AI technology.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FiAward className="text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Plan Based</h3>
            </div>
            <p className="text-gray-400">
              Get higher resolution and faster processing by upgrading your plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;