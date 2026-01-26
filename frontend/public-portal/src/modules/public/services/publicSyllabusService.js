// Public Syllabus Service - cho Student/Guest users
// Ưu tiên dữ liệu thật từ academic-service

const API_BASE = '/api/v1/syllabus'

// Mock data fallback (giữ lại nhưng ưu tiên dữ liệu thật)
const MOCK_SYLLABUS_DETAIL = {
  id: 'ba59f0be-bdf3-4ab1-8863-abbdce35348b',
  subject_code: 'CS-01',
  subject_name: 'Lập trình',
  summary: 'Giáo trình về lập trình cơ bản và nâng cao với các ứng dụng thực tế',
  credits: 3,
  semester: 'Kỳ I',
  academic_year: '2024-2025',
  major: 'Công Nghệ Thông Tin',
  status: 'PUBLISHED',
  version_no: 1,
  created_at: '2026-01-25T04:42:47.183413Z',
  created_by: 'lecturer1@smd.edu.vn',
  description: 'Giáo trình lập trình hướng đối tượng với Java, bao gồm các khái niệm cơ bản, thiết kế mẫu, và ứng dụng thực tế',
  content: 'Nội dung chi tiết của giáo trình...'
}

const MOCK_CLO_PLO = {
  clos: [
    { id: 1, code: 'CLO1', description: 'Hiểu được các khái niệm cơ bản của lập trình OOP' },
    { id: 2, code: 'CLO2', description: 'Có thể thiết kế và phát triển ứng dụng Java' }
  ],
  plos: [
    { id: 1, code: 'PLO1', description: 'Nắm vững kiến thức về kỹ thuật phần mềm' }
  ],
  mappings: [
    { clo_id: 1, plo_id: 1 },
    { clo_id: 2, plo_id: 1 }
  ]
}

const MOCK_AI_SUMMARY = {
  summary: 'Giáo trình này cung cấp nền tảng vững chắc về lập trình hướng đối tượng với Java. Sinh viên sẽ học được các khái niệm như class, inheritance, polymorphism, và cách áp dụng chúng vào các dự án thực tế.',
  key_concepts: ['OOP', 'Java', 'Class', 'Inheritance', 'Polymorphism'],
  learning_outcomes: ['Thiết kế ứng dụng', 'Hiểu OOP', 'Phát triển phần mềm'],
  difficulty_level: 'Medium'
}

const MOCK_RELATIONSHIPS = {
  prerequisites: [],
  corequisites: [],
  parallel: []
}

export async function getPublishedSyllabi() {
  try {
    const response = await fetch(`${API_BASE}/published`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    // academic-service wraps in { success, data }
    return Array.isArray(payload?.data) ? payload.data : payload
  } catch (error) {
    console.warn('Backend not available, using mock data:', error.message)
    return [MOCK_SYLLABUS_DETAIL]
  }
}

export async function getSyllabusDetail(syllabusId) {
  try {
    const response = await fetch(`${API_BASE}/${syllabusId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    return payload?.data || payload
  } catch (error) {
    console.warn('Backend not available, using mock data:', error.message)
    if (syllabusId === 'ba59f0be-bdf3-4ab1-8863-abbdce35348b') {
      return MOCK_SYLLABUS_DETAIL
    }
    throw error
  }
}

// Backends chưa cung cấp mapping công khai -> trả rỗng để tránh 404
export async function getCLOPLOMapping() {
  return { clos: [], plos: [], mappings: [] }
}

// Chưa có AI summary public -> trả null để UI ẩn box
export async function getAISummary() {
  return null
}

// Chưa có endpoint relationships public -> trả rỗng để tránh 404
export async function getSubjectRelationships() {
  return { prerequisites: [], corequisites: [], parallel: [] }
}

export async function subscribeSyllabus(syllabusId, email = '') {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/syllabi/${syllabusId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.warn('Backend not available, using mock response:', error.message)
    // Return mock success response
    return {
      success: true,
      message: 'Đã theo dõi giáo trình thành công',
      data: {
        id: syllabusId,
        subscribed: true,
        subscribedAt: new Date().toISOString()
      }
    }
  }
}

export async function unsubscribeSyllabus(syllabusId) {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/syllabi/${syllabusId}/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.warn('Backend not available, using mock response:', error.message)
    // Return mock success response
    return {
      success: true,
      message: 'Đã hủy theo dõi giáo trình thành công',
      data: {
        id: syllabusId,
        subscribed: false,
        unsubscribedAt: new Date().toISOString()
      }
    }
  }
}

export async function submitFeedback(feedback) {
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedback)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Lỗi gửi phản hồi:', error)
    throw error
  }
}
