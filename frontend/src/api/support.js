import { API_BASE_URL } from './config.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const createSupportTicket = async (ticketData) => {
  const token = localStorage.getItem('token');
  
  // If there's an image, upload it first
  let imageUrl = null;
  if (ticketData.image) {
    const formData = new FormData();
    formData.append('image', ticketData.image);
    
    const uploadResponse = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      imageUrl = uploadResult.url;
    }
  }
  
  const response = await fetch(`${API_BASE_URL}/support`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      subject: ticketData.subject,
      message: ticketData.message,
      image: imageUrl
    })
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