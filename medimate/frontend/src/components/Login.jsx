import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { setToken } from '../utils/auth';

function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);              // ← New state
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
      setToken(data.token);
      onLogin(data.user, data.token);
      setUsername('');
      setPassword('');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // 1) Check required fields
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // 2) Password match + strength
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // 3) Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // 4) Terms & Conditions agreement
    if (!agreed) {
      setError('You must agree to the Terms & Conditions');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.register(
          username.trim(),
          email.trim(),
          password
      );
      setToken(data.token);
      onLogin(data.user, data.token);
      // Clear form & agreement
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreed(false);
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    // Reset everything
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreed(false);
  };

  return (
      <div className="login-container">
        <div className="login">
          <h1>MEDI<span>MATE+</span></h1>
        </div>
        <p>Your AI-Powered Healthcare Companion</p>
        <div className="login-card">
          <h2>{isSignUp ? 'Sign Up for MediMate' : 'Login to MediMate'}</h2>
          <form
              className="login-form"
              onSubmit={isSignUp ? handleSignUp : handleLogin}
          >
            {error && (
                <div
                    className="error-message"
                    style={{
                      color: 'red',
                      marginBottom: '10px',
                      padding: '8px',
                      backgroundColor: '#ffe6e6',
                      border: '1px solid #ff9999',
                      borderRadius: '4px',
                    }}
                >
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

            {isSignUp && (
                <div style={{ margin: '12px 0', fontSize: '0.5em' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginLeft: '-100px', marginTop: '-10px'}}>
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        disabled={loading}
                        style={{ marginRight: '-100px', marginTop: '10px' }}
                    />
                    I agree to the MediMate Terms and Conditions, and I consent to sharing my data with MediMate AI.
                  </label>
                </div>
            )}

            <button
                type="submit"
                disabled={
                    loading || (isSignUp && !agreed)
                }
            >
              {loading
                  ? isSignUp
                      ? 'Creating Account...'
                      : 'Logging in...'
                  : isSignUp
                      ? 'Sign Up'
                      : 'Login'}
            </button>
          </form>

          <div
              className="toggle-mode"
              style={{
                textAlign: 'center',
                marginTop: '15px',
                padding: '10px',
              }}
          >
          <span style={{ color: '#666' }}>
            {isSignUp
                ? 'Already have an account?'
                : "Don't have an account?"}
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
                  fontSize: 'inherit',
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