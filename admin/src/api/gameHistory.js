import { API_BASE_URL } from "./config";

export const getGameHistory = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/game-history?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return response.json();
};