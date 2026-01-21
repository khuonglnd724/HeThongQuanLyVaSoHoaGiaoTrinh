import { useEffect, useState } from 'react';
import systemService from '../services/systemService';

export const useSystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await systemService.getHealthCheck();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return { health, loading, error };
};
