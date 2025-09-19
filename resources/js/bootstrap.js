import axios from 'axios';
import { Ziggy } from './ziggy';

// Set default headers for all axios requests
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

// Handle CSRF token
const csrfToken = document.head.querySelector('meta[name="csrf-token"]');
if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.content;
}

// Add a request interceptor
window.axios.interceptors.request.use(
    config => {
        // Add auth token if exists
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Add loading indicator here if needed
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add response interceptor
window.axios.interceptors.response.use(
    response => response,
    error => {
        // Handle session expiration (419 status code)
        if (error.response?.status === 419) {
            // Option 1: Refresh the page
            window.location.reload();
            
            // Option 2: Redirect to login (uncomment if preferred)
            // window.location.href = '/login';
        }
        
        // Handle other errors
        return Promise.reject(error);
    }
);
