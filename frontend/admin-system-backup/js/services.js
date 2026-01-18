let allServices = [];

async function loadServices() {
    try {
        const data = await fetchEurekaApps();
        
        if (data && data.applications && data.applications.application) {
            const apps = Array.isArray(data.applications.application) 
                ? data.applications.application 
                : [data.applications.application];
            
            allServices = apps.flatMap(app => {
                return Array.isArray(app.instance) ? app.instance : [app.instance];
            });
            
            renderServicesTable(allServices);
        }
    } catch (error) {
        console.error('Error loading services:', error);
        document.getElementById('servicesTableBody').innerHTML = 
            '<tr><td colspan="7" class="error">Failed to load services</td></tr>';
    }
}

function renderServicesTable(services) {
    const tbody = document.getElementById('servicesTableBody');
    
    if (services.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-muted">No services found</td></tr>';
        return;
    }
    
    tbody.innerHTML = services.map(service => `
        <tr onclick="showServiceDetails('${service.instanceId}')">
            <td><strong>${service.app}</strong></td>
            <td>${service.instanceId}</td>
            <td>${service.hostName}</td>
            <td>${service.port.$}</td>
            <td><span class="status-badge ${getStatusColor(service.status)}">${service.status}</span></td>
            <td>${formatDate(service.lastUpdatedTimestamp)}</td>
            <td>
                <a href="${service.statusPageUrl}" target="_blank" 
                   onclick="event.stopPropagation()" 
                   class="btn btn-secondary" style="padding: 4px 12px; font-size: 12px;">
                    View
                </a>
            </td>
        </tr>
    `).join('');
}

function showServiceDetails(instanceId) {
    const service = allServices.find(s => s.instanceId === instanceId);
    if (!service) return;
    
    const modal = document.getElementById('serviceModal');
    const details = document.getElementById('serviceDetails');
    
    details.innerHTML = `
        <div style="line-height: 1.8;">
            <h3>${service.app}</h3>
            <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--border);">
            <p><strong>Instance ID:</strong> ${service.instanceId}</p>
            <p><strong>Host Name:</strong> ${service.hostName}</p>
            <p><strong>IP Address:</strong> ${service.ipAddr}</p>
            <p><strong>Port:</strong> ${service.port.$}</p>
            <p><strong>Secure Port:</strong> ${service.securePort.$}</p>
            <p><strong>Status:</strong> <span class="status-badge ${getStatusColor(service.status)}">${service.status}</span></p>
            <p><strong>Health Check URL:</strong> <a href="${service.healthCheckUrl}" target="_blank">${service.healthCheckUrl}</a></p>
            <p><strong>Status Page URL:</strong> <a href="${service.statusPageUrl}" target="_blank">${service.statusPageUrl}</a></p>
            <p><strong>Home Page URL:</strong> <a href="${service.homePageUrl}" target="_blank">${service.homePageUrl}</a></p>
            <p><strong>Last Updated:</strong> ${formatDate(service.lastUpdatedTimestamp)}</p>
            <p><strong>Last Dirty:</strong> ${formatDate(service.lastDirtyTimestamp)}</p>
            ${service.metadata ? `
                <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--border);">
                <p><strong>Metadata:</strong></p>
                <pre style="background: var(--light); padding: 12px; border-radius: 6px; font-size: 12px;">${JSON.stringify(service.metadata, null, 2)}</pre>
            ` : ''}
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Filters
function filterServices() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = allServices;
    
    if (searchTerm) {
        filtered = filtered.filter(s => 
            s.app.toLowerCase().includes(searchTerm) ||
            s.instanceId.toLowerCase().includes(searchTerm) ||
            s.hostName.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    renderServicesTable(filtered);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadServices();
        
        document.getElementById('refreshBtn')?.addEventListener('click', loadServices);
        document.getElementById('searchInput')?.addEventListener('input', filterServices);
        document.getElementById('statusFilter')?.addEventListener('change', filterServices);
        
        setInterval(loadServices, 15000);
    }
});