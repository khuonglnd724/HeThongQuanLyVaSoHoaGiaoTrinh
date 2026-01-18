const API_BASE_URL = 'http://localhost:8081';

// Get auth token
export function getAuthToken() {
    return localStorage.getItem('token');
}

// API request wrapper
export async function apiRequest(url, options = {}) {
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
            localStorage.clear();
            window.location.href = '/';
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
export async function login(username, password) {
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

// Eureka API (via auth-service proxy to avoid CORS)
export async function fetchEurekaApps() {
    return apiRequest(`${API_BASE_URL}/api/services/eureka/apps`);
}

// Service health check
export async function checkServiceHealth(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        return { status: 'DOWN', error: error.message };
    }
}

// Get service details (via auth-service proxy)
export async function getServiceDetails(serviceName) {
    return apiRequest(`${API_BASE_URL}/api/services/eureka/apps/${serviceName.toUpperCase()}`);
}

// Users API
export async function fetchUsers(page = 0, size = 100) {
    return apiRequest(`${API_BASE_URL}/api/users?page=${page}&size=${size}`);
}

export async function deleteUser(userId) {
    return apiRequest(`${API_BASE_URL}/api/users/${userId}`, { method: 'DELETE' });
}

export async function createUser(userData) {
    return apiRequest(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

export async function updateUser(userId, userData) {
    return apiRequest(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
}

// Roles API
export async function fetchRoles() {
    return apiRequest(`${API_BASE_URL}/api/roles`);
}

export async function fetchPermissions() {
    return apiRequest(`${API_BASE_URL}/api/roles/permissions/all`);
}

// Refresh token
export async function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    return data.token;
}
