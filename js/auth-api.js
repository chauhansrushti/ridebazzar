// Bridge between frontend and backend API
// This file adapts the existing frontend to work with the new backend

class AuthManager {
    constructor() {
        this.apiUrl = typeof CONFIG !== 'undefined' ? CONFIG.AUTH_API : 'http://localhost:5000/api/auth';
        this.currentUser = this.getCurrentUser();
    }

    // Get current logged-in user
    getCurrentUser() {
        // Try userData key first (newer format), then currentUser (legacy)
        let userStr = localStorage.getItem('userData');
        if (!userStr) {
            userStr = localStorage.getItem('currentUser');
        }
        return userStr ? JSON.parse(userStr) : null;
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem('authToken');
    }

    // Get auth headers for API calls
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Register new user (API call)
    async register(userData) {
        try {
            const response = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();
            
            if (result.success) {
                localStorage.setItem('authToken', result.data.token);
                localStorage.setItem('currentUser', JSON.stringify(result.data.user));
                this.currentUser = result.data.user;
                return { success: true, user: result.data.user };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error during registration' };
        }
    }

    // Login user (API call)
    async login(username, password) {
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            
            if (result.success) {
                localStorage.setItem('authToken', result.data.token);
                localStorage.setItem('currentUser', JSON.stringify(result.data.user));
                this.currentUser = result.data.user;
                return { success: true, user: result.data.user };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error during login' };
        }
    }

    // Logout user
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        localStorage.removeItem('ridebazzar_user');
        this.currentUser = null;
        window.location.href = 'home.html';
    }

    // Legacy methods for backward compatibility with existing frontend
    getUsers() {
        // This is now handled by the backend, return empty for compatibility
        return [];
    }

    saveUsers(users) {
        // This is now handled by the backend, do nothing for compatibility
    }

    hashPassword(password) {
        // Password hashing is now handled by the backend
        return password;
    }

    registerUser(userData) {
        // Wrapper for async register method for backward compatibility
        return this.register(userData);
    }

    loginUser(username, password) {
        // Wrapper for async login method for backward compatibility
        return this.login(username, password);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone);
    }

    generateUserId() {
        // Not needed for backend, but keep for compatibility
        return Date.now().toString();
    }

    updateUserProfile(updatedData) {
        // This would need to be implemented as an API call
        console.log('Profile update:', updatedData);
    }

    deleteUser(username) {
        // This would need to be implemented as an API call
        console.log('Delete user:', username);
    }

    getUserByUsername(username) {
        // This would need to be implemented as an API call
        console.log('Get user by username:', username);
    }

    getAllUsers() {
        // This would need to be implemented as an API call
        return [];
    }

    changePassword(currentPassword, newPassword) {
        // This would need to be implemented as an API call
        console.log('Change password for:', this.currentUser?.username);
    }

    resetPassword(email) {
        // This would need to be implemented as an API call
        console.log('Reset password for:', email);
    }

    verifyUser(username) {
        // This would need to be implemented as an API call
        console.log('Verify user:', username);
    }

    suspendUser(username) {
        // This would need to be implemented as an API call
        console.log('Suspend user:', username);
    }

    getUserStats() {
        // This would need to be implemented as an API call
        return {
            totalUsers: 0,
            activeUsers: 0,
            newUsersToday: 0
        };
    }
}

// Create global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.authManager = new AuthManager();
}

// Global logout function that works across all pages
function logoutUser() {
    try {
        // Clear all possible auth tokens and user data
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        localStorage.removeItem('ridebazzar_user');
        localStorage.removeItem('ridebazzar_token');
        localStorage.removeItem('ridebazzar_current_user');
        
        // Also try to call server logout if available
        const token = localStorage.getItem('authToken');
        if (token) {
            fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).catch(() => {
                // Ignore errors, we're logging out anyway
            });
        }
        
        // Determine the correct path to home.html
        const currentPath = window.location.pathname;
        const homePath = currentPath.includes('/') && !currentPath.endsWith('.html') ? 
            '../home.html' : 'home.html';
        
        // Redirect to home page
        window.location.href = homePath;
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect anyway
        window.location.href = 'home.html';
    }
}

// Alias for compatibility with different naming conventions
function handleLogout() {
    logoutUser();
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.logoutUser = logoutUser;
    window.handleLogout = handleLogout;
}
