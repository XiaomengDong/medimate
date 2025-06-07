import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { setToken } from '../utils/auth';

function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.register(username.trim(), email.trim(), password);

      // Store the token
      setToken(data.token);

      // Call the parent component's onLogin function
      onLogin(data.user, data.token);

      // Clear form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
      <div className="login-container">
        <div className="login">
          <h1>MEDI<span>MATE+</span></h1>
        </div>
        <p>Your AI-Powered Healthcare Companion</p>
        <div className="login-card">
          <h2>{isSignUp ? 'Sign Up for MediMate' : 'Login to MediMate'}</h2>
          <form className="login-form" onSubmit={isSignUp ? handleSignUp : handleLogin}>
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

            {isSignUp && (
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                />
            )}

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
            />

            {isSignUp && (
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                />
            )}

            <button type="submit" disabled={loading}>
              {loading
                  ? (isSignUp ? 'Creating Account...' : 'Logging in...')
                  : (isSignUp ? 'Sign Up' : 'Login')
              }
            </button>
          </form>

          <div className="toggle-mode" style={{
            textAlign: 'center',
            marginTop: '15px',
            padding: '10px'
          }}>
          <span style={{ color: '#666' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
            <button
                type="button"
                onClick={toggleMode}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginLeft: '5px',
                  fontSize: 'inherit'
                }}
            >
              {isSignUp ? 'Login here' : 'Sign up here'}
            </button>
          </div>
        </div>
      </div>
  );
}

export default Login;