import { apiClient } from './client'

const serverOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

export function getMediaUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${serverOrigin}${path.startsWith('/') ? '' : '/'}${path}`
}

export async function uploadImage(projectId, file, displayName, isGrouped = false, onProgress = null) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('display_name', displayName)
    formData.append('is_grouped', isGrouped ? 'true' : 'false')

    const response = await apiClient.post(`/projects/${projectId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to upload image'
    return { success: false, error: message }
  }
}

export async function getProjectImages(projectId) {
  try {
    const response = await apiClient.get(`/projects/${projectId}/images`)
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to fetch project media'
    return { success: false, error: message, data: [] }
  }
}

export async function getImageDetails(projectId, imageId) {
  try {
    const response = await apiClient.get(`/projects/${projectId}/images/${imageId}`)
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to fetch image details'
    return { success: false, error: message }
  }
}

export async function updateImageDisplayName(projectId, imageId, displayName) {
  try {
    const response = await apiClient.put(`/projects/${projectId}/images/${imageId}`, {
      display_name: displayName
    })
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to update image name'
    return { success: false, error: message }
  }
}

export async function deleteImage(projectId, imageId) {
  try {
    const response = await apiClient.delete(`/projects/${projectId}/images/${imageId}`)
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to delete image'
    return { success: false, error: message }
  }
}

export async function batchUpdateImages(projectId, imageIds, displayName) {
  try {
    const response = await apiClient.post(`/projects/${projectId}/images/batch-update`, {
      image_ids: imageIds,
      display_name: displayName
    })
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to batch update image names'
    return { success: false, error: message }
  }
}

export async function batchDeleteImages(projectId, imageIds) {
  try {
    const response = await apiClient.post(`/projects/${projectId}/images/batch-delete`, {
      image_ids: imageIds
    })
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to batch delete images'
    return { success: false, error: message }
  }
}

export async function batchReindexImages(projectId, imageIds) {
  try {
    const response = await apiClient.post(`/projects/${projectId}/images/batch-reindex`, {
      image_ids: imageIds
    })
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to batch reindex images'
    return { success: false, error: message }
  }
}

export async function reverseGeocode(latitude, longitude) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return { success: false, error: 'Invalid coordinates' }
  }
  try {
    const response = await apiClient.get('/geo/reverse', {
      params: { latitude, longitude }
    })
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to reverse geocode'
    return { success: false, error: message }
  }
}

export async function getIndexingStatus(projectId) {
  try {
    const response = await apiClient.get(`/projects/${projectId}/indexing/status`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Failed to fetch indexing status'
    return { success: false, error: message }
  }
}

export async function forceIndexImage(projectId, imageId) {
  try {
    const response = await apiClient.post(`/projects/${projectId}/images/${imageId}/force-index`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Failed to force index image'
    return { success: false, error: message }
  }
}

export async function getImageAiData(projectId, imageId) {
  try {
    const response = await apiClient.get(`/projects/${projectId}/images/${imageId}/ai`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Failed to fetch AI data'
    return { success: false, error: message }
  }
}

export async function searchExplore(searchPayload, abortSignal = null) {
  try {
    const response = await apiClient.post('/search/explore', searchPayload, {
      signal: abortSignal
    })
    return { success: true, data: response.data }
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return { success: false, isCanceled: true }
    }
    const message = error.response?.data?.detail || error.message || 'Failed to search media'
    return { success: false, error: message }
  }
}

export async function batchReindexCrossProject(imageIds) {
  try {
    const response = await apiClient.post('/media/batch-reindex', {
      image_ids: imageIds
    })
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Failed to batch reindex images'
    return { success: false, error: message }
  }
}
