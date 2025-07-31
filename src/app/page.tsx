'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ImageUploader from '@/components/ImageUploader'
import ImageProcessor from '@/components/ImageProcessor'
import Header from '@/components/Header'
import { FadeIn, SlideIn } from '@/components/ui/AnimatedContainer'

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImageUpload = (file: File) => {
    setUploadedImage(file)
    setProcessedImageUrl(null)
  }

  const handleImageProcessed = (imageUrl: string) => {
    setProcessedImageUrl(imageUrl)
    setIsProcessing(false)
  }

  const handleProcessingStart = () => {
    setIsProcessing(true)
  }

  const handleReset = () => {
    setUploadedImage(null)
    setProcessedImageUrl(null)
    setIsProcessing(false)
  }

  return (
    <main className="container mx-auto px-4 py-8 relative z-10">
      <Header />

      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!uploadedImage ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center"
            >
              <SlideIn direction="up" delay={0.2}>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to transform your images?
                </h2>
                <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                  Upload an image and watch our AI work its magic
                </p>
              </SlideIn>
              <ImageUploader onImageUpload={handleImageUpload} />
            </motion.div>
          ) : (
            <motion.div
              key="processor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <ImageProcessor
                image={uploadedImage}
                processedImageUrl={processedImageUrl}
                isProcessing={isProcessing}
                onProcessingStart={handleProcessingStart}
                onImageProcessed={handleImageProcessed}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
