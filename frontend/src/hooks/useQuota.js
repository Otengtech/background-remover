import { useState, useEffect } from 'react';
import { fetchQuota } from '../service/api';

export const useQuota = () => {
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateQuota = async () => {
    try {
      const data = await fetchQuota();
      setQuota(data);
    } catch (error) {
      console.error('Failed to update quota:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateQuota();
    
    // Listen for quota updates
    const handleQuotaUpdate = (event) => {
      setQuota(event.detail);
    };
    
    window.addEventListener('quotaUpdated', handleQuotaUpdate);
    window.addEventListener('authStateChanged', updateQuota);
    
    return () => {
      window.removeEventListener('quotaUpdated', handleQuotaUpdate);
      window.removeEventListener('authStateChanged', updateQuota);
    };
  }, []);

  return { quota, loading, refreshQuota: updateQuota };
};