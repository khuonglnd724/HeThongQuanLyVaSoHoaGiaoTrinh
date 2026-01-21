import { useEffect, useState } from 'react';
import classService from '../services/classService';

export const useClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.getMyClasses();
        setClasses(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  return { classes, loading, error, setClasses };
};
