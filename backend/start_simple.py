#!/usr/bin/env python3
"""
Startup script for the Simple BG Remover API server (without rembg)
"""

import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting Simple BG Remover API server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📖 API documentation at: http://localhost:8000/docs")
    print("🔄 Auto-reload enabled for development")
    print("⚠️  Using simple background removal (no AI models)")
    print("-" * 50)
    
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
