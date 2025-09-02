import { API_BASE_URL } from './config'

export const productsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/products`)
    return response.json()
  },

  create: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
    return response.json()
  },

  update: async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
    return response.json()
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    })
    return response.json()
  },

  toggleActive: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}/toggle-active`, {
      method: 'PUT'
    })
    return response.json()
  }
}