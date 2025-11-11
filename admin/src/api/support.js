import { API_BASE_URL } from './config'

export const getAllSupport = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/support/admin/all?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error('Failed to fetch support tickets')
  return response.json()
}

export const updateSupportStatus = async (id, status) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/support/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error('Failed to update status')
  return response.json()
}
