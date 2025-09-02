import { API_BASE_URL } from "./config";

export const createDeposit = async (depositData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/deposits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(depositData),
  });
  return response.json();
};

export const getDepositHistory = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/deposits/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
