// Utility functions for API calls with error handling
export const handleApiError = (error, defaultMessage = 'Có lỗi xảy ra') => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || defaultMessage
  } else if (error.request) {
    // Request made but no response
    return 'Không thể kết nối đến server'
  } else {
    // Error in request setup
    return error.message || defaultMessage
  }
}

export const formatSearchResults = (data) => {
  return {
    items: data.content || [],
    total: data.totalElements || 0,
    page: data.number || 0,
    size: data.size || 20,
    hasMore: !data.last,
  }
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
