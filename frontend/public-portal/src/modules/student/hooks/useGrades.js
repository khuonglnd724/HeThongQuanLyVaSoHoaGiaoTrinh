import { useEffect, useState } from 'react';
import studentService from '../services/studentService';

export const useGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const data = await studentService.getGrades();
        setGrades(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return { grades, loading, error };
};
