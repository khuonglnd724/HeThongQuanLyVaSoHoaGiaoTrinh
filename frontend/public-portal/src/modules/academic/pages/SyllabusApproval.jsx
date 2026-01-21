import React from 'react';
import { useSyllabusApproval } from '../hooks';

export const SyllabusApproval = () => {
  const { syllabi, loading } = useSyllabusApproval();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Syllabus Approval</h1>
      
      {loading ? (
        <p>Loading syllabi...</p>
      ) : (
        <div className="space-y-4">
          {syllabi?.map(syllabus => (
            <div key={syllabus.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{syllabus.courseCode} - {syllabus.courseName}</h3>
                  <p className="text-gray-600 text-sm">Lecturer: {syllabus.lecturerName}</p>
                  <p className="text-gray-600 text-sm">Submitted: {new Date(syllabus.submittedDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SyllabusApproval;
