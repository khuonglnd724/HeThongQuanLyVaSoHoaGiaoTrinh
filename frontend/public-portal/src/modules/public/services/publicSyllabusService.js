// Public Syllabus Service - cho Student/Guest users
// Chỉ lấy PUBLISHED syllabi

export async function getPublishedSyllabi(page = 0, size = 10, searchTerm = '') {
  try {
    const query = new URLSearchParams({
      page,
      size,
      status: 'PUBLISHED',
      ...(searchTerm && { search: searchTerm })
    })

    const response = await fetch(`/api/syllabi/public?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Lỗi lấy syllabi:', error)
    throw error
  }
}

export async function getSyllabusDetail(syllabusId) {
  try {
    const response = await fetch(`/api/syllabi/${syllabusId}/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Lỗi lấy chi tiết syllabus:', error)
    throw error
  }
}

export async function getCLOPLOMapping(syllabusId) {
  try {
    const response = await fetch(`/api/syllabi/${syllabusId}/clo-plo-mapping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Lỗi lấy CLO-PLO mapping:', error)
    throw error
  }
}

export async function getAISummary(syllabusId) {
  try {
    const response = await fetch(`/api/syllabi/${syllabusId}/ai-summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Lỗi lấy AI summary:', error)
    return null
  }
}

export async function getSubjectRelationships(subjectId) {
  try {
    const response = await fetch(`/api/subjects/${subjectId}/relationships`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Lỗi lấy quan hệ môn học:', error)
    return { prerequisites: [], corequisites: [], parallel: [] }
  }
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
    console.error('Lỗi đăng ký theo dõi:', error)
    throw error
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
    console.error('Lỗi hủy theo dõi:', error)
    throw error
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
