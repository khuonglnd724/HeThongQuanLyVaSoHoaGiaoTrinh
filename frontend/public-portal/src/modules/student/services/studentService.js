import apiClient from '../../../services/api/apiClient';

const SYLLABUS_API_BASE = '/api/syllabuses';

const studentAPI = {
  // Dashboard - mock data until backend implements student-service
  getDashboard: async () => {
    try {
      return await apiClient.get('/api/student/dashboard');
    } catch (err) {
      // Fallback to mock data if endpoint not available
      console.warn('[studentAPI] Dashboard endpoint not available, using mock data');
      return {
        data: {
          syllabiCount: 8,
          averageGrade: 7.8,
          progressPercent: 72
        }
      };
    }
  },
  
  // Enrolled Classes
  getEnrolledClasses: () => apiClient.get('/api/student/classes'),
  getClassDetails: (classId) => apiClient.get(`/api/student/classes/${classId}`),
  
  // Grades
  getGrades: () => apiClient.get('/api/student/grades'),
  getGradesByClass: (classId) => apiClient.get(`/api/student/classes/${classId}/grades`),
  
  // Syllabi
  getEnrolledSyllabi: () => apiClient.get('/api/student/syllabi'),
  getSyllabusDetails: (syllabusId) => apiClient.get(`/api/student/syllabi/${syllabusId}`),
  
  // Assignments
  getAssignments: () => apiClient.get('/api/student/assignments'),
  submitAssignment: (assignmentId, data) => 
    apiClient.post(`/api/student/assignments/${assignmentId}/submit`, data),
  
  // Schedule
  getSchedule: () => apiClient.get('/api/student/schedule'),
};

// ========== Follow Syllabus Functions ==========
// These functions interact with syllabus-service backend

/**
 * Follow a syllabus
 * @param {string} rootId - The root ID (UUID) of the syllabus to follow
 * @returns {Promise} API response
 */
export const followSyllabus = async (rootId) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.userId || user.id;
  
  if (!userId) {
    throw new Error('User not logged in');
  }
  
  return apiClient.post(`${SYLLABUS_API_BASE}/${rootId}/follow`, {}, {
    headers: { 'X-User-Id': String(userId) }
  });
};

/**
 * Unfollow a syllabus
 * @param {string} rootId - The root ID (UUID) of the syllabus to unfollow
 * @returns {Promise} API response
 */
export const unfollowSyllabus = async (rootId) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.userId || user.id;
  
  if (!userId) {
    throw new Error('User not logged in');
  }
  
  return apiClient.delete(`${SYLLABUS_API_BASE}/${rootId}/follow`, {
    headers: { 'X-User-Id': String(userId) }
  });
};

/**
 * Check if user is following a syllabus
 * @param {string} rootId - The root ID (UUID) of the syllabus
 * @returns {Promise<boolean>} true if following, false otherwise
 */
export const isFollowingSyllabus = async (rootId) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.userId || user.id;
  
  if (!userId) {
    return false;
  }
  
  try {
    const response = await apiClient.get(`${SYLLABUS_API_BASE}/${rootId}/is-following`, {
      headers: { 'X-User-Id': String(userId) }
    });
    return response.data === true || response.data === 'true';
  } catch (err) {
    console.warn('[studentAPI] Error checking follow status:', err);
    return false;
  }
};

/**
 * Get list of followers for a syllabus
 * @param {string} rootId - The root ID (UUID) of the syllabus
 * @returns {Promise} API response with followers list
 */
export const getSyllabusFollowers = async (rootId) => {
  return apiClient.get(`${SYLLABUS_API_BASE}/${rootId}/followers`);
};

/**
 * Get list of syllabuses that the current user is following
 * @returns {Promise<Array>} List of followed syllabuses
 */
export const getMyFollowedSyllabuses = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.userId || user.id;
  
  if (!userId) {
    console.warn('[studentAPI] User not logged in, returning empty array');
    return [];
  }
  
  try {
    const response = await apiClient.get(`${SYLLABUS_API_BASE}/my-followed`, {
      headers: { 'X-User-Id': String(userId) }
    });
    return response.data || [];
  } catch (err) {
    console.warn('[studentAPI] Error fetching followed syllabuses:', err);
    return [];
  }
};

export default studentAPI;
