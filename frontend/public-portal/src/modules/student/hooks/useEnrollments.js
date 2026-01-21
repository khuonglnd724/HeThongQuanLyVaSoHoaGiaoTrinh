import { useEffect, useState } from 'react';
import studentService from '../services/studentService';

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const data = await studentService.getEnrolledClasses();
        setEnrollments(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return { enrollments, loading, error };
};
