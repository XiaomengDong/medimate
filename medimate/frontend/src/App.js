import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import './styles/App.css';
import Home from './pages/Home';

function App() {
  const { user, loading, login, logout, isAuthenticated } = useAuth();

  // Clear any previous URL when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      // Clear the current URL and redirect to dashboard
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        // User is logged in - show main app
        <Home/>
      ) : (
        // User is not logged in - show login form
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <Login onLogin={login} />
        </div>
      )}
    </div>
  );
}

export default App;