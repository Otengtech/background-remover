import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Create context
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

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      getUserData();
    } else {
      delete axios.defaults.headers.common['Authorization'];
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
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/profile`
      );
      
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('removeit_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to get user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password }
      );
      
      if (response.data.token) {
        const { token, user } = response.data;
        
        // Store token and user
        localStorage.setItem('removeit_token', token);
        localStorage.setItem('removeit_user', JSON.stringify(user));
        
        // Update state
        setToken(token);
        setUser(user);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success('Login successful!');
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        { name, email, password }
      );
      
      if (response.data.token) {
        const { token, user } = response.data;
        
        // Store token and user
        localStorage.setItem('removeit_token', token);
        localStorage.setItem('removeit_user', JSON.stringify(user));
        
        // Update state
        setToken(token);
        setUser(user);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success('Registration successful!');
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/profile`,
        profileData
      );
      
      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.user };
        
        // Update state and localStorage
        setUser(updatedUser);
        localStorage.setItem('removeit_user', JSON.stringify(updatedUser));
        
        toast.success('Profile updated successfully!');
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API if token exists
      if (token) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear all stored data
      localStorage.removeItem('removeit_token');
      localStorage.removeItem('removeit_user');
      
      // Clear state
      setToken(null);
      setUser(null);
      
      // Clear axios default header
      delete axios.defaults.headers.common['Authorization'];
      
      toast.info('Logged out successfully');
      // Optional: Redirect to login page
      // window.location.href = '/login';
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

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};