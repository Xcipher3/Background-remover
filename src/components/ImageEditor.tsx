'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Palette, 
  Sun, 
  Contrast, 
  Droplets, 
  Sparkles, 
  RotateCcw, 
  Download,
  Image as ImageIcon,
  Sliders,
  Wand2
} from 'lucide-react'

interface ImageEditorProps {
  originalImageUrl: string
  processedImageUrl: string
  onSave: (editedImageUrl: string) => void
}

interface ImageFilters {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  blur: number
  sepia: number
  grayscale: number
}

export default function ImageEditor({ 
  originalImageUrl, 
  processedImageUrl, 
  onSave 
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0
  })
  
  const [selectedBackground, setSelectedBackground] = useState<string>('transparent')
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#ffffff')
  const [activeTab, setActiveTab] = useState<'filters' | 'background' | 'effects'>('filters')
  const [isProcessing, setIsProcessing] = useState(false)

  const backgroundOptions = [
    { id: 'transparent', name: 'Transparent', preview: 'checkerboard' },
    { id: 'white', name: 'White', preview: '#ffffff' },
    { id: 'black', name: 'Black', preview: '#000000' },
    { id: 'gradient1', name: 'Blue Gradient', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient2', name: 'Sunset', preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'gradient3', name: 'Ocean', preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'custom', name: 'Custom Color', preview: customBackgroundColor }
  ]

  const effectPresets = [
    { id: 'none', name: 'Original', filters: { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, sepia: 0, grayscale: 0 } },
    { id: 'vibrant', name: 'Vibrant', filters: { brightness: 110, contrast: 120, saturation: 130, hue: 0, blur: 0, sepia: 0, grayscale: 0 } },
    { id: 'vintage', name: 'Vintage', filters: { brightness: 95, contrast: 110, saturation: 80, hue: 10, blur: 0, sepia: 30, grayscale: 0 } },
    { id: 'dramatic', name: 'Dramatic', filters: { brightness: 90, contrast: 140, saturation: 110, hue: 0, blur: 0, sepia: 0, grayscale: 0 } },
    { id: 'soft', name: 'Soft', filters: { brightness: 105, contrast: 90, saturation: 95, hue: 0, blur: 1, sepia: 0, grayscale: 0 } },
    { id: 'bw', name: 'Black & White', filters: { brightness: 100, contrast: 110, saturation: 100, hue: 0, blur: 0, sepia: 0, grayscale: 100 } }
  ]

  useEffect(() => {
    applyFilters()
  }, [filters, selectedBackground, customBackgroundColor, processedImageUrl])

  const applyFilters = async () => {
    if (!canvasRef.current || !processedImageUrl) return

    setIsProcessing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Apply background first
      if (selectedBackground !== 'transparent') {
        if (selectedBackground === 'custom') {
          ctx.fillStyle = customBackgroundColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else if (selectedBackground === 'white') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else if (selectedBackground === 'black') {
          ctx.fillStyle = '#000000'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else if (selectedBackground.startsWith('gradient')) {
          // Create gradient backgrounds
          const gradients = {
            gradient1: ['#667eea', '#764ba2'],
            gradient2: ['#f093fb', '#f5576c'],
            gradient3: ['#4facfe', '#00f2fe']
          }
          
          const colors = gradients[selectedBackground as keyof typeof gradients]
          if (colors) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
            gradient.addColorStop(0, colors[0])
            gradient.addColorStop(1, colors[1])
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
        }
      }

      // Apply filters
      const filterString = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        hue-rotate(${filters.hue}deg)
        blur(${filters.blur}px)
        sepia(${filters.sepia}%)
        grayscale(${filters.grayscale}%)
      `
      
      ctx.filter = filterString
      ctx.drawImage(img, 0, 0)
      ctx.filter = 'none'

      setIsProcessing(false)
    }

    img.src = processedImageUrl
  }

  const handleFilterChange = (filterName: keyof ImageFilters, value: number) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const applyPreset = (preset: typeof effectPresets[0]) => {
    setFilters(preset.filters)
  }

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sepia: 0,
      grayscale: 0
    })
    setSelectedBackground('transparent')
  }

  const saveEdited = () => {
    if (!canvasRef.current) return
    
    const dataUrl = canvasRef.current.toDataURL('image/png')
    onSave(dataUrl)
  }

  const tabs = [
    { id: 'filters', name: 'Filters', icon: Sliders },
    { id: 'background', name: 'Background', icon: Palette },
    { id: 'effects', name: 'Effects', icon: Sparkles }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Wand2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Image Editor</h3>
            <p className="text-sm text-gray-500">Enhance your processed image with filters and effects</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          )
        })}
      </div>

      <div className="p-4 space-y-4">
        {/* Canvas Preview */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto border rounded-lg shadow-sm"
            style={{ 
              maxHeight: '300px',
              background: selectedBackground === 'transparent' 
                ? 'url("data:image/svg+xml,%3csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cdefs%3e%3cpattern id=\'a\' patternUnits=\'userSpaceOnUse\' width=\'20\' height=\'20\'%3e%3crect fill=\'%23f8f9fa\' width=\'10\' height=\'10\'/%3e%3crect fill=\'%23e9ecef\' x=\'10\' width=\'10\' height=\'10\'/%3e%3crect fill=\'%23e9ecef\' y=\'10\' width=\'10\' height=\'10\'/%3e%3crect fill=\'%23f8f9fa\' x=\'10\' y=\'10\' width=\'10\' height=\'10\'/%3e%3c/pattern%3e%3c/defs%3e%3crect width=\'100%25\' height=\'100%25\' fill=\'url(%23a)\'/%3e%3c/svg%3e")'
                : 'white'
            }}
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Processing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {activeTab === 'filters' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Sun className="w-4 h-4" />
                  Brightness: {filters.brightness}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={filters.brightness}
                  onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Contrast className="w-4 h-4" />
                  Contrast: {filters.contrast}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={filters.contrast}
                  onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="w-4 h-4" />
                  Saturation: {filters.saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation}
                  onChange={(e) => handleFilterChange('saturation', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-4 h-4" />
                  Hue: {filters.hue}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={filters.hue}
                  onChange={(e) => handleFilterChange('hue', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'background' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {backgroundOptions.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBackground(bg.id)}
                  className={`
                    relative p-3 border-2 rounded-lg text-center transition-all
                    ${selectedBackground === bg.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div 
                    className="w-full h-12 rounded mb-2"
                    style={{
                      background: bg.preview === 'checkerboard' 
                        ? 'url("data:image/svg+xml,%3csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cdefs%3e%3cpattern id=\'a\' patternUnits=\'userSpaceOnUse\' width=\'20\' height=\'20\'%3e%3crect fill=\'%23f8f9fa\' width=\'10\' height=\'10\'/%3e%3crect fill=\'%23e9ecef\' x=\'10\' width=\'10\' height=\'10\'/%3e%3crect fill=\'%23e9ecef\' y=\'10\' width=\'10\' height=\'10\'/%3e%3crect fill=\'%23f8f9fa\' x=\'10\' y=\'10\' width=\'10\' height=\'10\'/%3e%3c/pattern%3e%3c/defs%3e%3crect width=\'100%25\' height=\'100%25\' fill=\'url(%23a)\'/%3e%3c/svg%3e")'
                        : bg.preview
                    }}
                  />
                  <span className="text-xs font-medium">{bg.name}</span>
                </button>
              ))}
            </div>
            
            {selectedBackground === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Background Color
                </label>
                <input
                  type="color"
                  value={customBackgroundColor}
                  onChange={(e) => setCustomBackgroundColor(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {effectPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-center"
                >
                  <span className="text-sm font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <button
            onClick={saveEdited}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
          >
            <Download className="w-4 h-4" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  )
}
