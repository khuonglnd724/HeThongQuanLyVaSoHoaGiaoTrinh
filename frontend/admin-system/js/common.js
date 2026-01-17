// Authentication check
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Display user info
    const username = localStorage.getItem('username');
    const userInfoEl = document.getElementById('userInfo');
    if (userInfoEl && username) {
        userInfoEl.textContent = `👤 ${username}`;
    }
    
    return true;
}

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('refreshToken');
                window.location.href = 'index.html';
            }
        });
    }
});

// Format date
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
}

// Get status color
function getStatusColor(status) {
    const colors = {
        'UP': 'status-up',
        'DOWN': 'status-down',
        'STARTING': 'status-starting',
        'OUT_OF_SERVICE': 'status-down',
        'UNKNOWN': 'status-starting'
    };
    return colors[status] || 'status-starting';
}

// Modal functions
function closeModal() {
    document.getElementById('serviceModal')?.classList.add('hidden');
}

// Click outside modal to close
window.addEventListener('click', (e) => {
    const modal = document.getElementById('serviceModal');
    if (modal && e.target === modal) {
        closeModal();
    }
});