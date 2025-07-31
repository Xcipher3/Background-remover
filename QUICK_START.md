# 🚀 Quick Start Guide - BG Remover

## What You've Got

A professional-grade background removal web application with:

- **High-Quality AI Processing**: Multiple AI models for different image types
- **Smart Auto-Detection**: Automatically selects the best model for your image
- **Crisp Results**: Maintains image quality even when zoomed in
- **Modern UI**: Drag-and-drop interface with zoom and comparison features
- **Multiple Formats**: Supports PNG, JPG, JPEG, WEBP

## 🏃‍♂️ Quick Setup (3 Steps)

### Step 1: Install Dependencies
```bash
setup.bat
```
This installs both Python and Node.js dependencies.

### Step 2: Start the Backend
```bash
start-backend.bat
```
This starts the AI processing server on http://localhost:8000

### Step 3: Start the Frontend
```bash
start-frontend.bat
```
This starts the web interface on http://localhost:3000

## 🎯 How to Use

1. **Open your browser** → http://localhost:3000
2. **Upload an image** (drag & drop or click)
3. **Choose a model** (or use "Auto Select")
4. **Click "Remove Background"**
5. **Use zoom controls** to inspect quality
6. **Download** your result

## 🤖 AI Models Available

- **Auto Select** ⭐ - Automatically picks the best model
- **U²-Net** - General purpose, works great for most images
- **U²-Net Human** - Optimized for people and portraits
- **Silueta** - High accuracy for complex shapes and objects
- **ISNet General** - Latest model with improved edge quality

## 🧪 Test Everything

Run the test script to make sure everything works:
```bash
test-app.bat
```

## 🔧 Troubleshooting

**Backend won't start?**
- Make sure Python 3.8+ is installed
- Check that port 8000 is available

**Frontend won't start?**
- Make sure Node.js 16+ is installed
- Check that port 3000 is available

**Processing fails?**
- First run downloads AI models (can take a few minutes)
- Make sure you have enough disk space (models are ~100MB each)

**Image quality issues?**
- Try different models for your image type
- Use "Auto Select" for best results
- Check that your input image is high quality

## 📁 Project Structure

```
bgremover/
├── src/                    # React frontend
├── backend/               # Python API
├── setup.bat             # One-click setup
├── start-backend.bat     # Start AI server
├── start-frontend.bat    # Start web interface
└── test-app.bat         # Test everything
```

## 🎨 Features Highlights

### High-Quality Processing
- Maintains original image resolution
- Advanced edge smoothing
- Multiple quality levels
- Smart format optimization

### Smart AI Selection
- Automatic image type detection
- Model recommendation based on content
- Portrait detection for people photos
- Object detection for product images

### Professional UI
- Drag-and-drop upload
- Side-by-side comparison
- Zoom and pan functionality
- Progress tracking
- Download optimization

## 🚀 Ready to Go!

Your background removal app is ready! The setup creates a production-quality application that can handle:

- Profile pictures
- Product photos  
- Artistic images
- Complex backgrounds
- High-resolution images

Just run the setup and start scripts, then open http://localhost:3000 to begin removing backgrounds with professional quality results!
