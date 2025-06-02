import React from 'react';
import Login from '../components/Login';

function Home({ onLogin }) {
  return (
    <div className="login-container">
      <div className="login">
        <h1>MEDI<span>MATE+</span></h1>
      </div>
      <p>Your AI-Powered Healthcare Companion</p>
      <Login onLogin={onLogin} />
    </div>
  );
}

export default Home;