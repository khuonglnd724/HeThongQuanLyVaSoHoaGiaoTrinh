import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import studentService from '../services/studentService';

export const useStudentDashboard = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await studentService.getDashboard();
        // TODO: Dispatch to Redux store
        console.log('Dashboard data:', data);
      } catch (error) {
        console.error('Failed to fetch student dashboard:', error);
      }
    };

    fetchDashboard();
  }, [dispatch]);

  return {
    loading: false,
    error: null,
  };
};
