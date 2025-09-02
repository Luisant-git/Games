import { API_BASE_URL } from './config'

export const agentAPI = {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/agent/all`)
      return response.json()
  },
  toggleStatus: async (id) => {
    const response = await fetch(`${API_BASE_URL}/agent/${id}/toggle-status`, {
      method: 'PATCH',
    })
    return response.json()
  },
  getCommissions: async (id) => {
    const response = await fetch(`${API_BASE_URL}/agent/${id}/commissions`)
    return response.json()
  },
  updateCommission: async (agentId, gameId, commissionRate) => {
    const response = await fetch(`${API_BASE_URL}/agent/${agentId}/commission/${gameId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commissionRate }),
    })
    return response.json()
  },
}