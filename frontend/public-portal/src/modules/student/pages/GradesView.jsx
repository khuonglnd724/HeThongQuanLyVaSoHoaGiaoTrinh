import React from 'react';
import { useGrades } from '../hooks';

export const GradesView = () => {
  const { grades, loading } = useGrades();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Grades</h1>
      
      {loading ? (
        <p>Loading grades...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Subject</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Class</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Semester</th>
                <th className="px-6 py-3 text-center font-medium text-gray-900">Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(grade => (
                <tr key={grade.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">{grade.subject}</td>
                  <td className="px-6 py-3">{grade.className}</td>
                  <td className="px-6 py-3">{grade.semester}</td>
                  <td className="px-6 py-3 text-center">
                    <span className="font-bold text-lg text-green-600">{grade.score}</span>
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

export default GradesView;
