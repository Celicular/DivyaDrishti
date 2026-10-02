import { apiClient } from './client'
import { setCookie, getCookie, removeCookie } from './cookies'

export const DEMO_ACCOUNTS = [
  {
    username: 'field_lead',
    label: 'Field Auditor',
    name: 'Aarav Sharma',
    role: 'field_auditor',
    password: 'Demo@2026',
    color: '#006b49'
  },
  {
    username: 'ngo_director',
    label: 'NGO Lead',
    name: 'Priya Patel',
    role: 'ngo_lead',
    password: 'Demo@2026',
    color: '#6754dc'
  },
  {
    username: 'govt_inspector',
    label: 'Govt Mission',
    name: 'Rajesh Verma',
    role: 'govt_mission',
    password: 'Demo@2026',
    color: '#188f70'
  },
  {
    username: 'esg_analyst',
    label: 'Sustainability',
    name: 'Ananya Iyer',
    role: 'sustainability',
    password: 'Demo@2026',
    color: '#3d4a3e'
  },
  {
    username: 'donor_partner',
    label: 'CSR Partner',
    name: 'Vikram Malhotra',
    role: 'donor_csr',
    password: 'Demo@2026',
    color: '#292c29'
  }
]

export async function login(usernameOrEmail, password) {
  try {
    const response = await apiClient.post('/login', {
      username_or_email: usernameOrEmail,
      password: password
    })

    const { access_token, user } = response.data

    setCookie('ddrishti_token', access_token, 7)
    setCookie('ddrishti_user', JSON.stringify(user), 7)

    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Unable to sign in. Please verify your credentials.'
    return { success: false, error: message }
  }
}

export async function getProfile() {
  try {
    const response = await apiClient.get('/auth/me')
    setCookie('ddrishti_user', JSON.stringify(response.data), 7)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}

export function getCurrentUser() {
  const raw = getCookie('ddrishti_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getAuthToken() {
  return getCookie('ddrishti_token')
}

export function logout() {
  removeCookie('ddrishti_token')
  removeCookie('ddrishti_user')
}
