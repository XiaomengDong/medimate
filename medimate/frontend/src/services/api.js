const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

// Authentication API calls
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    return data;
  },

  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    return data;
  },

  getProfile: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile');
    }
    
    return data;
  }
};

// Generic authenticated request helper
export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (response.status === 401) {
    // Token expired, remove it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Session expired. Please login again.');
  }
  
  return response;
};

export const aiAPI = {
  chat: async (message, healthContext = {}) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message, healthContext }),
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'AI request failed');
    return data.response;
  },

  analyzeDocument: async (file) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Document analysis failed');
    return data;
  },

  generateHealthReport: async (healthData, patientInfo) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    if (!healthData || !patientInfo) {
      throw new Error('Health data and user profile is required to generate report');
    }

    const response = await fetch(`${API_BASE_URL}/api/ai/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ healthData, patientInfo }),
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.details || 'Health report generation failed');
    }

    return data;
  }
};

// export async function chatWithAI(message, history = []) {
//   return makeAuthenticatedRequest('/api/ai-assistant/chat', {
//     method: 'POST',
//     body: JSON.stringify({ message, chatHistory: history })
//   })
//   .then(r => r.json())
//   .then(({ reply }) => reply);
// }
//
// export async function uploadDoc(file) {
//   const fd = new FormData();
//   fd.append('file', file);
//   return makeAuthenticatedRequest('/api/ai-assistant/upload', {
//     method: 'POST',
//     body: fd,
//     headers: {}
//   }).then(r => r.json());
// }