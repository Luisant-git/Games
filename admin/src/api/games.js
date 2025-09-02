import { API_BASE_URL } from './config'

export const gamesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/games`)
    return response.json()
  },

  create: async (gameData) => {
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData)
    })
    return response.json()
  },

  update: async (id, gameData) => {
    const response = await fetch(`${API_BASE_URL}/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData)
    })
    return response.json()
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/games/${id}`, {
      method: 'DELETE'
    })
    return response.json()
  },

  toggleActive: async (id) => {
    const response = await fetch(`${API_BASE_URL}/games/${id}/toggle-active`, {
      method: 'PUT'
    })
    return response.json()
  }
}