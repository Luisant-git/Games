import { API_BASE_URL } from './config';

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/category`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
