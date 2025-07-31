/**
 * API client for background removal service
 */

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
    model: string = 'u2net',
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
            resolve({ data: blob })
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'))
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
}

// Export singleton instance
export const api = new BackgroundRemovalAPI()
export default api
