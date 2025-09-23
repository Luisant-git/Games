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

export const createResult = async (resultData) => {
  const response = await fetch(`${API_BASE_URL}/results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resultData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create result');
  }
  
  return response.json();
};

export const publishResult = async (id) => {
  const response = await fetch(`${API_BASE_URL}/results/publish/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to publish result');
  }
  
  return response.json();
};