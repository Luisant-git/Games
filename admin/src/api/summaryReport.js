import { API_BASE_URL } from "./config";

export const getSummaryReport = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/summary-report?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return response.json();
};

export const getAgentReport = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/summary-report/agent?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return response.json();
};

export const getWinningResult = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/summary-report/winning?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return response.json();
};
