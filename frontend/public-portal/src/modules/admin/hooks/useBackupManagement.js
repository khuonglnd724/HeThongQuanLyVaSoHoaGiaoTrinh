import { useEffect, useState } from 'react';
import backupService from '../services/backupService';

export const useBackupManagement = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBackups = async () => {
    try {
      const data = await backupService.getBackups();
      setBackups(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const createBackup = async () => {
    try {
      await backupService.createBackup();
      await fetchBackups();
    } catch (err) {
      setError(err.message);
    }
  };

  return { backups, loading, error, fetchBackups, createBackup };
};
