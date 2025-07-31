'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Images, 
  Download, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar,
  FileImage,
  Layers,
  Search,
  Filter,
  Grid3X3,
  List,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { FadeIn, ScaleIn } from './ui/AnimatedContainer'
import { Tooltip } from './ui/Tooltip'

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

interface ImageGalleryProps {
  onImageSelect?: (image: StoredImage) => void
  onImageEdit?: (image: StoredImage) => void
  className?: string
}

export default function ImageGallery({ onImageSelect, onImageEdit, className }: ImageGalleryProps) {
  const [images, setImages] = useState<StoredImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'original' | 'processed' | 'edited'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadImages()
  }, [filter])

  const loadImages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('image_type', filter)
      }
      
      const response = await fetch(`http://localhost:8000/images?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to load images: ${response.status}`)
      }
      
      const data = await response.json()
      setImages(data.images || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/images/${imageId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete image')
      }
      
      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId))
      setSelectedImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(imageId)
        return newSet
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete image')
    }
  }

  const downloadImage = async (imageId: string, filename: string) => {
    try {
      const response = await fetch(`http://localhost:8000/images/${imageId}`)
      if (!response.ok) {
        throw new Error('Failed to download image')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download image')
    }
  }

  const filteredImages = images.filter(image => {
    if (searchTerm) {
      return image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
             image.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'original': return <FileImage className="w-4 h-4" />
      case 'processed': return <Layers className="w-4 h-4" />
      case 'edited': return <Edit3 className="w-4 h-4" />
      default: return <Images className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'original': return 'text-blue-600 bg-blue-100'
      case 'processed': return 'text-green-600 bg-green-100'
      case 'edited': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your images...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <Images className="w-12 h-12 mx-auto mb-2" />
            <p className="font-medium">Failed to load images</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <Button onClick={loadImages} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Images className="w-5 h-5" />
            Image Gallery ({filteredImages.length})
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={loadImages}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Images</option>
              <option value="original">Original</option>
              <option value="processed">Processed</option>
              <option value="edited">Edited</option>
            </select>
          </div>
          
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <Images className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload some images to get started'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
          }>
            <AnimatePresence>
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {viewMode === 'grid' ? (
                    <ImageGridItem 
                      image={image}
                      onSelect={onImageSelect}
                      onEdit={onImageEdit}
                      onDelete={deleteImage}
                      onDownload={downloadImage}
                      getTypeIcon={getTypeIcon}
                      getTypeColor={getTypeColor}
                      formatFileSize={formatFileSize}
                      formatDate={formatDate}
                    />
                  ) : (
                    <ImageListItem 
                      image={image}
                      onSelect={onImageSelect}
                      onEdit={onImageEdit}
                      onDelete={deleteImage}
                      onDownload={downloadImage}
                      getTypeIcon={getTypeIcon}
                      getTypeColor={getTypeColor}
                      formatFileSize={formatFileSize}
                      formatDate={formatDate}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Grid item component
function ImageGridItem({
  image,
  onSelect,
  onEdit,
  onDelete,
  onDownload,
  getTypeIcon,
  getTypeColor,
  formatFileSize,
  formatDate
}: any) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={`http://localhost:8000/images/${image.id}/thumbnail`}
          alt={image.filename}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `http://localhost:8000/images/${image.id}`
          }}
        />

        {/* Type badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(image.type)}`}>
          {getTypeIcon(image.type)}
          {image.type}
        </div>

        {/* Action overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Tooltip content="View">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSelect?.(image)}
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </Tooltip>

          {(image.type === 'processed' || image.type === 'original') && (
            <Tooltip content="Edit">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit?.(image)}
                className="bg-white/90 hover:bg-white"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          <Tooltip content="Download">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDownload(image.id, image.filename)}
              className="bg-white/90 hover:bg-white"
            >
              <Download className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Delete">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(image.id)}
              className="bg-red-500/90 hover:bg-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate mb-1" title={image.filename}>
          {image.filename}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(image.file_size)}</span>
          <span>{formatDate(image.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// List item component
function ImageListItem({
  image,
  onSelect,
  onEdit,
  onDelete,
  onDownload,
  getTypeIcon,
  getTypeColor,
  formatFileSize,
  formatDate
}: any) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate" title={image.filename}>
                {image.filename}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(image.type)}`}>
                {getTypeIcon(image.type)}
                {image.type}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(image.created_at)}
              </span>
              <span>{formatFileSize(image.file_size)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Tooltip content="View">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelect?.(image)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Tooltip>

            {(image.type === 'processed' || image.type === 'original') && (
              <Tooltip content="Edit">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit?.(image)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}

            <Tooltip content="Download">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownload(image.id, image.filename)}
              >
                <Download className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Delete">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(image.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
