import { useEffect, useState } from 'react';
import syllabusApprovalService from '../services/syllabusApprovalService';

export const useSyllabusApproval = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSyllabi = async (filter) => {
    setLoading(true);
    try {
      const data = await syllabusApprovalService.getRequests(filter);
      setSyllabi(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabi({});
  }, []);

  return { syllabi, loading, error, fetchSyllabi };
};
