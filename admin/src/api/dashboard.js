import { API_BASE_URL } from "./config";

export const getDashboardMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/metrics`, {
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