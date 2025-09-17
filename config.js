// API Configuration for different environments
const API_CONFIG = {
  development: 'http://localhost:3000/api',
  production: 'https://chitralaya-backend.vercel.app/api' // Your actual backend URL
};

// Get current environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// Export for use in other files
window.API_BASE_URL = API_BASE_URL;
