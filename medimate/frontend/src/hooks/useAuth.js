import { useState, useEffect } from 'react';
import { getToken, getStoredUser, setStoredUser, clearAuthData, isTokenValid } from '../utils/auth';
import { makeAuthenticatedRequest } from '../services/api';

// Custom hook to manage authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in when hook initializes
    const token = getToken();
    const storedUser = getStoredUser();
    
    if (token && storedUser && isTokenValid()) {
      setUser(storedUser);
    } else if (token && !isTokenValid()) {
      // Token expired, clear data
      clearAuthData();
      setUser(null);
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setStoredUser(userData);
    setUser(userData);
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
  };

  const updateUser = (userData) => {
    setStoredUser(userData);
    setUser(userData);
  };

  return {
    user,
    loading,
    login,
    logout,
    updateUser,
    makeAuthenticatedRequest,
    isAuthenticated: !!user
  };
};

