# Frontend Integration Guide

This guide explains how to connect your existing frontend with the new Node.js backend API.

## API Base URL

```javascript
const API_BASE_URL = "http://localhost:5000/api";
```

## Authentication Headers

For protected routes, include the JWT token in the Authorization header:

```javascript
const token = localStorage.getItem("authToken");
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};
```

## Updated JavaScript Files

### 1. Update auth.js

Replace the existing AuthManager with API calls:

```javascript
class AuthManager {
  constructor() {
    this.apiUrl = "http://localhost:5000/api/auth";
    this.currentUser = this.getCurrentUser();
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("authToken", result.data.token);
        localStorage.setItem("currentUser", JSON.stringify(result.data.user));
        this.currentUser = result.data.user;
        return { success: true, user: result.data.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: "Network error during registration" };
    }
  }

  async login(username, password) {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("authToken", result.data.token);
        localStorage.setItem("currentUser", JSON.stringify(result.data.user));
        this.currentUser = result.data.user;
        return { success: true, user: result.data.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: "Network error during login" };
    }
  }

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    this.currentUser = null;
    window.location.href = "home.html";
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  }

  isLoggedIn() {
    return !!localStorage.getItem("authToken");
  }

  getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
```

### 2. Update carManager.js

Replace localStorage with API calls:

```javascript
class CarManager {
  constructor() {
    this.apiUrl = "http://localhost:5000/api/cars";
    this.authManager = new AuthManager();
  }

  async getAllCars(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${this.apiUrl}?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        return result.data.cars;
      }
      return [];
    } catch (error) {
      console.error("Error fetching cars:", error);
      return [];
    }
  }

  async getCarById(carId) {
    try {
      const response = await fetch(`${this.apiUrl}/${carId}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching car:", error);
      return null;
    }
  }

  async createCar(carData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.authManager.getAuthHeaders(),
        },
        body: JSON.stringify(carData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, message: "Network error" };
    }
  }

  async updateCar(carId, carData) {
    try {
      const response = await fetch(`${this.apiUrl}/${carId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...this.authManager.getAuthHeaders(),
        },
        body: JSON.stringify(carData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, message: "Network error" };
    }
  }

  async deleteCar(carId) {
    try {
      const response = await fetch(`${this.apiUrl}/${carId}`, {
        method: "DELETE",
        headers: this.authManager.getAuthHeaders(),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, message: "Network error" };
    }
  }

  async getUserCars() {
    try {
      const response = await fetch(`${this.apiUrl}/user/my-cars`, {
        headers: this.authManager.getAuthHeaders(),
      });

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Error fetching user cars:", error);
      return [];
    }
  }
}
```

### 3. Update paymentSystem.js

Replace with booking and payment API calls:

```javascript
class PaymentSystem {
  constructor() {
    this.bookingApiUrl = "http://localhost:5000/api/bookings";
    this.paymentApiUrl = "http://localhost:5000/api/payments";
    this.authManager = new AuthManager();
  }

  async createBooking(bookingData) {
    try {
      const response = await fetch(this.bookingApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.authManager.getAuthHeaders(),
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, message: "Network error during booking" };
    }
  }

  async processPayment(paymentData) {
    try {
      const response = await fetch(`${this.paymentApiUrl}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.authManager.getAuthHeaders(),
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, message: "Network error during payment" };
    }
  }

  async getUserBookings() {
    try {
      const response = await fetch(`${this.bookingApiUrl}/my-bookings`, {
        headers: this.authManager.getAuthHeaders(),
      });

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }
  }

  async cancelBooking(bookingId, reason = "") {
    try {
      const response = await fetch(`${this.bookingApiUrl}/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...this.authManager.getAuthHeaders(),
        },
        body: JSON.stringify({ cancellationReason: reason }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, message: "Network error during cancellation" };
    }
  }

  async getTransactionHistory() {
    try {
      const response = await fetch(`${this.paymentApiUrl}/history`, {
        headers: this.authManager.getAuthHeaders(),
      });

      const result = await response.json();
      return result.success ? result.data.transactions : [];
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
  }
}
```

## HTML Updates

### Update forms to use the new API responses:

#### Login Form (in home.html)

```javascript
// Update the login form submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  const authManager = new AuthManager();
  const result = await authManager.login(username, password);

  if (result.success) {
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } else {
    alert(result.message || "Login failed");
  }
});
```

#### Registration Form (in home.html)

```javascript
// Update the registration form submission
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
      username: document.getElementById("regUsername").value,
      email: document.getElementById("regEmail").value,
      password: document.getElementById("regPassword").value,
      fullName: document.getElementById("regFullName").value,
      phone: document.getElementById("regPhone").value,
      location: document.getElementById("regLocation").value,
    };

    const authManager = new AuthManager();
    const result = await authManager.register(userData);

    if (result.success) {
      alert("Registration successful!");
      window.location.href = "dashboard.html";
    } else {
      alert(result.message || "Registration failed");
    }
  });
```

## Environment Configuration

Create a config.js file for environment settings:

```javascript
// config.js
const CONFIG = {
  API_BASE_URL:
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://your-production-api.com/api",

  // Add other configuration as needed
  PAYMENT_GATEWAY_URL: "",
  FILE_UPLOAD_URL: "",
};

// Make it globally available
window.CONFIG = CONFIG;
```

## Error Handling

Add global error handling for API calls:

```javascript
// utils.js
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "API call failed");
    }

    return result;
  } catch (error) {
    console.error("API call error:", error);

    // Handle specific error cases
    if (error.message.includes("401") || error.message.includes("token")) {
      // Token expired, redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      window.location.href = "home.html";
    }

    throw error;
  }
}
```

## Testing the Integration

1. **Start the backend server**:

   ```bash
   cd backend
   npm run dev
   ```

2. **Update your HTML files** to include the updated JavaScript

3. **Test the flow**:
   - Registration and login
   - Car listing and viewing
   - Booking creation
   - Payment processing

## Migration Checklist

- [ ] Update auth.js with API calls
- [ ] Update carManager.js with API calls
- [ ] Update paymentSystem.js with API calls
- [ ] Add error handling for API failures
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test car creation/viewing
- [ ] Test booking creation
- [ ] Test payment processing
- [ ] Update all localStorage references
- [ ] Add loading states for API calls
- [ ] Handle network errors gracefully

The backend is now ready and provides all the functionality your frontend needs. The main difference is that data is now stored in a MySQL database instead of localStorage, and all operations go through proper API endpoints with authentication.
