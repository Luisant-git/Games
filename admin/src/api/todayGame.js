import { API_BASE_URL } from './config.js';

export const todayGameAPI = {
  getTimings: async () => {
    const response = await fetch(`${API_BASE_URL}/timing`);
    if (!response.ok) throw new Error('Failed to fetch timings');
    return response.json();
  },

  getGameHistoryByShowTime: async (showTime) => {
    const encodedShowTime = encodeURIComponent(showTime);
    const response = await fetch(`${API_BASE_URL}/game-history/today/${encodedShowTime}`);
    if (!response.ok) throw new Error('Failed to fetch game history');
    return response.json();
  },

  analyzeOptimalResult: async (showTime) => {
    const encodedShowTime = encodeURIComponent(showTime);
    const response = await fetch(`${API_BASE_URL}/results/analyze/${encodedShowTime}`);
    if (!response.ok) throw new Error('Failed to analyze result');
    return response.json();
  }
};