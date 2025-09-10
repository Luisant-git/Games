import { API_BASE_URL } from './config';

export const changePassword = async (passwordData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/player/change-password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwordData),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to change password');
  }
  return data;
};