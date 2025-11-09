// hooks/useImageProcessor.js
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import BackgroundRemovalService from '../utils/backgroundRemovalService';

export const useImageProcessor = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);

  // Process image and convert to base64 for persistence
  const processImage = useCallback(async (file) => {
    setIsProcessing(true);
    setOriginalFile(file);
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setOriginalImage(imageUrl);
        setProcessedImage(imageUrl);
        setIsProcessing(false);
        resolve();
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Remove background - this needs the originalFile
  const removeBackground = useCallback(async (method = 'api', options = {}) => {
    if (!originalFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Removing background...');

    try {
      let result;
      
      if (method === 'api') {
        result = await BackgroundRemovalService.removeBackgroundWithAPI(originalFile);
        toast.update(loadingToast, {
          render: 'Background removed using AI!',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } else {
        result = await BackgroundRemovalService.removeBackgroundManual(originalFile, options);
        toast.update(loadingToast, {
          render: 'Background removed using manual method!',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      }

      setProcessedImage(result);
    } catch (error) {
      console.error('Background removal error:', error);
      toast.update(loadingToast, {
        render: 'Failed to remove background. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [originalFile]);

  const updateProcessedImage = useCallback((newImage) => {
    setProcessedImage(newImage);
  }, []);

  const clearImages = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setOriginalFile(null);
  }, []);

  const restoreOriginal = useCallback(() => {
    setProcessedImage(originalImage);
    toast.info('Restored original image');
  }, [originalImage]);

  // IMPORTANT: Add these functions to handle file restoration after refresh
  const restoreFromSavedState = useCallback((savedState) => {
    if (savedState.originalImage) {
      setOriginalImage(savedState.originalImage);
    }
    if (savedState.processedImage) {
      setProcessedImage(savedState.processedImage);
    }
    // Note: originalFile cannot be restored from base64, but that's okay
    // because removeBackground will show an error if user tries to use it
    // without re-uploading the actual file
  }, []);

  // Check if we have a valid originalFile for background removal
  const canRemoveBackground = useCallback(() => {
    return originalFile !== null;
  }, [originalFile]);

  return {
    originalImage,
    processedImage,
    isProcessing,
    originalFile,
    processImage,
    removeBackground,
    updateProcessedImage,
    clearImages,
    restoreOriginal,
    restoreFromSavedState, // Add this new function
    canRemoveBackground    // Add this helper function
  };
};