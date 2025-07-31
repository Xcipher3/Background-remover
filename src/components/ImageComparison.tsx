'use client'

import { useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface ImageComparisonProps {
  originalImageUrl: string
  processedImageUrl: string | null
  isProcessing: boolean
}

export default function ImageComparison({ 
  originalImageUrl, 
  processedImageUrl, 
  isProcessing 
}: ImageComparisonProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 4))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5))
  }

  const handleResetZoom = () => {
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

  return (
    <div className="space-y-4">
      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.5}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium min-w-[60px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= 4}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleResetZoom}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Image Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Original</h3>
          <div className="relative bg-white rounded-xl shadow-sm border overflow-hidden">
            <div 
              className="relative w-full h-96 overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={originalImageUrl}
                alt="Original"
                className="w-full h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Processed Image */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Background Removed</h3>
          <div className="relative bg-white rounded-xl shadow-sm border overflow-hidden">
            <div 
              className="relative w-full h-96 overflow-hidden"
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
              ) : processedImageUrl ? (
                <div 
                  className="cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    src={processedImageUrl}
                    alt="Processed"
                    className="w-full h-full object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                      transformOrigin: 'center center'
                    }}
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Click "Remove Background" to process</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {zoomLevel > 1 && (
        <p className="text-center text-sm text-gray-500">
          Click and drag to pan the zoomed image
        </p>
      )}
    </div>
  )
}
