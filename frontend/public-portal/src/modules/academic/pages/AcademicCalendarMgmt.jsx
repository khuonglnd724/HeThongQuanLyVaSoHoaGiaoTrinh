import React from 'react';
import { useAcademicCalendar } from '../hooks';

export const AcademicCalendarMgmt = () => {
  const { calendar, semesters, loading } = useAcademicCalendar();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Academic Calendar</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Current Semester</h2>
            {calendar && (
              <>
                <p><span className="font-medium">Name:</span> {calendar.currentSemester}</p>
                <p><span className="font-medium">Start:</span> {calendar.startDate}</p>
                <p><span className="font-medium">End:</span> {calendar.endDate}</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Semesters</h2>
            <div className="space-y-2">
              {semesters?.map(sem => (
                <div key={sem.id} className="flex justify-between p-2 border rounded">
                  <span className="font-medium">{sem.name}</span>
                  <span className="text-gray-600">{sem.startDate} to {sem.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AcademicCalendarMgmt;
