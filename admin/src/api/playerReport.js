import { API_BASE_URL } from "./config";

export const getPlayerReport = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/player-report?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return response.json();
};

export const getPlayerGameDetails = async (playerId, categoryId, showtimeId, date) => {
  const params = new URLSearchParams({
    playerId,
    categoryId,
    showtimeId,
    date,
  });

  const response = await fetch(`${API_BASE_URL}/player-report/details?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return response.json();
};
