'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Settings, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import ImageGallery from '@/components/ImageGallery'
import ImageProcessor from '@/components/ImageProcessor'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { FadeIn } from '@/components/ui/AnimatedContainer'
import { usePersistentStorage } from '@/lib/storage'
import api from '@/lib/api'

interface StoredImage {
  id: string
  filename: string
  original_filename: string
  type: 'original' | 'processed' | 'edited'
  parent_id?: string
  file_size: number
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null)
  const [editingImage, setEditingImage] = useState<StoredImage | null>(null)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [storageStats, setStorageStats] = useState<any>(null)

  const storage = usePersistentStorage()

  useEffect(() => {
    loadStorageStats()
    // Cleanup old references on page load
    storage.cleanup(24 * 7) // 1 week
  }, [])

  const loadStorageStats = async () => {
    try {
      const result = await api.getStorageStats()
      if (result.data) {
        setStorageStats(result.data.stats)
      }
    } catch (error) {
      console.error('Failed to load storage stats:', error)
    }
  }

  const handleImageSelect = async (image: StoredImage) => {
    setSelectedImage(image)
    
    // Load the actual image data
    try {
      const result = await api.getStoredImage(image.id)
      if (result.data) {
        setImageBlob(result.data)
        
        // If it's a processed image, set it as the processed URL
        if (image.type === 'processed' || image.type === 'edited') {
          const url = URL.createObjectURL(result.data)
          setProcessedImageUrl(url)
        }
      }
    } catch (error) {
      console.error('Failed to load image:', error)
    }
  }

  const handleImageEdit = async (image: StoredImage) => {
    setEditingImage(image)
    await handleImageSelect(image)
  }

  const handleProcessingStart = () => {
    setIsProcessing(true)
  }

  const handleImageProcessed = (processedUrl: string) => {
    setProcessedImageUrl(processedUrl)
    setIsProcessing(false)
    // Refresh gallery to show new processed image
    window.location.reload()
  }

  const handleReset = () => {
    setSelectedImage(null)
    setEditingImage(null)
    setImageBlob(null)
    setProcessedImageUrl(null)
    setIsProcessing(false)
  }

  const createFileFromBlob = (blob: Blob, filename: string): File => {
    return new File([blob], filename, { type: blob.type })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Upload
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Stats
              </Button>
              <Link href="/">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Storage Stats */}
        {showStats && storageStats && (
          <FadeIn delay={0.1}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Storage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {storageStats.total_images}
                    </div>
                    <div className="text-sm text-gray-600">Total Images</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {storageStats.total_size_mb} MB
                    </div>
                    <div className="text-sm text-gray-600">Storage Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {storageStats.type_counts?.original || 0}
                    </div>
                    <div className="text-sm text-gray-600">Original Images</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {storageStats.type_counts?.processed || 0}
                    </div>
                    <div className="text-sm text-gray-600">Processed Images</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gallery */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.2}>
              <ImageGallery
                onImageSelect={handleImageSelect}
                onImageEdit={handleImageEdit}
                className="h-full"
              />
            </FadeIn>
          </div>

          {/* Image Processor/Viewer */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.3}>
              {selectedImage && imageBlob ? (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingImage ? 'Edit Image' : 'View Image'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageProcessor
                      image={createFileFromBlob(imageBlob, selectedImage.filename)}
                      processedImageUrl={processedImageUrl}
                      isProcessing={isProcessing}
                      onProcessingStart={handleProcessingStart}
                      onImageProcessed={handleImageProcessed}
                      onReset={handleReset}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <Upload className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No Image Selected
                      </h3>
                      <p className="text-sm text-gray-500">
                        Select an image from the gallery to view or edit it
                      </p>
                    </div>
                    <Link href="/">
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New Image
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </FadeIn>
          </div>
        </div>

        {/* Recent Images Quick Access */}
        <FadeIn delay={0.4}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Images</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentImagesBar onImageSelect={handleImageSelect} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}

// Recent images component
function RecentImagesBar({ onImageSelect }: { onImageSelect: (image: StoredImage) => void }) {
  const [recentImages, setRecentImages] = useState<StoredImage[]>([])
  const storage = usePersistentStorage()

  useEffect(() => {
    loadRecentImages()
  }, [])

  const loadRecentImages = async () => {
    try {
      const result = await api.getStoredImages()
      if (result.data) {
        const recent = result.data.images
          .sort((a: StoredImage, b: StoredImage) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 8)
        setRecentImages(recent)
      }
    } catch (error) {
      console.error('Failed to load recent images:', error)
    }
  }

  if (recentImages.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No recent images found
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {recentImages.map((image) => (
        <motion.div
          key={image.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 cursor-pointer"
          onClick={() => onImageSelect(image)}
        >
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-300 transition-colors">
            <img
              src={`http://localhost:8000/images/${image.id}/thumbnail`}
              alt={image.filename}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `http://localhost:8000/images/${image.id}`
              }}
            />
          </div>
          <div className="text-xs text-center mt-1 text-gray-600 truncate w-20">
            {image.filename}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
