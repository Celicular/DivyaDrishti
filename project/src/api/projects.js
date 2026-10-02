import { apiClient } from './client'

export async function getProjects() {
  try {
    const response = await apiClient.get('/projects')
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to load projects'
    return { success: false, error: message, data: [] }
  }
}

export async function createProject(projectData) {
  try {
    const response = await apiClient.post('/projects', projectData)
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to create project'
    return { success: false, error: message }
  }
}

export async function getProjectById(projectId) {
  try {
    const response = await apiClient.get(`/projects/${projectId}`)
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to retrieve project details'
    return { success: false, error: message }
  }
}

export async function updateProject(projectId, projectData) {
  try {
    const response = await apiClient.put(`/projects/${projectId}`, projectData)
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to update project'
    return { success: false, error: message }
  }
}

export async function deleteProject(projectId) {
  try {
    const response = await apiClient.delete(`/projects/${projectId}`)
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to remove project'
    return { success: false, error: message }
  }
}
