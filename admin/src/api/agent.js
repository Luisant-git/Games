import { API_BASE_URL } from './config'

export const agentAPI = {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/agent/all`)
      return response.json()
  },
  create: async (agentData) => {
    const response = await fetch(`${API_BASE_URL}/agent/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create agent')
    }
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
  togglePlayPermission: async (id) => {
    const response = await fetch(`${API_BASE_URL}/agent/${id}/toggle-play`, {
      method: 'PATCH',
    })
    return response.json()
  },
  getAgentGameHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/game-history/agents`)
    return response.json()
  },
  getAgentGameHistoryById: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/game-history/agent/${agentId}`)
    return response.json()
  },
}