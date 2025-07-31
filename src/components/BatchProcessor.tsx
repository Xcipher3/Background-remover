'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  X, 
  Play, 
  Pause, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FolderOpen,
  Settings,
  Zap
} from 'lucide-react'
import api from '@/lib/api'

interface BatchFile {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  resultUrl?: string
  error?: string
  originalUrl: string
}

interface BatchProcessorProps {
  onClose: () => void
}

export default function BatchProcessor({ onClose }: BatchProcessorProps) {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedModel, setSelectedModel] = useState('auto')
  const [outputFormat, setOutputFormat] = useState('PNG')
  const [quality, setQuality] = useState('high')
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: BatchFile[] = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      status: 'pending',
      progress: 0,
      originalUrl: URL.createObjectURL(file)
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true
  })

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      // Clean up object URLs
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.originalUrl)
        if (fileToRemove.resultUrl) {
          URL.revokeObjectURL(fileToRemove.resultUrl)
        }
      }
      return updated
    })
  }

  const processFiles = async () => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    setIsPaused(false)
    
    for (let i = 0; i < files.length; i++) {
      if (isPaused) break
      
      const file = files[i]
      if (file.status === 'completed') continue
      
      setCurrentProcessingIndex(i)
      
      // Update file status to processing
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'processing', progress: 0 }
          : f
      ))

      try {
        const result = await api.removeBackground(
          file.file,
          selectedModel,
          (progress) => {
            setFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { ...f, progress }
                : f
            ))
          }
        )

        if (result.error) {
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'error', error: result.error }
              : f
          ))
        } else if (result.data) {
          const resultUrl = api.createDownloadUrl(result.data)
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'completed', progress: 100, resultUrl }
              : f
          ))
        }
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'error', error: 'Processing failed' }
            : f
        ))
      }

      // Small delay between files
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsProcessing(false)
    setCurrentProcessingIndex(0)
  }

  const pauseProcessing = () => {
    setIsPaused(true)
    setIsProcessing(false)
  }

  const downloadAll = () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.resultUrl)
    
    completedFiles.forEach((file, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = file.resultUrl!
        link.download = `${file.file.name.split('.')[0]}_no_bg.${outputFormat.toLowerCase()}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 100) // Stagger downloads
    })
  }

  const downloadSingle = (file: BatchFile) => {
    if (!file.resultUrl) return
    
    const link = document.createElement('a')
    link.href = file.resultUrl
    link.download = `${file.file.name.split('.')[0]}_no_bg.${outputFormat.toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearCompleted = () => {
    setFiles(prev => {
      const completed = prev.filter(f => f.status === 'completed')
      completed.forEach(f => {
        URL.revokeObjectURL(f.originalUrl)
        if (f.resultUrl) URL.revokeObjectURL(f.resultUrl)
      })
      return prev.filter(f => f.status !== 'completed')
    })
  }

  const getStatusIcon = (status: BatchFile['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusColor = (status: BatchFile['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100'
      case 'processing':
        return 'bg-blue-50 border-blue-200'
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
    }
  }

  const completedCount = files.filter(f => f.status === 'completed').length
  const errorCount = files.filter(f => f.status === 'error').length
  const pendingCount = files.filter(f => f.status === 'pending').length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Batch Processor</h2>
              <p className="text-sm text-gray-500">Process multiple images at once</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Settings:</span>
            </div>
            
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              disabled={isProcessing}
            >
              <option value="auto">Auto Select</option>
              <option value="u2net">U²-Net</option>
              <option value="u2net_human_seg">U²-Net Human</option>
              <option value="silueta">Silueta</option>
              <option value="isnet-general-use">ISNet General</option>
            </select>
            
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              disabled={isProcessing}
            >
              <option value="PNG">PNG</option>
              <option value="JPG">JPG</option>
              <option value="WEBP">WEBP</option>
            </select>
            
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              disabled={isProcessing}
            >
              <option value="high">High Quality</option>
              <option value="medium">Medium Quality</option>
              <option value="low">Low Quality</option>
            </select>
          </div>
        </div>

        {/* Upload Area */}
        {files.length === 0 && (
          <div className="p-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {isDragActive ? 'Drop your images here' : 'Upload multiple images'}
              </h3>
              <p className="text-gray-500 mb-4">
                Drag and drop images, or click to select multiple files
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Choose Files
              </button>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="flex-1 overflow-hidden">
            {/* Stats */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-gray-600">
                    Total: <span className="font-medium">{files.length}</span>
                  </span>
                  <span className="text-green-600">
                    Completed: <span className="font-medium">{completedCount}</span>
                  </span>
                  <span className="text-blue-600">
                    Pending: <span className="font-medium">{pendingCount}</span>
                  </span>
                  {errorCount > 0 && (
                    <span className="text-red-600">
                      Errors: <span className="font-medium">{errorCount}</span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {completedCount > 0 && (
                    <>
                      <button
                        onClick={downloadAll}
                        className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download All
                      </button>
                      <button
                        onClick={clearCompleted}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                      >
                        Clear Completed
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* File List */}
            <div className="max-h-96 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className={`
                    flex items-center gap-4 p-4 border-b transition-colors
                    ${getStatusColor(file.status)}
                    ${index === currentProcessingIndex && isProcessing ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  <div className="flex-shrink-0">
                    <img
                      src={file.originalUrl}
                      alt={file.file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    {file.status === 'processing' && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(file.status)}
                    
                    {file.status === 'completed' && file.resultUrl && (
                      <button
                        onClick={() => downloadSingle(file)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    
                    {file.status !== 'processing' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        {files.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Upload className="w-4 h-4" />
                  Add More Files
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                {!isProcessing ? (
                  <button
                    onClick={processFiles}
                    disabled={files.length === 0 || files.every(f => f.status === 'completed')}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Start Processing
                  </button>
                ) : (
                  <button
                    onClick={pauseProcessing}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
