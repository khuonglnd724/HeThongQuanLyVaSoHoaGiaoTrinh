// Mock roles data
const mockRoles = [
    {
        id: '1',
        name: 'ADMIN',
        description: 'Full system access with all permissions',
        userCount: 2,
        permissions: ['user.create', 'user.read', 'user.update', 'user.delete', 
                     'role.manage', 'service.manage', 'config.manage']
    },
    {
        id: '2',
        name: 'TEACHER',
        description: 'Access to academic modules and syllabus management',
        userCount: 15,
        permissions: ['syllabus.create', 'syllabus.read', 'syllabus.update', 
                     'academic.read', 'academic.update']
    },
    {
        id: '3',
        name: 'STUDENT',
        description: 'Read-only access to public content and own data',
        userCount: 150,
        permissions: ['public.read', 'syllabus.read', 'academic.read']
    }
];

// All available permissions
const allPermissions = [
    { id: 'user.create', name: 'Create Users', category: 'User Management' },
    { id: 'user.read', name: 'View Users', category: 'User Management' },
    { id: 'user.update', name: 'Update Users', category: 'User Management' },
    { id: 'user.delete', name: 'Delete Users', category: 'User Management' },
    { id: 'role.manage', name: 'Manage Roles', category: 'Role Management' },
    { id: 'service.manage', name: 'Manage Services', category: 'System' },
    { id: 'config.manage', name: 'Manage Configuration', category: 'System' },
    { id: 'syllabus.create', name: 'Create Syllabus', category: 'Academic' },
    { id: 'syllabus.read', name: 'View Syllabus', category: 'Academic' },
    { id: 'syllabus.update', name: 'Update Syllabus', category: 'Academic' },
    { id: 'syllabus.delete', name: 'Delete Syllabus', category: 'Academic' },
    { id: 'academic.read', name: 'View Academic Data', category: 'Academic' },
    { id: 'academic.update', name: 'Update Academic Data', category: 'Academic' },
    { id: 'public.read', name: 'View Public Content', category: 'Public' },
];

async function loadRoles() {
    try {
        // Fetch roles from API
        const rolesResponse = await fetch(`${API_BASE_URL}/api/roles`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!rolesResponse.ok) {
            if (rolesResponse.status === 401) {
                await refreshToken();
                return loadRoles(); // Retry
            }
            throw new Error('Failed to fetch roles');
        }
        
        let roles = await rolesResponse.json();
        
        // Fetch all permissions
        const permResponse = await fetch(`${API_BASE_URL}/api/roles/permissions/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        let allPermsData = [];
        if (permResponse.ok) {
            const groupedPerms = await permResponse.json();
            // Convert grouped permissions to flat array
            Object.keys(groupedPerms).forEach(category => {
                groupedPerms[category].forEach(perm => {
                    allPermsData.push({
                        id: perm,
                        name: perm,
                        category: category
                    });
                });
            });
        } else {
            // Fallback to mock permissions
            allPermsData = allPermissions;
        }
        
        renderRolesGrid(roles);
        renderPermissionsMatrix(roles, allPermsData);
    } catch (error) {
        console.error('Error loading roles:', error);
        // Fallback to mock data
        console.log('Using mock data...');
        renderRolesGrid(mockRoles);
        renderPermissionsMatrix(mockRoles);
    }
}

function renderRolesGrid(roles) {
    const grid = document.getElementById('rolesGrid');
    
    grid.innerHTML = roles.map(role => `
        <div class="role-card ${role.name.toLowerCase()}">
            <h3>${role.name}</h3>
            <p>${role.description}</p>
            <div class="role-users">
                <span>👥</span>
                <span>${role.userCount} users</span>
            </div>
            <div class="role-actions">
                <button class="btn btn-secondary btn-small" onclick="editRole('${role.id}')">
                    ✏️ Edit
                </button>
                ${role.name !== 'ADMIN' ? `
                    <button class="btn btn-logout btn-small" onclick="deleteRole('${role.id}')">
                        🗑️ Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function renderPermissionsMatrix(roles) {
    const tbody = document.getElementById('permissionsTableBody');
    
    // Group permissions by category
    const categories = [...new Set(allPermissions.map(p => p.category))];
    
    let html = '';
    categories.forEach(category => {
        const categoryPerms = allPermissions.filter(p => p.category === category);
        
        html += `
            <tr>
                <td colspan="4" style="background: var(--light); font-weight: 600;">
                    ${category}
                </td>
            </tr>
        `;
        
        categoryPerms.forEach(perm => {
            html += `
                <tr>
                    <td>${perm.name}</td>
                    ${roles.map(role => {
                        const hasPermission = role.permissions.includes(perm.id);
                        return `
                            <td>
                                <span class="permission-check ${hasPermission ? 'granted' : 'denied'}">
                                    ${hasPermission ? '✓' : '✗'}
                                </span>
                            </td>
                        `;
                    }).join('')}
                </tr>
            `;
        });
    });
    
    tbody.innerHTML = html;
}

function openRoleModal(role = null) {
    const modal = document.getElementById('roleModal');
    const form = document.getElementById('roleForm');
    const title = document.getElementById('roleModalTitle');
    const grid = document.getElementById('permissionsGrid');
    
    // Populate permissions grid
    const categories = [...new Set(allPermissions.map(p => p.category))];
    grid.innerHTML = categories.map(category => {
        const categoryPerms = allPermissions.filter(p => p.category === category);
        return `
            <div>
                <strong>${category}</strong>
                ${categoryPerms.map(perm => `
                    <label class="checkbox-label" style="margin-top: 8px;">
                        <input type="checkbox" name="permissions" value="${perm.id}"
                               ${role && role.permissions.includes(perm.id) ? 'checked' : ''}>
                        <span>${perm.name}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }).join('');
    
    if (role) {
        title.textContent = 'Edit Role';
        document.getElementById('roleId').value = role.id;
        document.getElementById('roleName').value = role.name;
        document.getElementById('roleDescription').value = role.description;
    } else {
        title.textContent = 'Add Role';
        form.reset();
    }
    
    modal.classList.remove('hidden');
}

function closeRoleModal() {
    document.getElementById('roleModal').classList.add('hidden');
}

function editRole(roleId) {
    const role = mockRoles.find(r => r.id === roleId);
    if (role) {
        openRoleModal(role);
    }
}

async function deleteRole(roleId) {
    if (!confirm('Are you sure you want to delete this role?')) {
        return;
    }
    
    try {
        // TODO: API call
        alert('Role deleted successfully');
        loadRoles();
    } catch (error) {
        alert('Failed to delete role: ' + error.message);
    }
}

// Form submission
document.getElementById('roleForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const roleId = document.getElementById('roleId').value;
    const roleName = document.getElementById('roleName').value;
    const roleDescription = document.getElementById('roleDescription').value;
    
    const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
        .map(cb => cb.value);
    
    const roleData = {
        name: roleName,
        description: roleDescription,
        permissions
    };
    
    try {
        // TODO: API call
        alert('Role saved successfully');
        closeRoleModal();
        loadRoles();
    } catch (error) {
        alert('Failed to save role: ' + error.message);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadRoles();
        document.getElementById('addRoleBtn')?.addEventListener('click', () => openRoleModal());
    }
});