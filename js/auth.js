// Enhanced Authentication System for RideBazzar

class AuthManager {
  constructor() {
    this.users = this.getUsers();
    this.currentUser = this.getCurrentUser();
  }

  // Get all registered users from localStorage
  getUsers() {
    return JSON.parse(localStorage.getItem('ridebazzar_users') || '[]');
  }

  // Save users to localStorage
  saveUsers(users) {
    localStorage.setItem('ridebazzar_users', JSON.stringify(users));
  }

  // Get current logged-in user
  getCurrentUser() {
    const username = localStorage.getItem('ridebazzar_user');
    if (!username) return null;
    return this.users.find(user => user.username === username) || null;
  }

  // Simple password hashing simulation (not for production)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Register new user
  register(userData) {
    const { username, password, email, phone, location } = userData;
    
    // Validation
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!phone || !this.isValidPhone(phone)) {
      throw new Error('Please enter a valid phone number');
    }

    // Check if user already exists
    if (this.users.find(user => user.username === username)) {
      throw new Error('Username already exists');
    }

    if (this.users.find(user => user.email === email)) {
      throw new Error('Email already registered');
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      password: this.hashPassword(password),
      email,
      phone,
      location: location || '',
      registeredAt: new Date().toISOString(),
      profile: {
        fullName: '',
        bio: '',
        profilePicture: '',
        verified: false
      },
      stats: {
        carsPosted: 0,
        carsSold: 0,
        carsBought: 0,
        rating: 0,
        reviews: 0
      }
    };

    this.users.push(newUser);
    this.saveUsers(this.users);
    return newUser;
  }

  // Login user
  login(username, password) {
    const user = this.users.find(u => u.username === username);
    if (!user) {
      throw new Error('Username not found');
    }

    if (user.password !== this.hashPassword(password)) {
      throw new Error('Invalid password');
    }

    localStorage.setItem('ridebazzar_user', username);
    this.currentUser = user;
    return user;
  }

  // Logout user
  logout() {
    localStorage.removeItem('ridebazzar_user');
    this.currentUser = null;
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('ridebazzar_user');
  }

  // Update user profile
  updateProfile(updates) {
    if (!this.currentUser) {
      throw new Error('User not logged in');
    }

    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user data
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveUsers(this.users);
    this.currentUser = this.users[userIndex];
    return this.currentUser;
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone validation
  isValidPhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number format
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  // Get user by username
  getUserByUsername(username) {
    return this.users.find(user => user.username === username);
  }

  // Get user statistics
  updateUserStats(username, statType, increment = 1) {
    const user = this.users.find(u => u.username === username);
    if (user) {
      user.stats[statType] += increment;
      this.saveUsers(this.users);
    }
  }
}

// Global auth manager instance
const authManager = new AuthManager();

// Global functions for backward compatibility
function isLoggedIn() {
  return authManager.isLoggedIn();
}

function setLoggedInUser(username) {
  localStorage.setItem('ridebazzar_user', username);
}

function logoutUser() {
  authManager.logout();
  renderLoginStatus();
  // Redirect to home page
  window.location.href = 'home.html';
}

function renderLoginStatus() {
  const loginBtn = document.getElementById('loginNavBtn');
  const logoutBtn = document.getElementById('logoutNavBtn');
  const profileBtn = document.getElementById('profileNavBtn');
  const notificationsBtn = document.getElementById('notificationsNavBtn');
  
  if (loginBtn && logoutBtn) {
    if (authManager.isLoggedIn()) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      if (profileBtn) profileBtn.style.display = 'inline-block';
      if (notificationsBtn) notificationsBtn.style.display = 'inline-block';
      
      // Initialize notification badge if messaging system is available
      if (typeof showNotificationBadge === 'function') {
        showNotificationBadge();
      }
    } else {
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      if (profileBtn) profileBtn.style.display = 'none';
      if (notificationsBtn) notificationsBtn.style.display = 'none';
    }
  }
}

// Enhanced login modal functions
function showLoginModal() {
  document.getElementById('loginModal').style.display = 'block';
  document.getElementById('loginTab').click(); // Default to login tab
}

function hideLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  clearLoginForms();
}

function clearLoginForms() {
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
}

function switchTab(tab) {
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginFormContent');
  const registerForm = document.getElementById('registerFormContent');

  if (tab === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
  }
}

function handleLogin() {
  try {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
      showAuthMessage('Please fill in all fields', 'error');
      return;
    }

    const user = authManager.login(username, password);
    showAuthMessage('Login successful!', 'success');
    hideLoginModal();
    renderLoginStatus();
    
    // Optional: Redirect or refresh page
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    showAuthMessage(error.message, 'error');
  }
}

function handleRegister() {
  try {
    const userData = {
      username: document.getElementById('registerUsername').value.trim(),
      password: document.getElementById('registerPassword').value,
      email: document.getElementById('registerEmail').value.trim(),
      phone: document.getElementById('registerPhone').value.trim(),
      location: document.getElementById('registerLocation').value.trim()
    };

    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (userData.password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const user = authManager.register(userData);
    showAuthMessage('Registration successful! Please login.', 'success');
    
    // Switch to login tab after successful registration
    setTimeout(() => {
      switchTab('login');
      document.getElementById('loginUsername').value = userData.username;
    }, 1000);
    
  } catch (error) {
    showAuthMessage(error.message, 'error');
  }
}

function showAuthMessage(message, type) {
  const messageDiv = document.getElementById('authMessage');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `auth-message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }
}

// Update navbar for consistent navigation across pages
function updateNavbar() {
  renderLoginStatus();
  
  // Update notification badges if messaging system is available
  if (authManager.isLoggedIn() && typeof showNotificationBadge === 'function') {
    showNotificationBadge();
  }
}

// Check authentication and redirect if needed
function checkAuthAndRedirect() {
  if (!authManager.isLoggedIn()) {
    // Allow access to these pages without login
    const allowedPages = ['home.html', 'all-cars.html', 'car-details.html', 'compare.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!allowedPages.includes(currentPage)) {
      window.location.href = 'home.html';
      return false;
    }
  }
  return true;
}

// Initialize auth status on page load
document.addEventListener('DOMContentLoaded', renderLoginStatus);
