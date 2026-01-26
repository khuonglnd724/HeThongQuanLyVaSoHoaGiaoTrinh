import React from 'react';
import { useRealTimeMonitoring } from '../hooks';

export const SystemDashboard = () => {
  const { status, metrics, loading } = useRealTimeMonitoring();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">System Dashboard</h1>
      
      {loading ? (
        <p>Loading system status...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">CPU Usage</h3>
              <p className="text-2xl font-bold">{metrics.cpu || 0}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Memory Usage</h3>
              <p className="text-2xl font-bold">{metrics.memory || 0}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Disk Usage</h3>
              <p className="text-2xl font-bold">{metrics.disk || 0}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Uptime</h3>
              <p className="text-2xl font-bold">{status?.uptime || 'N/A'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemDashboard;
