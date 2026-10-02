import { apiClient } from './client'

export async function getHealth() {
  try {
    const response = await apiClient.get('/health')
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}
