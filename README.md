# BG Remover - High Quality Background Removal

A modern web application that removes backgrounds from images using AI while maintaining high image quality and crisp details. Perfect for profile pictures, product photos, and artistic images.

## ✨ Features

### 🎯 Core Features
- **High-Quality Output**: Maintains image sharpness and clarity when zoomed in
- **Smart AI Selection**: Automatically detects image type and selects optimal model
- **Multiple AI Models**: U²-Net, Silueta, ISNet for different image types
- **Multiple Formats**: Supports PNG, JPG, JPEG, WEBP input/output formats
- **Local Processing**: Runs entirely on localhost for privacy

### 🎨 Advanced Editing
- **Image Editor**: Brightness, contrast, saturation, hue adjustments
- **Background Replacement**: Solid colors, gradients, or transparent
- **Filter Effects**: Vintage, dramatic, soft, black & white presets
- **Real-time Preview**: See changes instantly with live canvas rendering

### 🔍 Professional UI
- **Advanced Zoom Controls**: Up to 400% zoom with smooth pan and keyboard shortcuts
- **Multiple View Modes**: Side-by-side, overlay, and split-screen comparison
- **Interactive Tools**: Click and drag to pan, keyboard shortcuts for efficiency
- **Progress Tracking**: Real-time processing progress with detailed feedback

### 📦 Batch Processing
- **Multi-Image Upload**: Process dozens of images simultaneously
- **Queue Management**: Pause, resume, and monitor batch operations
- **Smart Downloads**: Download all processed images or individual files
- **Format Consistency**: Apply same settings across entire batch

### 💾 Smart Downloads
- **Multiple Formats**: PNG, JPG, WEBP with quality control
- **Custom Filenames**: Personalize output file names
- **Size Optimization**: Intelligent compression while maintaining quality
- **Quick Downloads**: One-click PNG/JPG export options

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Installation

1. **Clone or download this repository**
2. **Run the setup script**:
   ```bash
   setup.bat
   ```

### Running the Application

1. **Start the backend** (in one terminal):
   ```bash
   start-backend.bat
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   start-frontend.bat
   ```

3. **Open your browser** and go to: `http://localhost:3000`

## 🎯 Usage

### Single Image Processing
1. **Upload an image** by dragging and dropping or clicking to select
2. **Choose processing mode**:
   - **Auto Select** ⭐ - Automatically picks the best AI model
   - **Manual Selection** - Choose specific model for your needs
3. **Click "Remove Background"** to process your image
4. **Use advanced viewing tools**:
   - Zoom up to 400% to inspect quality
   - Switch between side-by-side, overlay, and split views
   - Use keyboard shortcuts (+, -, 0, Space)

### Image Editing (NEW!)
5. **Switch to Edit tab** to enhance your processed image:
   - Adjust brightness, contrast, saturation, hue
   - Apply filter presets (Vintage, Dramatic, Soft, B&W)
   - Replace background with colors or gradients
   - Real-time preview with professional controls

### Smart Downloads (NEW!)
6. **Switch to Download tab** for advanced export options:
   - Choose format: PNG (transparency), JPG (smaller), WEBP (modern)
   - Select quality level: Ultra, High, Medium, Low
   - Customize filename or use auto-generated names
   - Quick download buttons for instant PNG/JPG export

### Batch Processing (NEW!)
7. **Click "Batch Process"** to handle multiple images:
   - Upload multiple images at once
   - Apply consistent settings across all images
   - Monitor progress with queue management
   - Download all processed images together

## 🔧 Technology Stack

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **React Dropzone** for file uploads
- **Lucide React** for icons

### Backend
- **FastAPI** for high-performance API
- **REMBG** library with multiple AI models
- **OpenCV** and **Pillow** for image processing
- **Uvicorn** ASGI server

## 📁 Project Structure

```
bgremover/
├── src/                    # Frontend source code
│   ├── app/               # Next.js app directory
│   └── components/        # React components
├── backend/               # Python backend
│   ├── main.py           # FastAPI application
│   ├── start.py          # Server startup script
│   └── requirements.txt  # Python dependencies
├── setup.bat             # Setup script
├── start-backend.bat     # Backend startup script
├── start-frontend.bat    # Frontend startup script
└── README.md            # This file
```

## 🎨 AI Models

The application includes multiple AI models for different use cases:

- **U²-Net**: Best general-purpose model for most images
- **U²-Net Human Segmentation**: Specialized for portraits and people
- **Silueta**: High-accuracy model for complex shapes and objects
- **ISNet General Use**: Latest model with improved edge detection

## 🔍 Image Quality Features

- **High-Resolution Processing**: Maintains original image dimensions
- **Edge Smoothing**: Reduces artifacts around object edges
- **Quality Enhancement**: Pre-processing to improve results
- **Format Optimization**: Smart output format selection
- **Zoom Functionality**: Inspect results at pixel level

## 🛠️ Development

### Manual Setup (Alternative to setup.bat)

1. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # On Windows
   pip install -r requirements.txt
   ```

2. **Frontend Setup**:
   ```bash
   npm install
   ```

### API Documentation

When the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Make sure ports 3000 and 8000 are available
2. **Python dependencies**: Ensure you have Python 3.8+ installed
3. **Node.js issues**: Make sure you have Node.js 16+ installed
4. **Model download**: First run may take longer as AI models are downloaded

### Support

If you encounter any issues, please check the console output for error messages and ensure all dependencies are properly installed.
