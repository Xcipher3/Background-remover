/**
 * API client for background removal service
 */

import { persistentStorage } from './storage'

export interface Model {
  id: string
  name: string
  description: string
  recommended?: boolean
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

class BackgroundRemovalAPI {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'http://localhost:8000' 
      : 'http://localhost:8000'
  }

  /**
   * Get available AI models
   */
  async getModels(): Promise<ApiResponse<{ models: Model[] }>> {
    try {
      const response = await fetch(`${this.baseUrl}/models`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('Error fetching models:', error)
      return { error: 'Failed to fetch available models' }
    }
  }

  /**
   * Remove background from image
   */
  async removeBackground(
    imageFile: File,
    model: string = 'auto',
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<Blob>> {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('model', model)

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 50 // Upload is 50% of total
            onProgress(progress)
          }
        })

        // Track response progress
        xhr.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = 50 + (event.loaded / event.total) * 50 // Processing is other 50%
            onProgress(progress)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const blob = xhr.response

            // Store image references from response headers
            const originalId = xhr.getResponseHeader('X-Original-ID')
            const processedId = xhr.getResponseHeader('X-Processed-ID')

            if (originalId) {
              persistentStorage.addImageReference({
                id: originalId,
                filename: imageFile.name,
                type: 'original',
                metadata: { model, upload_time: new Date().toISOString() }
              })
            }

            if (processedId && originalId) {
              persistentStorage.addImageReference({
                id: processedId,
                filename: `processed_${imageFile.name}`,
                type: 'processed',
                parent_id: originalId,
                metadata: { model, processing_time: new Date().toISOString() }
              })
            }

            resolve({ data: blob })
          } else {
            let errorMessage = `HTTP error! status: ${xhr.status}`
            if (xhr.status === 404) {
              errorMessage = 'Backend server not found. Make sure the backend is running on port 8000.'
            } else if (xhr.status === 500) {
              errorMessage = 'Server error occurred during image processing. Please try again.'
            } else if (xhr.status === 422) {
              errorMessage = 'Invalid image format or corrupted file. Please try a different image.'
            }
            reject(new Error(errorMessage))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error: Cannot connect to backend server. Make sure it\'s running on port 8000.'))
        })

        xhr.open('POST', `${this.baseUrl}/remove-background`)
        xhr.responseType = 'blob'
        xhr.send(formData)
      })
    } catch (error) {
      console.error('Error removing background:', error)
      return { error: 'Failed to remove background from image' }
    }
  }

  /**
   * Check if API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.ok
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }

  /**
   * Get optimal image dimensions for processing
   */
  getOptimalDimensions(originalWidth: number, originalHeight: number, quality: 'low' | 'medium' | 'high' | 'ultra' = 'high') {
    const maxDimensions = {
      low: 1024,
      medium: 2048,
      high: 4096,
      ultra: 8192
    }

    const maxDim = maxDimensions[quality]
    const currentMax = Math.max(originalWidth, originalHeight)

    if (currentMax <= maxDim) {
      return { width: originalWidth, height: originalHeight }
    }

    const ratio = maxDim / currentMax
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload PNG, JPG, JPEG, or WEBP images.'
      }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Please upload images smaller than 10MB.'
      }
    }

    return { valid: true }
  }

  /**
   * Create download URL from blob
   */
  createDownloadUrl(blob: Blob): string {
    return URL.createObjectURL(blob)
  }

  /**
   * Cleanup download URL
   */
  revokeDownloadUrl(url: string): void {
    URL.revokeObjectURL(url)
  }

  /**
   * Get list of stored images
   */
  async getStoredImages(imageType?: string, parentId?: string): Promise<ApiResponse<{ images: any[] }>> {
    try {
      const params = new URLSearchParams()
      if (imageType) params.append('image_type', imageType)
      if (parentId) params.append('parent_id', parentId)

      const response = await fetch(`${this.baseUrl}/images?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('Error fetching stored images:', error)
      return { error: 'Failed to fetch stored images' }
    }
  }

  /**
   * Get a stored image by ID
   */
  async getStoredImage(imageId: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${this.baseUrl}/images/${imageId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      return { data: blob }
    } catch (error) {
      console.error('Error fetching stored image:', error)
      return { error: 'Failed to fetch stored image' }
    }
  }

  /**
   * Save edited image
   */
  async saveEditedImage(
    originalImageId: string,
    editedImageBlob: Blob,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<{ edited_id: string }>> {
    try {
      const formData = new FormData()
      formData.append('edited_image', editedImageBlob, 'edited_image.png')

      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata))
      }

      const response = await fetch(`${this.baseUrl}/images/${originalImageId}/save-edited`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Store reference in persistent storage
      if (data.edited_id) {
        persistentStorage.addImageReference({
          id: data.edited_id,
          filename: `edited_${Date.now()}.png`,
          type: 'edited',
          parent_id: originalImageId,
          metadata: { ...metadata, edit_time: new Date().toISOString() }
        })
      }

      return { data }
    } catch (error) {
      console.error('Error saving edited image:', error)
      return { error: 'Failed to save edited image' }
    }
  }

  /**
   * Delete stored image
   */
  async deleteStoredImage(imageId: string, deleteChildren: boolean = true): Promise<ApiResponse<{ message: string }>> {
    try {
      const params = new URLSearchParams()
      params.append('delete_children', deleteChildren.toString())

      const response = await fetch(`${this.baseUrl}/images/${imageId}?${params}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Remove from persistent storage
      persistentStorage.removeImageReference(imageId)

      return { data }
    } catch (error) {
      console.error('Error deleting image:', error)
      return { error: 'Failed to delete image' }
    }
  }
}

// Export singleton instance
export const api = new BackgroundRemovalAPI()
export default api
