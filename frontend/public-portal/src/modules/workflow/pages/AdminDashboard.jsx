import React from 'react';
import { useWorkflowDashboard } from '../hooks';

export const AdminDashboard = () => {
  const { dashboard, loading } = useWorkflowDashboard();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Workflow Dashboard</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
              <p className="text-2xl font-bold">{dashboard?.userCount || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Pending Approvals</h3>
              <p className="text-2xl font-bold text-orange-600">{dashboard?.pendingApprovals || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Syllabi Pending</h3>
              <p className="text-2xl font-bold text-orange-600">{dashboard?.syllabaPending || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Active Sessions</h3>
              <p className="text-2xl font-bold text-blue-600">{dashboard?.activeSessions || 0}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
