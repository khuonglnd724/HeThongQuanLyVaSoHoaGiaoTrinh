import React from 'react';
import { useEnrollments } from '../hooks';

export const EnrolledClasses = () => {
  const { enrollments, loading } = useEnrollments();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Classes</h1>
      
      {loading ? (
        <p>Loading classes...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map(enrollment => (
            <div key={enrollment.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="font-bold text-lg mb-2">{enrollment.className}</h3>
              <p className="text-gray-600 mb-1"><span className="font-medium">Lecturer:</span> {enrollment.lecturer}</p>
              <p className="text-gray-600 mb-1"><span className="font-medium">Credits:</span> {enrollment.credits}</p>
              <p className="text-sm text-gray-500">Schedule: {enrollment.schedule}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledClasses;
