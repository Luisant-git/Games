import { API_BASE_URL } from './config';

export const getBankAccounts = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/bank-accounts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

export const createBankAccount = async (bankAccountData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/bank-accounts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bankAccountData),
  });
  return response.json();
};

export const setDefaultBankAccount = async (accountId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/bank-accounts/${accountId}/default`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

export const deleteBankAccount = async (accountId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/bank-accounts/${accountId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};