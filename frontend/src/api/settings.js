import { API_BASE_URL } from './config';

export const getSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/settings`);
  return response.json();
};