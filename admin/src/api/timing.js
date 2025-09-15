import { API_BASE_URL } from './config'

export const timingAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/timing`)
    return response.json()
  },

  getTodayShowTimes: async () => {
    const response = await fetch(`${API_BASE_URL}/timing/today`)
    return response.json()
  },

  create: async (timingData) => {
    const response = await fetch(`${API_BASE_URL}/timing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timingData)
    })
    return response.json()
  },

  update: async (id, timingData) => {
    const response = await fetch(`${API_BASE_URL}/timing/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timingData)
    })
    return response.json()
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/timing/${id}`, {
      method: 'DELETE'
    })
    return response.json()
  }
}