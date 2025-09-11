import { API_BASE_URL } from './config.js';

export const getResults = async () => {
  const response = await fetch(`${API_BASE_URL}/results`, {
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