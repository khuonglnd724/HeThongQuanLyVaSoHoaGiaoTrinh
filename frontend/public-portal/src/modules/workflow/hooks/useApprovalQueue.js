import { useEffect, useState } from 'react';
import approvalService from '../services/approvalService';

export const useApprovalQueue = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApprovals = async (filter) => {
    setLoading(true);
    try {
      const data = await approvalService.getApprovals(filter);
      setApprovals(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals({});
  }, []);

  return { approvals, loading, error, fetchApprovals };
};
