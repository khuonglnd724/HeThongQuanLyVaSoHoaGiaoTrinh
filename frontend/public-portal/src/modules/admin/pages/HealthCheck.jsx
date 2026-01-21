import React from 'react';
import { useSystemHealth } from '../hooks';

export const HealthCheck = () => {
  const { health, loading } = useSystemHealth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Health Check</h1>
      
      {loading ? (
        <p>Checking system health...</p>
      ) : (
        <div className="space-y-4">
          {health?.services && Object.entries(health.services).map(([service, status]) => (
            <div key={service} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <span className="font-medium">{service}</span>
              <span className={`px-3 py-1 rounded text-sm font-medium ${status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthCheck;
