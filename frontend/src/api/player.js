import { API_BASE_URL } from './config';

export const changePassword = async (passwordData) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const endpoint = userType === 'agent' ? '/agent/change-password' : '/player/change-password';
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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