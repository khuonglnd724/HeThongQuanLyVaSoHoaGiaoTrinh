import { useEffect, useState } from 'react';
import monitoringService from '../services/monitoringService';

export const useRealTimeMonitoring = () => {
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonitoring = async () => {
      try {
        const [statusData, metricsData] = await Promise.all([
          monitoringService.getServerStatus(),
          monitoringService.getMetrics('1h'),
        ]);
        setStatus(statusData);
        setMetrics(metricsData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoring();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMonitoring, 30000);
    return () => clearInterval(interval);
  }, []);

  return { status, metrics, loading, error };
};
