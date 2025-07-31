/**
 * Persistent storage management for images and user preferences
 */

interface StoredImageReference {
  id: string
  filename: string
  type: 'original' | 'processed' | 'edited'
  parent_id?: string
  created_at: string
  thumbnail_url?: string
  metadata?: Record<string, any>
}

interface UserSession {
  session_id: string
  created_at: string
  last_active: string
  images: StoredImageReference[]
  preferences: {
    view_mode: 'grid' | 'list'
    filter: 'all' | 'original' | 'processed' | 'edited'
    auto_save: boolean
    quality_preference: 'ultra' | 'high' | 'medium' | 'low'
  }
}

class PersistentStorage {
  private readonly STORAGE_KEY = 'bg_remover_session'
  private readonly IMAGES_KEY = 'bg_remover_images'
  private readonly PREFERENCES_KEY = 'bg_remover_preferences'
  
  private session: UserSession | null = null

  constructor() {
    this.initializeSession()
  }

  private initializeSession() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.session = JSON.parse(stored)
        // Update last active time
        if (this.session) {
          this.session.last_active = new Date().toISOString()
          this.saveSession()
        }
      } else {
        this.createNewSession()
      }
    } catch (error) {
      console.error('Failed to initialize session:', error)
      this.createNewSession()
    }
  }

  private createNewSession() {
    const now = new Date().toISOString()
    this.session = {
      session_id: this.generateSessionId(),
      created_at: now,
      last_active: now,
      images: [],
      preferences: {
        view_mode: 'grid',
        filter: 'all',
        auto_save: true,
        quality_preference: 'high'
      }
    }
    this.saveSession()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private saveSession() {
    if (this.session) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.session))
      } catch (error) {
        console.error('Failed to save session:', error)
      }
    }
  }

  // Image management
  addImageReference(imageRef: Omit<StoredImageReference, 'created_at'>) {
    if (!this.session) return

    const fullRef: StoredImageReference = {
      ...imageRef,
      created_at: new Date().toISOString()
    }

    // Remove existing reference if it exists
    this.session.images = this.session.images.filter(img => img.id !== imageRef.id)
    
    // Add new reference
    this.session.images.unshift(fullRef)
    
    // Keep only last 100 images to prevent storage bloat
    if (this.session.images.length > 100) {
      this.session.images = this.session.images.slice(0, 100)
    }

    this.session.last_active = new Date().toISOString()
    this.saveSession()
  }

  removeImageReference(imageId: string) {
    if (!this.session) return

    this.session.images = this.session.images.filter(img => img.id !== imageId)
    this.session.last_active = new Date().toISOString()
    this.saveSession()
  }

  getImageReferences(): StoredImageReference[] {
    return this.session?.images || []
  }

  getImageReference(imageId: string): StoredImageReference | undefined {
    return this.session?.images.find(img => img.id === imageId)
  }

  // Preferences management
  updatePreferences(updates: Partial<UserSession['preferences']>) {
    if (!this.session) return

    this.session.preferences = { ...this.session.preferences, ...updates }
    this.session.last_active = new Date().toISOString()
    this.saveSession()
  }

  getPreferences(): UserSession['preferences'] {
    return this.session?.preferences || {
      view_mode: 'grid',
      filter: 'all',
      auto_save: true,
      quality_preference: 'high'
    }
  }

  // Session management
  getSession(): UserSession | null {
    return this.session
  }

  clearSession() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.IMAGES_KEY)
      localStorage.removeItem(this.PREFERENCES_KEY)
      this.createNewSession()
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }

  // Recent images for quick access
  getRecentImages(limit: number = 10): StoredImageReference[] {
    return this.getImageReferences()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  // Statistics
  getStorageStats() {
    const images = this.getImageReferences()
    const totalImages = images.length
    const typeCount = images.reduce((acc, img) => {
      acc[img.type] = (acc[img.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total_images: totalImages,
      type_counts: typeCount,
      session_age_days: this.session 
        ? Math.floor((Date.now() - new Date(this.session.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      last_active: this.session?.last_active
    }
  }

  // Export/Import functionality
  exportSession(): string {
    return JSON.stringify(this.session, null, 2)
  }

  importSession(sessionData: string): boolean {
    try {
      const imported = JSON.parse(sessionData) as UserSession
      
      // Validate structure
      if (!imported.session_id || !imported.images || !imported.preferences) {
        throw new Error('Invalid session data structure')
      }

      this.session = imported
      this.session.last_active = new Date().toISOString()
      this.saveSession()
      return true
    } catch (error) {
      console.error('Failed to import session:', error)
      return false
    }
  }

  // Cleanup old references (call periodically)
  cleanupOldReferences(maxAgeHours: number = 24 * 7) { // Default: 1 week
    if (!this.session) return

    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000)
    const initialCount = this.session.images.length

    this.session.images = this.session.images.filter(img => {
      const imageTime = new Date(img.created_at).getTime()
      return imageTime > cutoffTime
    })

    const removedCount = initialCount - this.session.images.length
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old image references`)
      this.saveSession()
    }
  }

  // Browser storage utilities
  static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  static getStorageUsage(): { used: number; available: number; percentage: number } {
    if (!this.isStorageAvailable()) {
      return { used: 0, available: 0, percentage: 0 }
    }

    let used = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }

    // Estimate available space (5MB is typical limit)
    const available = 5 * 1024 * 1024 // 5MB in bytes
    const percentage = (used / available) * 100

    return { used, available, percentage }
  }
}

// Global instance
export const persistentStorage = new PersistentStorage()

// React hook for using persistent storage
export function usePersistentStorage() {
  return {
    addImage: (imageRef: Omit<StoredImageReference, 'created_at'>) => 
      persistentStorage.addImageReference(imageRef),
    
    removeImage: (imageId: string) => 
      persistentStorage.removeImageReference(imageId),
    
    getImages: () => 
      persistentStorage.getImageReferences(),
    
    getImage: (imageId: string) => 
      persistentStorage.getImageReference(imageId),
    
    getRecentImages: (limit?: number) => 
      persistentStorage.getRecentImages(limit),
    
    updatePreferences: (updates: Partial<UserSession['preferences']>) => 
      persistentStorage.updatePreferences(updates),
    
    getPreferences: () => 
      persistentStorage.getPreferences(),
    
    getStats: () => 
      persistentStorage.getStorageStats(),
    
    clearAll: () => 
      persistentStorage.clearSession(),
    
    cleanup: (maxAgeHours?: number) => 
      persistentStorage.cleanupOldReferences(maxAgeHours)
  }
}

export type { StoredImageReference, UserSession }
