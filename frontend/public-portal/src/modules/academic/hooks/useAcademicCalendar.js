import { useEffect, useState } from 'react';
import academicCalendarService from '../services/academicCalendarService';

export const useAcademicCalendar = () => {
  const [calendar, setCalendar] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const [cal, sems] = await Promise.all([
          academicCalendarService.getCalendar(),
          academicCalendarService.getSemesters(),
        ]);
        setCalendar(cal);
        setSemesters(sems);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  return { calendar, semesters, loading, error, setCalendar };
};
