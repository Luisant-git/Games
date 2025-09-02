import { API_BASE_URL } from './config'

export const categoryAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/category`)
    return response.json()
  },

  create: async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    })
    return response.json()
  },

  update: async (id, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/category/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    })
    return response.json()
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/category/${id}`, {
      method: 'DELETE'
    })
    return response.json()
  }
}