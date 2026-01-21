import React from 'react';
import { useRealTimeMonitoring } from '../hooks';

export const ServerMonitoring = () => {
  const { metrics, loading } = useRealTimeMonitoring();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Server Monitoring</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">CPU Metrics</h3>
            <p className="text-gray-600">Usage: {metrics.cpu || 0}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Memory Metrics</h3>
            <p className="text-gray-600">Usage: {metrics.memory || 0}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Disk Metrics</h3>
            <p className="text-gray-600">Usage: {metrics.disk || 0}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Network Metrics</h3>
            <p className="text-gray-600">Incoming: {metrics.networkIn || 0} Mbps</p>
            <p className="text-gray-600">Outgoing: {metrics.networkOut || 0} Mbps</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerMonitoring;
