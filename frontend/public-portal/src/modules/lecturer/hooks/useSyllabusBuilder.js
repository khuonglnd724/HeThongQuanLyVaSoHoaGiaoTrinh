import { useState } from 'react';
import syllabusService from '../services/syllabusService';

export const useSyllabusBuilder = () => {
  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const createSyllabus = async (data) => {
    setLoading(true);
    try {
      const result = await syllabusService.create(data);
      setSyllabus(result);
      setIsSaved(true);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSyllabus = async (id, data) => {
    setLoading(true);
    try {
      const result = await syllabusService.update(id, data);
      setSyllabus(result);
      setIsSaved(true);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async (id) => {
    setLoading(true);
    try {
      await syllabusService.submit(id);
      setIsSaved(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { syllabus, loading, error, isSaved, createSyllabus, updateSyllabus, submitForApproval };
};
