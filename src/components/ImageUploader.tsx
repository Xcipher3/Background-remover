'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, AlertCircle, Sparkles, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { FadeIn, ScaleIn } from './ui/AnimatedContainer'

interface ImageUploaderProps {
  onImageUpload: (file: File) => void
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)
    
    if (rejectedFiles.length > 0) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP)')
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      onImageUpload(file)
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  return (
    <FadeIn className="w-full max-w-3xl mx-auto">
      <Card variant="glass" className="overflow-hidden">
        <motion.div
          {...getRootProps()}
          className={`
            relative p-16 text-center cursor-pointer transition-all duration-500 ease-out
            ${isDragActive
              ? 'bg-gradient-to-br from-blue-50 to-purple-50'
              : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input {...getInputProps()} />

          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200/30 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.6, 0.3, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              {isDragActive ? (
                <motion.div
                  key="active"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Upload className="w-20 h-20 text-blue-500" />
                  </motion.div>
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="inactive"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                    <ImageIcon className="w-16 h-16 text-blue-600" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <motion.h3
                className="text-2xl font-bold text-gray-800"
                animate={{ opacity: isDragActive ? [0.7, 1, 0.7] : 1 }}
                transition={{ duration: 1, repeat: isDragActive ? Infinity : 0 }}
              >
                {isDragActive ? 'Drop your image here!' : 'Upload an image to get started'}
              </motion.h3>

              <p className="text-lg text-gray-600 max-w-md mx-auto">
                {isDragActive
                  ? 'Release to upload your image'
                  : 'Drag and drop an image, or click to browse your files'
                }
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">PNG</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">JPG</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">WEBP</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">Max 10MB</span>
              </div>
            </div>

            <Button
              size="lg"
              className="px-8 py-4 text-lg font-semibold shadow-lg"
              icon={<Upload className="w-5 h-5" />}
            >
              Choose Files
            </Button>
          </div>
        </motion.div>
      </Card>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="bordered" className="mt-6 border-red-200 bg-red-50">
              <div className="p-4 flex items-center gap-3 text-red-700">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <AlertCircle className="w-5 h-5" />
                </motion.div>
                <span className="font-medium">{error}</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </FadeIn>
  )
}
