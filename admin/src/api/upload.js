import { API_BASE_URL } from './config'

export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      if (response.status === 413) {
        throw new Error('File too large. Please select a smaller image (max 2MB).')
      }
      if (response.status === 400) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Invalid file format. Only JPG/PNG allowed.')
      }
      throw new Error(`Upload failed: ${response.statusText}`)
    }
    
    return response.json()
  }
}