import React from 'react';
import { useGradeManagement } from '../hooks';

export const GradeManagement = () => {
  const { students, loading, fetchStudents } = useGradeManagement();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Grade Management</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Student Name</th>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students?.map(student => (
                <tr key={student.id} className="border-t">
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.id}</td>
                  <td className="px-4 py-2">
                    <input type="number" placeholder="Grade" className="border px-2 py-1 rounded" />
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

export default GradeManagement;
