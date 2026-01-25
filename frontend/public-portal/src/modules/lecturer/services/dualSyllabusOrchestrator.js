/**
 * Dual-Database Syllabus Creation Orchestrator
 * Quản lý tạo Syllabus đồng thời ở cả academic_db và syllabus_db
 */

import apiClient from '../../../services/api/apiClient'

const ACADEMIC_API_BASE = '/api/v1'
const SYLLABUS_API_BASE = '/api/syllabuses'

const dualSyllabusOrchestrator = {
  /**
   * Tạo Syllabus ở cả 2 database
   * 1. Tạo ở academic-service (academic_db)
   * 2. Tạo ở syllabus-service (syllabus_db)
   * 3. Link CLO ở academic-service
   */
  createDualSyllabus: async (formData, userId) => {
    console.log('[Orchestrator] Starting dual syllabus creation', {
      syllabusCode: formData.syllabusCode,
      subjectId: formData.subjectId,
      cloIds: formData.cloPairIds?.length || 0
    })

    try {
      // ========== Step 1: Create ở academic-service ==========
      const academicPayload = {
        syllabusCode: formData.syllabusCode,
        subjectId: formData.subjectId,
        version: formData.version || 1,
        academicYear: formData.academicYear,
        semester: formData.semester,
        content: formData.content || '',
        learningObjectives: formData.learningObjectives || '',
        teachingMethods: formData.teachingMethods || '',
        assessmentMethods: formData.assessmentMethods || '',
        status: 'Draft',
        approvalStatus: 'Pending'
      }

      console.log('[Orchestrator] Creating in academic-service...')
      const academicRes = await apiClient.post(
        `${ACADEMIC_API_BASE}/syllabus`,
        academicPayload
      )
      const academicSyllabusId = academicRes.data.id

      console.log('[Orchestrator] Academic syllabus created:', academicSyllabusId)

      // ========== Step 2: Create ở syllabus-service ==========
      const syllabusPayload = {
        syllabusCode: formData.syllabusCode,
        subjectCode: formData.subjectCode || '',
        subjectName: formData.subjectName || '',
        summary: formData.summary || '',
        content: {
          syllabusCode: formData.syllabusCode,
          subjectCode: formData.subjectCode,
          subjectId: formData.subjectId,
          academicYear: formData.academicYear,
          semester: formData.semester,
          learningObjectives: formData.learningObjectives || '',
          teachingMethods: formData.teachingMethods || '',
          assessmentMethods: formData.assessmentMethods || '',
          cloPairIds: formData.cloPairIds || [],
          modules: formData.modules || []
        }
      }

      console.log('[Orchestrator] Creating in syllabus-service...')
      const syllabusRes = await apiClient.post(
        SYLLABUS_API_BASE,
        syllabusPayload,
        { headers: { 'X-User-Id': userId } }
      )
      const syllabusServiceId = syllabusRes.data.id

      console.log('[Orchestrator] Syllabus-service created:', syllabusServiceId)

      // ========== Step 3: Link CLO ở academic-service ==========
      console.log('[Orchestrator] Step 3 - CLO info:', {
        syllabusServiceId,
        syllabusServiceIdType: typeof syllabusServiceId,
        cloPairIds: formData.cloPairIds,
        hasCloPairIds: formData.cloPairIds && formData.cloPairIds.length > 0
      })
      
      if (!syllabusServiceId) {
        console.error('[Orchestrator] ERROR: syllabusServiceId is undefined!')
        throw new Error('syllabusServiceId is undefined after step 2')
      }
      
      if (formData.cloPairIds && formData.cloPairIds.length > 0) {
        console.log('[Orchestrator] Linking CLOs:', formData.cloPairIds, 'to syllabus:', syllabusServiceId)
        const linkPayload = { cloIds: formData.cloPairIds }
        console.log('[Orchestrator] Link payload:', linkPayload)
        
        const linkUrl = `${ACADEMIC_API_BASE}/clo/syllabuses/${syllabusServiceId}/link-clos`
        console.log('[Orchestrator] Link URL:', linkUrl)
        
        const linkRes = await apiClient.post(linkUrl, linkPayload)
        console.log('[Orchestrator] CLOs linked successfully, response:', linkRes)
      } else {
        console.warn('[Orchestrator] No CLOs to link')
      }

      // ========== Return combined result ==========
      const result = {
        id: syllabusServiceId,  // Primary ID cho syllabus-service
        academicId: academicSyllabusId,  // Secondary ID cho academic-service
        rootId: syllabusRes.data.rootId,
        status: syllabusRes.data.status,
        createdAt: syllabusRes.data.createdAt,
        cloPairIds: formData.cloPairIds || []
      }

      console.log('[Orchestrator] Dual creation successful:', result)
      return result

    } catch (error) {
      console.error('[Orchestrator] Error during dual creation:', error)
      throw new Error(
        `Failed to create syllabus: ${error.response?.data?.message || error.message}`
      )
    }
  },

  /**
   * Update Syllabus ở cả 2 database (tạo version mới)
   * NOTE: academicSyllabusId parameter deprecated (not used in new architecture)
   */
  updateDualSyllabusVersion: async (
    rootId,
    academicSyllabusId,  // DEPRECATED: kept for backward compatibility
    syllabusServiceId,
    formData,
    userId
  ) => {
    console.log('[Orchestrator] Starting dual syllabus update', {
      rootId,
      syllabusServiceId,
      cloIds: formData.cloPairIds?.length || 0,
      deprecatedAcademicId: academicSyllabusId  // Log for debugging
    })

    try {
      // ========== SKIP Step 1: Academic-service update (not used in new architecture) ==========
      // Architecture changed: Syllabi now stored only in syllabus-service
      console.log('[Orchestrator] Skipping academic-service update (deprecated)')

      // ========== Step 2: Create new version ở syllabus-service ==========
      const versionPayload = {
        content: {
          syllabusCode: formData.syllabusCode,
          subjectCode: formData.subjectCode,
          subjectId: formData.subjectId,
          academicYear: formData.academicYear,
          semester: formData.semester,
          learningObjectives: formData.learningObjectives || '',
          teachingMethods: formData.teachingMethods || '',
          assessmentMethods: formData.assessmentMethods || '',
          cloPairIds: formData.cloPairIds || [],
          modules: formData.modules || []
        },
        changes: formData.changes || ''
      }

      console.log('[Orchestrator] Creating new version in syllabus-service...')
      const syllabusRes = await apiClient.post(
        `${SYLLABUS_API_BASE}/${rootId}/versions`,
        versionPayload,
        { headers: { 'X-User-Id': userId } }
      )
      console.log('[Orchestrator] New version created')

      // ========== Step 3: Update CLO links ==========
      if (formData.cloPairIds && formData.cloPairIds.length > 0) {
        console.log('[Orchestrator] Updating CLO links...')
        // Unlink cũ
        await apiClient.delete(
          `${ACADEMIC_API_BASE}/clo/syllabuses/${syllabusServiceId}`
        )
        // Link mới
        await apiClient.post(
          `${ACADEMIC_API_BASE}/clo/syllabuses/${syllabusServiceId}/link-clos`,
          { cloIds: formData.cloPairIds }
        )
        console.log('[Orchestrator] CLO links updated')
      }

      const result = {
        id: syllabusRes.data.id,
        academicId: syllabusRes.data.id,  // Use syllabus-service ID (no separate academic ID in new architecture)
        rootId: syllabusRes.data.rootId,
        versionNo: syllabusRes.data.versionNo,
        status: syllabusRes.data.status
      }

      console.log('[Orchestrator] Dual update successful:', result)
      return result

    } catch (error) {
      console.error('[Orchestrator] Error during dual update:', error)
      throw new Error(
        `Failed to update syllabus: ${error.response?.data?.message || error.message}`
      )
    }
  },

  /**
   * Update Syllabus PARTIAL - chỉ update documents, không tạo version mới
   * Dùng khi status khác DRAFT/REJECTED
   */
  updateDualSyllabusPartial: async (syllabusServiceId, formData, userId) => {
    console.log('[Orchestrator] Starting partial syllabus update', {
      syllabusServiceId,
      hasModules: formData.modules?.length || 0
    })

    try {
      // Chỉ update nội dung cơ bản và modules (documents)
      const contentObj = {
        syllabusCode: formData.syllabusCode,
        subjectCode: formData.subjectCode,
        subjectId: formData.subjectId,
        academicYear: formData.academicYear,
        semester: formData.semester,
        learningObjectives: formData.learningObjectives || '',
        teachingMethods: formData.teachingMethods || '',
        assessmentMethods: formData.assessmentMethods || '',
        cloPairIds: formData.cloPairIds || [],
        modules: formData.modules || []
      }
      
      const updatePayload = {
        summary: formData.summary || '',
        content: JSON.stringify(contentObj)  // Convert to JSON string for backend
      }

      console.log('[Orchestrator] Updating in syllabus-service (no version change)...')
      console.log('[Orchestrator] Payload:', updatePayload)
      const syllabusRes = await apiClient.put(
        `${SYLLABUS_API_BASE}/${syllabusServiceId}`,
        updatePayload,
        { headers: { 'X-User-Id': userId } }
      )
      console.log('[Orchestrator] Partial update successful')

      const result = {
        id: syllabusRes.data.id,
        status: syllabusRes.data.status,
        versionNo: syllabusRes.data.versionNo
      }

      console.log('[Orchestrator] Partial update result:', result)
      return result

    } catch (error) {
      console.error('[Orchestrator] Error during partial update:', error)
      console.error('[Orchestrator] Error response:', error.response?.data)
      console.error('[Orchestrator] Error status:', error.response?.status)
      
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || 'Unexpected server error'
      
      throw new Error(`Failed to update syllabus: ${errorMsg}`)
    }
  }
}

export default dualSyllabusOrchestrator
