// Token management
export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  export const setToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  export const removeToken = () => {
    localStorage.removeItem('token');
  };
  
  // User data management
  export const getStoredUser = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  };
  
  export const setStoredUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  export const removeStoredUser = () => {
    localStorage.removeItem('user');
  };
  
  // Clear all auth data
  export const clearAuthData = () => {
    removeToken();
    removeStoredUser();
  };
  
  // Check if token exists and is not expired
  export const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };
  
  // Validation helpers
  export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const validatePassword = (password) => {
    return password && password.length >= 6;
  };
  
  export const validateUsername = (username) => {
    return username && username.length >= 3;
  };