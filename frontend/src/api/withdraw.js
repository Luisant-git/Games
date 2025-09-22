import { API_BASE_URL } from "./config";

export const createWithdraw = async (withdrawData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/withdraws`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(withdrawData),
  });
  return response.json();
};

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getWithdrawHistory = async () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const decodedToken = decodeToken(token);
  if (!decodedToken) {
    throw new Error('Invalid token');
  }

  const userId = decodedToken.id;
  const userType = decodedToken.type;
  
  const endpoint = userType === 'agent' 
    ? `${API_BASE_URL}/withdraws/agent/${userId}`
    : `${API_BASE_URL}/withdraws/player/${userId}`;
    
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};