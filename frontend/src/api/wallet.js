import { API_BASE_URL } from './config';

export const getPlayerWallet = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/player/wallet`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response;
};

export const getAgentWallet = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/agent/wallet`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response;
};