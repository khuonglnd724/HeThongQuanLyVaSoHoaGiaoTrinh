const API_BASE_URL = 'http://localhost:8081';
const EUREKA_URL = 'http://localhost:8761';
const CONFIG_SERVER_URL = 'http://localhost:8888';

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// API request wrapper
async function apiRequest(url, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            // Token expired, redirect to login
            localStorage.clear();
            window.location.href = 'index.html';
            throw new Error('Unauthorized');
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Auth API
async function login(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
    }
    
    return await response.json();
}

// Eureka API
async function fetchEurekaApps() {
    const response = await fetch(`${EUREKA_URL}/eureka/apps`, {
        headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch Eureka apps');
    }
    
    return await response.json();
}

// Service health check
async function checkServiceHealth(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        return { status: 'DOWN', error: error.message };
    }
}

// Config Server API
async function fetchConfigServer(service, profile = 'default') {
    const url = `${CONFIG_SERVER_URL}/${service}/${profile}`;
    return await apiRequest(url);
}

// Get service details
async function getServiceDetails(serviceName) {
    const url = `${EUREKA_URL}/eureka/apps/${serviceName.toUpperCase()}`;
    const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch service details');
    }
    
    return await response.json();
}