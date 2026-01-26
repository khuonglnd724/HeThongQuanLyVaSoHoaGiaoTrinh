/**
 * File Upload Configuration
 * Matches backend validation rules
 */

export const FILE_CONFIG = {
  // Supported file extensions (must match backend ALLOWED_EXTENSIONS)
  ALLOWED_EXTENSIONS: ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'],
  
  // Maximum file size in bytes (50MB - must match backend)
  MAX_FILE_SIZE: 52428800,
  
  // Maximum file size in MB for display
  MAX_FILE_SIZE_MB: 50,
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'Vui lòng chọn tệp' }
  }

  // Check file size
  if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Dung lượng tệp vượt quá ${FILE_CONFIG.MAX_FILE_SIZE_MB}MB (Tệp của bạn: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
    }
  }

  // Check file extension
  const fileName = file.name.toLowerCase()
  const fileExt = fileName.split('.').pop()
  if (!FILE_CONFIG.ALLOWED_EXTENSIONS.includes(fileExt)) {
    return {
      isValid: false,
      error: `Định dạng tệp không được phép. Chỉ hỗ trợ: ${FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`
    }
  }

  return { isValid: true, error: null }
}

/**
 * Get file type icon
 * @param {string} extension - File extension
 * @returns {string} - Icon or label
 */
export const getFileTypeIcon = (extension) => {
  const ext = extension?.toLowerCase() || ''
  const icons = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '🎯',
    pptx: '🎯',
  }
  return icons[ext] || '📎'
}
