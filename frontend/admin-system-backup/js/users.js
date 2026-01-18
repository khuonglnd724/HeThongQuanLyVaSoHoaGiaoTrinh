let allUsers = [];

// Mock data - Replace with actual API calls
const mockUsers = [
    {
        id: '1',
        username: 'admin',
        email: 'admin@smd.edu.vn',
        fullName: 'System Administrator',
        roles: ['ADMIN'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        username: 'teacher1',
        email: 'teacher1@smd.edu.vn',
        fullName: 'Nguyen Van A',
        roles: ['TEACHER'],
        isActive: true,
        createdAt: '2024-01-15T00:00:00Z'
    },
    {
        id: '3',
        username: 'student1',
        email: 'student1@smd.edu.vn',
        fullName: 'Tran Thi B',
        roles: ['STUDENT'],
        isActive: true,
        createdAt: '2024-02-01T00:00:00Z'
    }
];

async function loadUsers() {
    try {
        // Fetch from real API
        const response = await fetch(`${API_BASE_URL}/api/users?page=0&size=100`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, try refresh
                await refreshToken();
                return loadUsers(); // Retry
            }
            throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        
        // Handle paginated response - extract content if it's a Page object
        allUsers = Array.isArray(data) ? data : (data.content || []);
        
        renderUsersTable(allUsers);
    } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to mock data for development
        console.log('Using mock data...');
        allUsers = mockUsers;
        renderUsersTable(allUsers);
        document.getElementById('usersTableBody').innerHTML += 
            '<tr><td colspan="8" style="text-align:center; color:#ff9800;"><em>⚠️ Using mock data (API unavailable)</em></td></tr>';
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-muted">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td><strong>${user.username}</strong></td>
            <td>${user.email}</td>
            <td>${user.fullName || '-'}</td>
            <td>
                ${user.roles.map(role => 
                    `<span class="status-badge status-${role.toLowerCase()}">${role}</span>`
                ).join(' ')}
            </td>
            <td>
                <span class="status-badge ${user.isActive ? 'status-up' : 'status-down'}">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${formatDate(user.createdAt)}</td>
            <td class="action-btns">
                <button class="btn btn-secondary btn-small" onclick="editUser('${user.id}')">
                    ✏️ Edit
                </button>
                <button class="btn btn-logout btn-small" onclick="deleteUser('${user.id}')">
                    🗑️ Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = allUsers;
    
    if (searchTerm) {
        filtered = filtered.filter(u => 
            u.username.toLowerCase().includes(searchTerm) ||
            u.email.toLowerCase().includes(searchTerm) ||
            (u.fullName && u.fullName.toLowerCase().includes(searchTerm))
        );
    }
    
    if (roleFilter !== 'all') {
        filtered = filtered.filter(u => u.roles.includes(roleFilter));
    }
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(u => 
            statusFilter === 'active' ? u.isActive : !u.isActive
        );
    }
    
    renderUsersTable(filtered);
}

function openUserModal(user = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('modalTitle');
    
    if (user) {
        title.textContent = 'Edit User';
        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('password').value = '';
        document.getElementById('password').required = false;
        document.getElementById('isActive').checked = user.isActive;
        
        // Set roles
        document.querySelectorAll('input[name="roles"]').forEach(checkbox => {
            checkbox.checked = user.roles.includes(checkbox.value);
        });
    } else {
        title.textContent = 'Add User';
        form.reset();
        document.getElementById('password').required = true;
    }
    
    modal.classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
    document.getElementById('userForm').reset();
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        openUserModal(user);
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        // Real API call
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                await refreshToken();
                return deleteUser(userId); // Retry
            }
            throw new Error('Failed to delete user');
        }
        
        allUsers = allUsers.filter(u => u.id !== userId);
        renderUsersTable(allUsers);
        alert('User deleted successfully');
    } catch (error) {
        alert('Failed to delete user: ' + error.message);
    }
}

// Form submission
document.getElementById('userForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('fullName').value;
    const password = document.getElementById('password').value;
    const isActive = document.getElementById('isActive').checked;
    
    const roles = Array.from(document.querySelectorAll('input[name="roles"]:checked'))
        .map(cb => cb.value);
    
    if (roles.length === 0) {
        alert('Please select at least one role');
        return;
    }
    
    const userData = {
        username,
        email,
        fullName,
        roles,
        isActive
    };
    
    if (password) {
        userData.password = password;
    }
    
    try {
        if (userId) {
            // Update API call
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    await refreshToken();
                    return; // Let user retry
                }
                throw new Error('Failed to update user');
            }
            
            const index = allUsers.findIndex(u => u.id == userId);
            if (index !== -1) {
                allUsers[index] = { ...allUsers[index], ...userData };
            }
        } else {
            // Create API call
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    await refreshToken();
                    return; // Let user retry
                }
                throw new Error('Failed to create user');
            }
            
            const newUser = await response.json();
            allUsers.push(newUser);
        }
        
        renderUsersTable(allUsers);
        closeUserModal();
        alert('User saved successfully');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save user: ' + error.message);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadUsers();
        
        document.getElementById('addUserBtn')?.addEventListener('click', () => openUserModal());
        document.getElementById('refreshBtn')?.addEventListener('click', loadUsers);
        document.getElementById('searchInput')?.addEventListener('input', filterUsers);
        document.getElementById('roleFilter')?.addEventListener('change', filterUsers);
        document.getElementById('statusFilter')?.addEventListener('change', filterUsers);
    }
});