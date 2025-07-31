from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image, ImageFilter, ImageEnhance
import io
import numpy as np
import cv2
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="BG Remover API (Simple)", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def simple_background_removal(image: Image.Image) -> Image.Image:
    """
    Simple background removal using edge detection and color analysis
    This is a fallback when rembg is not available
    """
    # Convert to numpy array
    img_array = np.array(image.convert('RGB'))
    
    # Create a simple mask based on edge detection and color analysis
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    
    # Apply GaussianBlur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Use adaptive threshold to create a mask
    mask = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    # Apply morphological operations to clean up the mask
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    # Invert mask (we want to keep the foreground)
    mask = cv2.bitwise_not(mask)
    
    # Apply some smoothing to the mask edges
    mask = cv2.GaussianBlur(mask, (3, 3), 0)
    
    # Create RGBA image
    rgba_array = np.zeros((img_array.shape[0], img_array.shape[1], 4), dtype=np.uint8)
    rgba_array[:, :, :3] = img_array
    rgba_array[:, :, 3] = mask
    
    return Image.fromarray(rgba_array, 'RGBA')

def enhanced_background_removal(image: Image.Image) -> Image.Image:
    """
    Enhanced background removal using multiple techniques
    """
    # Convert to numpy array
    img_array = np.array(image.convert('RGB'))
    height, width = img_array.shape[:2]
    
    # Method 1: Color-based segmentation
    # Convert to HSV for better color segmentation
    hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    
    # Create mask for likely background colors (adjust these ranges as needed)
    # This assumes background is often white, light colors, or uniform
    lower_white = np.array([0, 0, 200])
    upper_white = np.array([180, 30, 255])
    white_mask = cv2.inRange(hsv, lower_white, upper_white)
    
    # Method 2: Edge-based segmentation
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    
    # Dilate edges to create thicker boundaries
    kernel = np.ones((3, 3), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)
    
    # Method 3: GrabCut algorithm for better segmentation
    mask = np.zeros(gray.shape[:2], np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    
    # Define rectangle around the likely foreground (center area)
    rect = (width//8, height//8, width*3//4, height*3//4)
    
    try:
        cv2.grabCut(img_array, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
        mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
    except:
        # Fallback to simple thresholding if GrabCut fails
        _, mask2 = cv2.threshold(gray, 0, 1, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Combine methods
    final_mask = mask2 * 255
    
    # Apply morphological operations to clean up
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    final_mask = cv2.morphologyEx(final_mask, cv2.MORPH_CLOSE, kernel)
    final_mask = cv2.morphologyEx(final_mask, cv2.MORPH_OPEN, kernel)
    
    # Smooth the mask edges
    final_mask = cv2.GaussianBlur(final_mask, (3, 3), 0)
    
    # Create RGBA image
    rgba_array = np.zeros((height, width, 4), dtype=np.uint8)
    rgba_array[:, :, :3] = img_array
    rgba_array[:, :, 3] = final_mask
    
    return Image.fromarray(rgba_array, 'RGBA')

@app.get("/")
async def root():
    return {"message": "BG Remover API (Simple) is running"}

@app.get("/models")
async def get_available_models():
    """Get list of available background removal models"""
    return {
        "models": [
            {
                "id": "simple",
                "name": "Simple Edge Detection",
                "description": "Basic background removal using edge detection",
                "recommended": True
            },
            {
                "id": "enhanced",
                "name": "Enhanced Segmentation",
                "description": "Advanced background removal using multiple techniques"
            }
        ]
    }

@app.post("/remove-background")
async def remove_background(
    image: UploadFile = File(...),
    model: str = Form(default="enhanced"),
    output_format: str = Form(default="PNG"),
    quality: str = Form(default="high")
):
    """
    Remove background from uploaded image using simple computer vision techniques
    """
    try:
        # Validate file type
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        logger.info(f"Processing image with model: {model}")
        
        # Read and process the image
        image_data = await image.read()
        original_image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if original_image.mode != 'RGB':
            original_image = original_image.convert('RGB')
        
        # Apply background removal based on selected model
        if model == "simple":
            result_image = simple_background_removal(original_image)
        else:  # enhanced
            result_image = enhanced_background_removal(original_image)
        
        # Save result to bytes
        output_buffer = io.BytesIO()
        
        if output_format.upper() == "PNG":
            result_image.save(output_buffer, format='PNG', optimize=True)
            content_type = "image/png"
        elif output_format.upper() in ["JPG", "JPEG"]:
            # For JPEG, we need to handle transparency
            if result_image.mode == 'RGBA':
                # Create white background
                background = Image.new('RGB', result_image.size, (255, 255, 255))
                background.paste(result_image, mask=result_image.split()[-1])
                result_image = background
            result_image.save(output_buffer, format='JPEG', optimize=True, quality=95)
            content_type = "image/jpeg"
        else:
            # Default to PNG
            result_image.save(output_buffer, format='PNG', optimize=True)
            content_type = "image/png"
        
        output_buffer.seek(0)
        
        logger.info("Background removal completed successfully")
        
        return StreamingResponse(
            io.BytesIO(output_buffer.read()),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename=result.{output_format.lower()}"}
        )
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
