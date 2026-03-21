// Global Configuration for RideBazzar
// This file sets the API base URL based on environment

const getRideBazzarConfig = () => {
  // Check if we're in production (Railway/deployed environment)
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1';
  
  // Get API base URL
  const API_BASE_URL = isProduction 
    ? window.location.origin // Use same domain in production
    : 'http://localhost:5000'; // Use localhost in development
  
  return {
    API_BASE_URL,
    isProduction,
    
    // API Endpoints
    AUTH_API: `${API_BASE_URL}/api/auth`,
    CARS_API: `${API_BASE_URL}/api/cars`,
    BOOKINGS_API: `${API_BASE_URL}/api/bookings`,
    PAYMENTS_API: `${API_BASE_URL}/api/payments`,
    INQUIRIES_API: `${API_BASE_URL}/api/inquiries`,
    
    // App Info
    APP_NAME: 'RideBazzar',
    VERSION: '1.0.0'
  };
};

// Export for use in other files
const CONFIG = getRideBazzarConfig();
console.log(`🚀 RideBazzar Config Loaded [${CONFIG.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
console.log(`📡 API Base URL: ${CONFIG.API_BASE_URL}`);
