import { useEffect, useState } from 'react';
import userManagementService from '../services/userManagementService';

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async (filter) => {
    setLoading(true);
    try {
      const data = await userManagementService.getAllUsers(filter);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers({});
  }, []);

  return { users, loading, error, fetchUsers, setUsers };
};
