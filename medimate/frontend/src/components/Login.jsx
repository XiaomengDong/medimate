import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { setToken } from '../utils/auth';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.login(username.trim(), password);
      
      // Store the token
      setToken(data.token);
      
      // Call the parent component's onLogin function
      onLogin(data.user, data.token);
      
      // Clear form
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login">
        <h1>MEDI<span>MATE+</span></h1>
      </div>
      <p>Your AI-Powered Healthcare Companion</p>
      <div className="login-card">
      <h2>Login to MediMate</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        {error && (
          <div className="error-message" style={{ 
            color: 'red', 
            marginBottom: '10px', 
            padding: '8px', 
            backgroundColor: '#ffe6e6', 
            border: '1px solid #ff9999', 
            borderRadius: '4px' 
          }}>
            {error}
          </div>
        )}
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      </div>
    </div>
  );
}

export default Login;