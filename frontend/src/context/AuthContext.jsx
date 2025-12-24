import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api, { fetchQuota } from '../service/api'; // Import the api service

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('removeit_token');
    }
    return null;
  });

  // ✅ FIXED: Remove local axios instance - use the imported api service
  // Configure axios defaults when token changes
  useEffect(() => {
    if (token) {
      // Set token in localStorage and api defaults
      localStorage.setItem('removeit_token', token);
      
      // Fetch user data and quota
      getUserData();
    } else {
      localStorage.removeItem('removeit_token');
      setLoading(false);
    }
  }, [token]);

  // Load user from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('removeit_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('removeit_user');
      }
    }
  }, []);

  const getUserData = async () => {
    try {
      console.log('🔍 Fetching user data from /auth/me');
      
      const response = await api.get('/auth/me');
      
      console.log('✅ User data response:', response.data);
      
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('removeit_user', JSON.stringify(userData));
        
        // Fetch quota after getting user data
        await fetchQuota();
      }
    } catch (error) {
      console.error('❌ Failed to get user data:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Only logout on 401 Unauthorized
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Logging in to /auth/login');
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('✅ Login response:', response.data);
      
      if (response.data.token) {
        const { token, user } = response.data;
        
        // Store token and user
        localStorage.setItem('removeit_token', token);
        localStorage.setItem('removeit_user', JSON.stringify(user));
        
        // Update state
        setToken(token);
        setUser(user);
        
        // Fetch quota after login
        await fetchQuota();
        
        toast.success('Login successful!');
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      console.error('❌ Login error:', {
        message: errorMessage,
        status: error.response?.status
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      console.log('📝 Registering to /auth/register');
      
      const response = await api.post('/auth/register', { name, email, password });
      
      console.log('✅ Register response:', response.data);
      
      if (response.data.token) {
        const { token, user } = response.data;
        
        // Store token and user
        localStorage.setItem('removeit_token', token);
        localStorage.setItem('removeit_user', JSON.stringify(user));
        
        // Update state
        setToken(token);
        setUser(user);
        
        // Fetch quota after registration
        await fetchQuota();
        
        toast.success('Registration successful!');
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      console.error('❌ Register error:', {
        message: errorMessage,
        status: error.response?.status
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Attempting logout from /auth/logout');
      
      // Call logout API if token exists
      if (token) {
        await api.get('/auth/logout');
      }
    } catch (error) {
      console.log('⚠️ Logout API error (non-critical):', {
        status: error.response?.status
      });
    } finally {
      // Clear all stored data
      localStorage.removeItem('removeit_token');
      localStorage.removeItem('removeit_user');
      localStorage.removeItem('quota');
      
      // Clear state
      setToken(null);
      setUser(null);
      
      toast.info('Logged out successfully');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};