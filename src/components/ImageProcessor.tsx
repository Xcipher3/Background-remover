'use client'

import { useState, useEffect } from 'react'
import { Download, RotateCcw, Loader2, Wand2, Layers, Zap, Sparkles, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ModelSelector from './ModelSelector'
import AdvancedImageComparison from './AdvancedImageComparison'
import ImageEditor from './ImageEditor'
import DownloadPanel from './DownloadPanel'
import BatchProcessor from './BatchProcessor'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader } from './ui/Card'
import { Tooltip } from './ui/Tooltip'
import { TabTransition, FadeIn, ScaleIn } from './ui/AnimatedContainer'
import { ProcessingAnimation } from './ui/LoadingSpinner'
import api from '@/lib/api'

interface ImageProcessorProps {
  image: File
  processedImageUrl: string | null
  isProcessing: boolean
  onProcessingStart: () => void
  onImageProcessed: (imageUrl: string) => void
  onReset: () => void
}

export default function ImageProcessor({
  image,
  processedImageUrl,
  isProcessing,
  onProcessingStart,
  onImageProcessed,
  onReset
}: ImageProcessorProps) {
  const [selectedModel, setSelectedModel] = useState('auto')
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showBatchProcessor, setShowBatchProcessor] = useState(false)
  const [activeTab, setActiveTab] = useState<'process' | 'edit' | 'download'>('process')

  useEffect(() => {
    const url = URL.createObjectURL(image)
    setOriginalImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  const processImage = async () => {
    if (!image) return

    setError(null)
    setProgress(0)
    onProcessingStart()

    try {
      // Validate image file
      const validation = api.validateImageFile(image)
      if (!validation.valid) {
        setError(validation.error || 'Invalid image file')
        return
      }

      // Process image with progress tracking
      const result = await api.removeBackground(
        image,
        selectedModel,
        (progressValue) => setProgress(progressValue)
      )

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.data) {
        const processedUrl = api.createDownloadUrl(result.data)
        onImageProcessed(processedUrl)
        setProgress(100)
      }
    } catch (err) {
      setError('Failed to process image. Please try again.')
      console.error('Processing error:', err)
    }
  }

  const handleDownload = (format: string, quality: string, filename: string) => {
    const imageUrl = editedImageUrl || processedImageUrl
    if (!imageUrl) return

    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${filename}.${format.toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImageEdited = async (editedUrl: string) => {
    setEditedImageUrl(editedUrl)
    setShowEditor(false)
    setActiveTab('download')

    // Save edited image to backend storage
    try {
      // Convert URL to blob
      const response = await fetch(editedUrl)
      const blob = await response.blob()

      // For now, we'll use a placeholder for the original ID
      // In a real implementation, you'd track the original image ID
      const originalId = 'placeholder'

      // Save edited image
      await api.saveEditedImage(originalId, blob, {
        edit_type: 'manual_edit',
        edit_timestamp: new Date().toISOString(),
        original_filename: image.name
      })

      console.log('Edited image saved successfully')
    } catch (error) {
      console.error('Failed to save edited image:', error)
    }
  }

  const handleReset = () => {
    onReset()
    setEditedImageUrl(null)
    setShowEditor(false)
    setActiveTab('process')
  }

  const tabs = [
    { id: 'process', name: 'Process', icon: Layers, disabled: false },
    { id: 'edit', name: 'Edit', icon: Wand2, disabled: !processedImageUrl },
    { id: 'download', name: 'Download', icon: Download, disabled: !processedImageUrl }
  ]

  return (
    <FadeIn className="space-y-8">
      {/* Header Controls */}
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Tooltip content="Start over with a new image">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  icon={<RotateCcw className="w-4 h-4" />}
                  className="hover:bg-gray-100"
                >
                  New Image
                </Button>
              </Tooltip>

              <div className="h-6 w-px bg-gray-300"></div>

              <Tooltip content="Process multiple images at once">
                <Button
                  variant="outline"
                  onClick={() => setShowBatchProcessor(true)}
                  icon={<Zap className="w-4 h-4" />}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                >
                  Batch Process
                </Button>
              </Tooltip>
            </div>

            <div className="flex items-center gap-4">
              {!processedImageUrl && !isProcessing && (
                <>
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    disabled={isProcessing}
                  />
                  <Tooltip content="Start AI-powered background removal">
                    <Button
                      size="lg"
                      onClick={processImage}
                      icon={<Sparkles className="w-4 h-4" />}
                      className="shadow-lg hover:shadow-xl"
                    >
                      Remove Background
                    </Button>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <AnimatePresence>
        {processedImageUrl && (
          <ScaleIn>
            <Card variant="glass" className="overflow-hidden">
              <div className="flex border-b border-white/20">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <Tooltip key={tab.id} content={tab.disabled ? 'Complete previous step first' : `Switch to ${tab.name.toLowerCase()} view`}>
                      <motion.button
                        onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                        disabled={tab.disabled}
                        className={`
                          flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300
                          ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : tab.disabled
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                          }
                        `}
                        whileHover={!tab.disabled ? { scale: 1.02 } : {}}
                        whileTap={!tab.disabled ? { scale: 0.98 } : {}}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.name}
                      </motion.button>
                    </Tooltip>
                  )
                })}
              </div>
            </Card>
          </ScaleIn>
        )}
      </AnimatePresence>

      {/* Processing Status */}
      <AnimatePresence>
        {isProcessing && (
          <ProcessingAnimation
            isProcessing={isProcessing}
            progress={progress}
            message="AI is analyzing and removing the background..."
          />
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="bordered" className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-red-700">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <AlertCircle className="w-5 h-5" />
                  </motion.div>
                  <span className="font-medium">{error}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content based on active tab */}
      <TabTransition activeKey={activeTab}>
        {activeTab === 'process' && (
          <AdvancedImageComparison
            originalImageUrl={originalImageUrl}
            processedImageUrl={processedImageUrl}
            editedImageUrl={editedImageUrl}
            isProcessing={isProcessing}
          />
        )}

        {activeTab === 'edit' && processedImageUrl && (
          <ImageEditor
            originalImageUrl={originalImageUrl}
            processedImageUrl={processedImageUrl}
            onSave={handleImageEdited}
          />
        )}

        {activeTab === 'download' && (processedImageUrl || editedImageUrl) && (
          <DownloadPanel
            processedImageUrl={editedImageUrl || processedImageUrl}
            originalFileName={image.name}
            onDownload={handleDownload}
          />
        )}
      </TabTransition>

      {/* Batch Processor Modal */}
      {showBatchProcessor && (
        <BatchProcessor onClose={() => setShowBatchProcessor(false)} />
      )}
    </FadeIn>
  )
}
