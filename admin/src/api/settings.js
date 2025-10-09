import { API_BASE_URL } from './config';

export const getSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/settings`);
  return response.json();
};

export const updateSettings = async (data) => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};