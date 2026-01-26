import React from 'react';
import { useBackupManagement } from '../hooks';

export const BackupManagement = () => {
  const { backups, loading, createBackup } = useBackupManagement();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Backup Management</h1>
      
      <button onClick={createBackup} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
        Create Backup Now
      </button>
      
      {loading ? (
        <p>Loading backups...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Backup ID</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Size</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups?.map(backup => (
                <tr key={backup.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">{backup.id}</td>
                  <td className="px-6 py-3">{new Date(backup.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3">{backup.size}</td>
                  <td className="px-6 py-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Complete</span>
                  </td>
                  <td className="px-6 py-3">
                    <button className="text-blue-600 hover:text-blue-900">Restore</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BackupManagement;
