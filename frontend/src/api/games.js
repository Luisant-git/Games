import { API_BASE_URL } from './config';

export const getGames = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/games`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response;
};

export const playGame = async (gameData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/games/play`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameData),
  });
  return response;
};

export const getPlayerGameHistory = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/games/history/player`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response;
};

export const getGame = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/games/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response;
};