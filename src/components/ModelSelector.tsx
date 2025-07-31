'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
  disabled?: boolean
}

const models = [
  {
    id: 'auto',
    name: 'Auto Select',
    description: 'Automatically choose the best model',
    recommended: true
  },
  {
    id: 'u2net',
    name: 'U²-Net',
    description: 'General purpose - Best for most images'
  },
  {
    id: 'u2net_human_seg',
    name: 'U²-Net Human',
    description: 'Optimized for people and portraits'
  },
  {
    id: 'silueta',
    name: 'Silueta',
    description: 'High accuracy for complex shapes'
  },
  {
    id: 'isnet-general-use',
    name: 'ISNet General',
    description: 'Latest model with improved quality'
  }
]

export default function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedModelData = models.find(m => m.id === selectedModel) || models[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {selectedModelData.name}
            {selectedModelData.recommended && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                Recommended
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">{selectedModelData.description}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id)
                setIsOpen(false)
              }}
              className={`
                w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg
                ${model.id === selectedModel ? 'bg-blue-50 border-l-2 border-blue-500' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {model.name}
                  </div>
                  <div className="text-xs text-gray-500">{model.description}</div>
                </div>
                {model.recommended && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
