'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  Maximize2, 
  Eye, 
  EyeOff,
  SplitSquareHorizontal,
  Layers,
  MousePointer
} from 'lucide-react'

interface AdvancedImageComparisonProps {
  originalImageUrl: string
  processedImageUrl: string | null
  editedImageUrl?: string | null
  isProcessing: boolean
}

export default function AdvancedImageComparison({ 
  originalImageUrl, 
  processedImageUrl, 
  editedImageUrl,
  isProcessing 
}: AdvancedImageComparisonProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'split'>('side-by-side')
  const [showOriginal, setShowOriginal] = useState(true)
  const [splitPosition, setSplitPosition] = useState(50)
  const [activeImage, setActiveImage] = useState<'original' | 'processed' | 'edited'>('processed')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const splitRef = useRef<HTMLDivElement>(null)

  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]

  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel)
    if (currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1])
    }
  }

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel)
    if (currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1])
    }
  }

  const handleFitToScreen = () => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSplitDrag = (e: React.MouseEvent) => {
    if (!splitRef.current) return
    
    const rect = splitRef.current.getBoundingClientRect()
    const percentage = ((e.clientX - rect.left) / rect.width) * 100
    setSplitPosition(Math.max(0, Math.min(100, percentage)))
  }

  const getCurrentImageUrl = () => {
    if (editedImageUrl && activeImage === 'edited') return editedImageUrl
    if (processedImageUrl && activeImage === 'processed') return processedImageUrl
    return originalImageUrl
  }

  const viewModes = [
    { id: 'side-by-side', name: 'Side by Side', icon: SplitSquareHorizontal },
    { id: 'overlay', name: 'Overlay', icon: Layers },
    { id: 'split', name: 'Split View', icon: MousePointer }
  ]

  const imageOptions = [
    { id: 'original', name: 'Original', available: true },
    { id: 'processed', name: 'Processed', available: !!processedImageUrl },
    { id: 'edited', name: 'Edited', available: !!editedImageUrl }
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        handleFitToScreen()
      } else if (e.key === ' ') {
        e.preventDefault()
        setShowOriginal(!showOriginal)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoomLevel, showOriginal])

  return (
    <div className="space-y-4">
      {/* Advanced Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= zoomLevels[0]}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <select
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium min-w-[80px] text-center"
          >
            {zoomLevels.map(level => (
              <option key={level} value={level}>
                {Math.round(level * 100)}%
              </option>
            ))}
          </select>
          
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= zoomLevels[zoomLevels.length - 1]}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleFitToScreen}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Fit to Screen (0)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          {viewModes.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${viewMode === mode.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {mode.name}
              </button>
            )
          })}
        </div>

        {/* Image Selection */}
        <div className="flex items-center gap-2">
          {imageOptions.filter(opt => opt.available).map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveImage(option.id as any)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeImage === option.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Image Display Area */}
      <div 
        ref={containerRef}
        className="relative bg-white rounded-xl shadow-sm border overflow-hidden"
        style={{ minHeight: '500px' }}
      >
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Original Image */}
            <div className="relative border-r">
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black bg-opacity-75 text-white text-sm rounded-full">
                Original
              </div>
              <div 
                className="w-full h-96 overflow-hidden cursor-move flex items-center justify-center"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                <img
                  src={originalImageUrl}
                  alt="Original"
                  className="max-w-none transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                    transformOrigin: 'center center'
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Processed/Edited Image */}
            <div className="relative">
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black bg-opacity-75 text-white text-sm rounded-full">
                {editedImageUrl ? 'Edited' : 'Processed'}
              </div>
              <div 
                className="w-full h-96 overflow-hidden cursor-move flex items-center justify-center"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Processing...</p>
                    </div>
                  </div>
                ) : (editedImageUrl || processedImageUrl) ? (
                  <img
                    src={editedImageUrl || processedImageUrl || ''}
                    alt="Processed"
                    className="max-w-none transition-transform duration-200"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                      transformOrigin: 'center center'
                    }}
                    draggable={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Click "Remove Background" to process</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'overlay' && (
          <div className="relative w-full h-96 overflow-hidden">
            <div 
              className="absolute inset-0 cursor-move flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                  linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            >
              <img
                src={getCurrentImageUrl()}
                alt="Current"
                className="max-w-none transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />
            </div>
            
            {/* Overlay Toggle */}
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`
                absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors
                ${showOriginal 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border'
                }
              `}
              title="Toggle Original (Space)"
            >
              {showOriginal ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showOriginal ? 'Hide Original' : 'Show Original'}
            </button>
          </div>
        )}

        {viewMode === 'split' && (
          <div 
            ref={splitRef}
            className="relative w-full h-96 overflow-hidden cursor-col-resize"
            onMouseMove={handleSplitDrag}
          >
            {/* Background with checkerboard */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                  linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            />
            
            {/* Original Image */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}
            >
              <img
                src={originalImageUrl}
                alt="Original"
                className="w-full h-full object-contain"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />
            </div>
            
            {/* Processed Image */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${splitPosition}%)` }}
            >
              {(editedImageUrl || processedImageUrl) && (
                <img
                  src={editedImageUrl || processedImageUrl || ''}
                  alt="Processed"
                  className="w-full h-full object-contain"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                    transformOrigin: 'center center'
                  }}
                  draggable={false}
                />
              )}
            </div>
            
            {/* Split Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize z-10"
              style={{ left: `${splitPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Move className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Keyboard Shortcuts Help */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Keyboard shortcuts: <kbd className="px-2 py-1 bg-gray-100 rounded">+</kbd> zoom in, 
          <kbd className="px-2 py-1 bg-gray-100 rounded mx-1">-</kbd> zoom out, 
          <kbd className="px-2 py-1 bg-gray-100 rounded">0</kbd> fit to screen
          {viewMode === 'overlay' && (
            <>, <kbd className="px-2 py-1 bg-gray-100 rounded ml-1">Space</kbd> toggle original</>
          )}
        </p>
        {zoomLevel > 1 && <p className="mt-1">Click and drag to pan the zoomed image</p>}
      </div>
    </div>
  )
}
