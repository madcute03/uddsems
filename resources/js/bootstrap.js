import axios from 'axios';
window.axios = axios;

// Set default headers
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['X-CSRF-TOKEN'] = document.head.querySelector('meta[name="csrf-token"]')?.content || '';

// Configure base URL if needed
// window.axios.defaults.baseURL = '/api';

// Add request interceptor
window.axios.interceptors.request.use(
    config => {
        // Add auth token if exists
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
