import { API_BASE_URL } from './config.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const createSupportTicket = async (ticketData) => {
  const response = await fetch(`${API_BASE_URL}/support`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(ticketData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create support ticket');
  }
  
  return response.json();
};

export const getSupportTickets = async () => {
  const response = await fetch(`${API_BASE_URL}/support`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch support tickets');
  }
  
  return response.json();
};