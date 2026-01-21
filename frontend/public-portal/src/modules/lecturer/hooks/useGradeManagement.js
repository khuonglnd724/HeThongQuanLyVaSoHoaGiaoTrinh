import { useState } from 'react';
import gradeService from '../services/gradeService';

export const useGradeManagement = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = async (classId) => {
    setLoading(true);
    try {
      const data = await gradeService.getStudents(classId);
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitGrades = async (classId, gradesData) => {
    setLoading(true);
    try {
      await gradeService.submitGrades(classId, gradesData);
      setGrades(gradesData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { students, grades, loading, error, fetchStudents, submitGrades };
};
