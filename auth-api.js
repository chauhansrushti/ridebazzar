// Backend API Bridge for Authentication
// This file connects the frontend to the Node.js backend

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:5000/api' 
    : 'https://ridebazzar.up.railway.app/api';

class BackendAuthManager {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.token = localStorage.getItem('ridebazzar_token');
  }

  // Get current logged-in user
  getCurrentUser() {
    const userStr = localStorage.getItem('ridebazzar_current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Save current user to localStorage
  saveCurrentUser(user) {
    localStorage.setItem('ridebazzar_current_user', JSON.stringify(user));
  }

  // Save authentication token
  saveToken(token) {
    localStorage.setItem('ridebazzar_token', token);
    this.token = token;
  }

  // API helper function
  async apiCall(endpoint, method = 'GET', data = null) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }
      
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Register new user
  async register(userData) {
    try {
      const result = await this.apiCall('/auth/register', 'POST', userData);
      
      if (result.success) {
        // Auto-login after registration
        const loginResult = await this.login({
          username: userData.username,
          password: userData.password
        });
        return loginResult;
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const result = await this.apiCall('/auth/login', 'POST', credentials);
      
      if (result.success && result.token) {
        this.saveToken(result.token);
        this.saveCurrentUser(result.user);
        this.currentUser = result.user;
        
        console.log('✅ Login successful:', result.user.username);
        return result;
      }
      
      throw new Error(result.message || 'Login failed');
    } catch (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('ridebazzar_token');
    localStorage.removeItem('ridebazzar_current_user');
    this.token = null;
    this.currentUser = null;
    console.log('✅ Logged out successfully');
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null && this.token !== null;
  }

  // Get user profile
  async getProfile() {
    try {
      const result = await this.apiCall('/auth/profile');
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const result = await this.apiCall('/auth/profile', 'PUT', profileData);
      
      if (result.success) {
        this.saveCurrentUser(result.user);
        this.currentUser = result.user;
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password validation
  validatePassword(password) {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    return true;
  }

  // Username validation
  validateUsername(username) {
    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    return true;
  }
}

// Create global instance
const authManager = new BackendAuthManager();

// Backward compatibility functions for existing frontend code
function getCurrentUser() {
  return authManager.getCurrentUser();
}

function isLoggedIn() {
  return authManager.isLoggedIn();
}

async function loginUser(username, password) {
  try {
    const result = await authManager.login({ username, password });
    return result;
  } catch (error) {
    throw error;
  }
}

async function registerUser(userData) {
  try {
    const result = await authManager.register(userData);
    return result;
  } catch (error) {
    throw error;
  }
}

function logoutUser() {
  authManager.logout();
}

// Check backend connection on load
window.addEventListener('load', async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      console.log('✅ Backend connection established');
    } else {
      console.warn('⚠️ Backend connection issues');
    }
  } catch (error) {
    console.warn('⚠️ Backend not available, using fallback mode');
  }
});

console.log('🔗 Backend Authentication API loaded');
