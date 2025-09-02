import { API_BASE_URL } from './config'

export const playerAPI = {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/player/all`)
      return response.json()
  },
}