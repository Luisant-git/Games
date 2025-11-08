import { API_BASE_URL } from "./config";

export const getOrderReport = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/order-report?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return response.json();
};

export const getWhatsAppFormat = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/order-report/whatsapp?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return response.json();
};

export const getShowtimes = async () => {
  const response = await fetch(`${API_BASE_URL}/order-report/showtimes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return response.json();
};
