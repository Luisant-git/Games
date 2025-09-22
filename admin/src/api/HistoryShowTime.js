import { API_BASE_URL } from "./config";

export const getHistoryShowTime = async () => {
  const response = await fetch(`${API_BASE_URL}/game-history/history-show-time`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch results');
  }
  
  return response.json();
};