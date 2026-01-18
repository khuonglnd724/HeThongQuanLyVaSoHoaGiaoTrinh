let refreshInterval;

async function loadDashboardData() {
    try {
        const data = await fetchEurekaApps();
        
        if (data && data.applications && data.applications.application) {
            const apps = Array.isArray(data.applications.application) 
                ? data.applications.application 
                : [data.applications.application];
            
            // Get all instances
            const allInstances = apps.flatMap(app => {
                return Array.isArray(app.instance) ? app.instance : [app.instance];
            });
            
            // Calculate statistics
            const total = allInstances.length;
            const up = allInstances.filter(s => s.status === 'UP').length;
            const down = allInstances.filter(s => s.status === 'DOWN').length;
            const healthRate = total > 0 ? Math.round((up / total) * 100) : 0;
            
            // Update stats
            document.getElementById('totalServices').textContent = total;
            document.getElementById('upServices').textContent = up;
            document.getElementById('downServices').textContent = down;
            document.getElementById('healthRate').textContent = `${healthRate}%`;
            
            // Render services
            renderServices(allInstances);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('servicesGrid').innerHTML = 
            '<div class="error">Failed to load services</div>';
    }
}

function renderServices(instances) {
    const grid = document.getElementById('servicesGrid');
    
    if (instances.length === 0) {
        grid.innerHTML = '<div class="text-muted">No services registered</div>';
        return;
    }
    
    grid.innerHTML = instances.map(service => `
        <div class="service-card" onclick="window.open('${service.statusPageUrl}', '_blank')">
            <div class="service-header">
                <h3>${service.app}</h3>
                <span class="status-badge ${getStatusColor(service.status)}">${service.status}</span>
            </div>
            <div class="service-info">
                <div><strong>Instance:</strong> ${service.instanceId}</div>
                <div><strong>Host:</strong> ${service.hostName}</div>
                <div><strong>Port:</strong> ${service.port.$}</div>
                <div><strong>IP:</strong> ${service.ipAddr}</div>
                ${service.lastUpdatedTimestamp ? 
                    `<div><strong>Updated:</strong> ${formatDate(service.lastUpdatedTimestamp)}</div>` 
                    : ''}
            </div>
        </div>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadDashboardData();
        
        // Refresh every 10 seconds
        refreshInterval = setInterval(loadDashboardData, 10000);
        
        // Manual refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', loadDashboardData);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});