'use client'

import { Scissors, Sparkles, Zap, Shield, Palette } from 'lucide-react'
import { motion } from 'framer-motion'
import { FadeIn, SlideIn, StaggerContainer, StaggerItem } from './ui/AnimatedContainer'

export default function Header() {
  return (
    <header className="text-center mb-16">
      <FadeIn delay={0.2}>
        <div className="glass-card rounded-3xl p-8 mb-8 mx-auto max-w-4xl">
          <SlideIn direction="down" delay={0.4}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Scissors className="w-8 h-8 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
                </motion.div>
              </motion.div>

              <motion.h1
                className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                BG Remover
              </motion.h1>
            </div>
          </SlideIn>

          <SlideIn direction="up" delay={0.8}>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8 font-medium">
              Transform your images with AI-powered background removal.
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                {" "}Professional quality, lightning fast, pixel perfect.
              </span>
            </p>
          </SlideIn>

          <StaggerContainer className="flex flex-wrap items-center justify-center gap-8 text-sm" staggerDelay={0.1}>
            <StaggerItem>
              <motion.div
                className="flex items-center gap-3 px-4 py-2 bg-green-50 rounded-full border border-green-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">High Resolution</span>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 font-medium">AI Powered</span>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-full border border-purple-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Palette className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700 font-medium">Multiple Formats</span>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full border border-gray-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Shield className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700 font-medium">Privacy First</span>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </FadeIn>
    </header>
  )
}
