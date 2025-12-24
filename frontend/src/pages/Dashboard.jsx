import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { processImage, processImageFromUrl, getCachedQuota, fetchQuota } from '../service/api';
import { toast } from 'react-toastify';
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
  FiCamera,
  FiUsers,
  FiRefreshCw
} from 'react-icons/fi';

const ImageUpload = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file');
  const [imageUrl, setImageUrl] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');
  const [quota, setQuota] = useState(() => getCachedQuota());
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef();
  const dropZoneRef = useRef();

  // Fetch user quota on mount and listen for updates
  useEffect(() => {
    const loadQuota = async () => {
      const data = await fetchQuota();
      if (data) setQuota(data);
    };
    
    loadQuota();
    
    // Listen for quota updates from other components
    const handleQuotaUpdate = (event) => {
      setQuota(event.detail);
    };
    
    window.addEventListener('quotaUpdated', handleQuotaUpdate);
    
    return () => {
      window.removeEventListener('quotaUpdated', handleQuotaUpdate);
    };
  }, []);

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please upload an image.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 20MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDownloadUrl('');
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add('border-blue-500', 'bg-blue-500/10');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-500/10');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-500/10');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  };

  // Process image
  const processImageHandler = async () => {
    // Check quota before processing
    if (quota && quota.imagesRemaining <= 0) {
      toast.error(
        <div className="text-center">
          <p className="font-bold">{quota.plan.toUpperCase()} Plan Limit Reached</p>
          <p className="text-sm mt-1">Used: {quota.monthlyImagesUsed}/{quota.monthlyLimit}</p>
          <p className="text-xs mt-2">Resets: {new Date(quota.monthlyResetDate).toLocaleDateString()}</p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium"
          >
            Upgrade Plan
          </button>
        </div>
      );
      return;
    }

    if (uploadMethod === 'file' && !selectedFile) {
      toast.error('Please select an image');
      return;
    }

    if (uploadMethod === 'url' && !imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    setProcessing(true);
    setUploadProgress(0);

    try {
      let response;

      if (uploadMethod === 'file') {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        response = await processImage(formData, (progress) => {
          setUploadProgress(progress);
        });
      } else {
        response = await processImageFromUrl(imageUrl.trim());
      }

      // Extract metadata from headers
      const processingTime = response.headers['x-processing-time'];
      const resolution = response.headers['x-resolution'];
      const plan = response.headers['x-plan'];
      const remaining = response.headers['x-images-remaining'];
      const fileSize = response.headers['x-file-size'];

      // Create download URL
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      // Set filename
      const filename = selectedFile 
        ? `bg-removed_${selectedFile.name.replace(/\.[^/.]+$/, '')}_${Date.now()}.png`
        : `bg-removed_${Date.now()}.png`;
      setDownloadFilename(filename);

      // Update quota locally
      if (quota && remaining !== undefined) {
        const updatedQuota = {
          ...quota,
          monthlyImagesUsed: quota.monthlyImagesUsed + 1,
          imagesRemaining: parseInt(remaining),
          totalImagesProcessed: (quota.totalImagesProcessed || 0) + 1
        };
        setQuota(updatedQuota);
        localStorage.setItem('quota', JSON.stringify(updatedQuota));
      }

      // Success toast with metadata
      toast.success(
        <div>
          <p className="font-bold">✅ Background Removed!</p>
          <div className="text-xs mt-1 space-y-1">
            <p>Plan: <span className="text-blue-400">{plan?.toUpperCase()}</span></p>
            <p>Resolution: <span className="text-green-400">{resolution}</span></p>
            <p>Processing Time: <span className="text-yellow-400">{processingTime}ms</span></p>
            {fileSize && <p>File Size: <span className="text-purple-400">{fileSize}</span></p>}
          </div>
        </div>,
        { autoClose: 5000 }
      );

    } catch (error) {
      // Error is already handled by the API interceptor
      console.error('Processing error:', error);
    } finally {
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  // Refresh quota
  const refreshQuota = async () => {
    try {
      const data = await fetchQuota();
      if (data) setQuota(data);
    } catch (error) {
      console.error('Failed to refresh quota:', error);
    }
  };

  // Reset everything
  const resetAll = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setImageUrl('');
    setDownloadUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Quota */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                Remove Background{' '}
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Instantly
                </span>
              </h1>
              <p className="text-gray-400 mt-2">AI-powered • No skills needed • Works like remove.bg</p>
            </div>
            
            {/* Quota Display */}
            {quota && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 min-w-[250px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiAward className="text-blue-400" />
                    <span className="text-sm text-gray-300">Plan:</span>
                    <span className="font-bold text-blue-400">{quota.plan.toUpperCase()}</span>
                  </div>
                  <button 
                    onClick={refreshQuota}
                    className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    title="Refresh quota"
                  >
                    <FiRefreshCw className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Monthly Usage</span>
                    <span>{quota.monthlyImagesUsed} / {quota.monthlyLimit}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        quota.monthlyImagesUsed >= quota.monthlyLimit ? 'bg-red-500' :
                        quota.monthlyImagesUsed > quota.monthlyLimit * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (quota.monthlyImagesUsed / quota.monthlyLimit) * 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 text-center">
                  Resets: {new Date(quota.monthlyResetDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Upload Interface */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              
              {/* Upload Method Tabs */}
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                    uploadMethod === 'file'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FiUpload /> Upload File
                  </div>
                </button>
                <button
                  onClick={() => setUploadMethod('url')}
                  className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                    uploadMethod === 'url'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-white'
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
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center transition-all hover:border-blue-500 cursor-pointer mb-6"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="rounded-lg max-h-64 mx-auto shadow-lg"
                      />
                      <div className="absolute bottom-2 left-2 right-2 bg-black/60 rounded p-2">
                        <p className="text-sm truncate">{selectedFile?.name}</p>
                        <p className="text-xs text-gray-300">
                          {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                        <FiUpload className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-gray-300 mb-2">Drag & drop or click to upload</p>
                      <p className="text-gray-500 text-sm">JPG, PNG, WebP • Max 20MB</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => imageUrl && setPreviewUrl(imageUrl)}
                      className="px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 whitespace-nowrap"
                      disabled={!imageUrl.trim()}
                    >
                      Preview
                    </button>
                  </div>
                  
                  {previewUrl && (
                    <div className="border border-gray-700 rounded-lg p-3">
                      <img
                        src={previewUrl}
                        alt="URL Preview"
                        className="rounded-lg max-h-48 mx-auto"
                        onError={() => {
                          setPreviewUrl('');
                          toast.error('Failed to load image from URL');
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              {processing && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={processImageHandler}
                  disabled={processing || (!selectedFile && !imageUrl) || (quota && quota.imagesRemaining <= 0)}
                  className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all ${
                    processing || (!selectedFile && !imageUrl) || (quota && quota.imagesRemaining <= 0)
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <FiZap className="w-5 h-5" />
                      Remove Background
                    </>
                  )}
                </button>

                {(selectedFile || imageUrl) && !processing && (
                  <button
                    onClick={resetAll}
                    className="w-full py-3 bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <FiX /> Clear All
                  </button>
                )}

                {/* Results */}
                {downloadUrl && (
                  <div className="border border-gray-700 rounded-xl p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <FiCheck className="text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Background Removed!</h3>
                        <p className="text-gray-400 text-sm">Download your image with transparent background</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <a
                        href={downloadUrl}
                        download={downloadFilename}
                        className="block w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 text-white font-medium text-center"
                      >
                        <FiDownload className="inline mr-2" />
                        Download PNG
                      </a>
                      
                      <button
                        onClick={resetAll}
                        className="w-full py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
                      >
                        Process Another Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Info & Tips */}
          <div className="space-y-6">
            
            {/* How it Works */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiInfo className="text-blue-400" />
                How It Works
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 text-sm">1</span>
                  </div>
                  <p className="text-gray-300 text-sm">Upload image or paste URL</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 text-sm">2</span>
                  </div>
                  <p className="text-gray-300 text-sm">AI removes background instantly</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 text-sm">3</span>
                  </div>
                  <p className="text-gray-300 text-sm">Download PNG with transparent background</p>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiUsers className="text-purple-400" />
                Plan Features
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${user?.plan === 'free' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-gray-900/50'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Free Plan</span>
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded">50 images/mo</span>
                  </div>
                  <p className="text-xs text-gray-400">720p resolution • Basic processing</p>
                </div>
                
                <div className={`p-3 rounded-lg ${user?.plan === 'basic' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-gray-900/50'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Basic Plan</span>
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded">500 images/mo</span>
                  </div>
                  <p className="text-xs text-gray-400">1080p HD • Faster processing</p>
                </div>
                
                <div className={`p-3 rounded-lg ${user?.plan === 'pro' ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-900/50'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Pro Plan</span>
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded">5000+ images/mo</span>
                  </div>
                  <p className="text-xs text-gray-400">4K Ultra HD • Priority processing</p>
                </div>
              </div>
              
              {user?.plan !== 'pro' && (
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 text-sm font-medium"
                >
                  Upgrade Plan
                </button>
              )}
            </div>

            {/* Security */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <FiShield className="text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold">100% Secure</h3>
                  <p className="text-xs text-gray-400">Your privacy protected</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                Images are processed in real-time and immediately deleted. We never store your files on our servers.
              </p>
            </div>

          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {quota?.totalImagesProcessed || 0}
            </div>
            <div className="text-sm text-gray-400">Total Images Processed</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {quota?.plan === 'pro' ? '4K' : quota?.plan === 'basic' ? 'HD' : 'SD'}
            </div>
            <div className="text-sm text-gray-400">Current Resolution</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {quota?.imagesRemaining || 0}
            </div>
            <div className="text-sm text-gray-400">Images Remaining This Month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;