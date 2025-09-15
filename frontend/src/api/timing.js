import { API_BASE_URL } from './config'

export const timingAPI = {
  getTodayShowTimes: async () => {
    const response = await fetch(`${API_BASE_URL}/timing/today`)
    return response.json()
  }
}