import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

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

  // ✅ FIXED: Create axios instance with correct baseURL
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Configure axios defaults when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      getUserData();
    } else {
      delete api.defaults.headers.common['Authorization'];
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
      console.log('📡 Using baseURL:', api.defaults.baseURL);
      
      const response = await api.get('/auth/me');
      
      console.log('✅ User data response:', response.data);
      
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('removeit_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('❌ Failed to get user data:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL
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
      console.log('📡 Using baseURL:', api.defaults.baseURL);
      
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
        
        // Set axios default header for this instance
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success('Login successful!');
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      console.error('❌ Login error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        fullUrl: error.config?.baseURL + error.config?.url,
        baseURL: error.config?.baseURL
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
      console.log('📡 Using baseURL:', api.defaults.baseURL);
      
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
        
        // Set axios default header for this instance
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success('Registration successful!');
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      console.error('❌ Register error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      console.log('🔄 Updating profile at /auth/updatedetails');
      console.log('📡 Using baseURL:', api.defaults.baseURL);
      
      const response = await api.put('/auth/updatedetails', profileData);
      
      console.log('✅ Update profile response:', response.data);
      
      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.user };
        
        // Update state and localStorage
        setUser(updatedUser);
        localStorage.setItem('removeit_user', JSON.stringify(updatedUser));
        
        toast.success('Profile updated successfully!');
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Update failed';
      console.error('❌ Update profile error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL
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
      console.log('📡 Using baseURL:', api.defaults.baseURL);
      
      // Call logout API if token exists
      if (token) {
        await api.get('/auth/logout');
      }
    } catch (error) {
      console.log('⚠️ Logout API error (non-critical):', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
    } finally {
      // Clear all stored data
      localStorage.removeItem('removeit_token');
      localStorage.removeItem('removeit_user');
      
      // Clear state
      setToken(null);
      setUser(null);
      
      // Clear axios default header
      delete api.defaults.headers.common['Authorization'];
      
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
    updateProfile,
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