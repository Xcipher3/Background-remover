'use client'

import { useState } from 'react'
import { Download, Settings, FileImage, Palette, Sparkles } from 'lucide-react'

interface DownloadPanelProps {
  processedImageUrl: string | null
  originalFileName: string
  onDownload: (format: string, quality: string, filename: string) => void
}

export default function DownloadPanel({ 
  processedImageUrl, 
  originalFileName, 
  onDownload 
}: DownloadPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState('PNG')
  const [quality, setQuality] = useState('high')
  const [customFilename, setCustomFilename] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const formats = [
    {
      id: 'PNG',
      name: 'PNG',
      description: 'Best quality with transparency',
      icon: '🖼️',
      supportsQuality: false,
      recommended: true
    },
    {
      id: 'JPG',
      name: 'JPG',
      description: 'Smaller file size, no transparency',
      icon: '📷',
      supportsQuality: true,
      recommended: false
    },
    {
      id: 'WEBP',
      name: 'WEBP',
      description: 'Modern format, great compression',
      icon: '🌐',
      supportsQuality: true,
      recommended: false
    }
  ]

  const qualityOptions = [
    { id: 'ultra', name: 'Ultra (98%)', description: 'Maximum quality' },
    { id: 'high', name: 'High (95%)', description: 'Recommended' },
    { id: 'medium', name: 'Medium (85%)', description: 'Balanced' },
    { id: 'low', name: 'Low (75%)', description: 'Smaller file' }
  ]

  const getDefaultFilename = () => {
    const baseName = originalFileName.split('.')[0] || 'image'
    return `${baseName}_no_bg`
  }

  const handleDownload = () => {
    const filename = customFilename.trim() || getDefaultFilename()
    onDownload(selectedFormat, quality, filename)
  }

  const getEstimatedSize = () => {
    // Rough estimation based on format and quality
    const baseSize = 2.5 // MB estimate
    let multiplier = 1

    if (selectedFormat === 'PNG') {
      multiplier = 1.0
    } else if (selectedFormat === 'JPG') {
      const qualityMultipliers = { ultra: 0.8, high: 0.6, medium: 0.4, low: 0.2 }
      multiplier = qualityMultipliers[quality as keyof typeof qualityMultipliers] || 0.6
    } else if (selectedFormat === 'WEBP') {
      const qualityMultipliers = { ultra: 0.7, high: 0.5, medium: 0.3, low: 0.15 }
      multiplier = qualityMultipliers[quality as keyof typeof qualityMultipliers] || 0.5
    }

    return (baseSize * multiplier).toFixed(1)
  }

  if (!processedImageUrl) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Download className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Download Options</h3>
          <p className="text-sm text-gray-500">Choose format and quality for your processed image</p>
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Output Format</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`
                relative p-4 border-2 rounded-lg text-left transition-all
                ${selectedFormat === format.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{format.icon}</span>
                <span className="font-medium">{format.name}</span>
                {format.recommended && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{format.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Selection */}
      {formats.find(f => f.id === selectedFormat)?.supportsQuality && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Quality Level</label>
          <div className="grid grid-cols-2 gap-2">
            {qualityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setQuality(option.id)}
                className={`
                  p-3 border rounded-lg text-left transition-all
                  ${quality === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="font-medium text-sm">{option.name}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Options */}
      <div className="space-y-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <Settings className="w-4 h-4" />
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Filename (optional)
              </label>
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder={getDefaultFilename()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use default: {getDefaultFilename()}.{selectedFormat.toLowerCase()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Estimated size: ~{getEstimatedSize()} MB
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {selectedFormat} format
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-sm"
      >
        <Download className="w-5 h-5" />
        Download {selectedFormat}
      </button>

      {/* Quick Download Options */}
      <div className="flex gap-2">
        <button
          onClick={() => onDownload('PNG', 'high', getDefaultFilename())}
          className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
        >
          Quick PNG
        </button>
        <button
          onClick={() => onDownload('JPG', 'high', getDefaultFilename())}
          className="flex-1 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
        >
          Quick JPG
        </button>
      </div>
    </div>
  )
}
