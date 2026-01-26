import React from 'react';
import { useClassManagement } from '../hooks';

export const ClassManagement = () => {
  const { classes, loading } = useClassManagement();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Class Management</h1>
      
      {loading ? (
        <p>Loading classes...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes?.map(cls => (
            <div key={cls.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">{cls.name}</h3>
              <p className="text-gray-600">Students: {cls.studentCount}</p>
              <p className="text-gray-600">Schedule: {cls.schedule}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
