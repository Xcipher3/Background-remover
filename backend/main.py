from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import rembg
from PIL import Image
import io
import numpy as np
import cv2
from typing import Optional
import logging
from image_processor import HighResImageProcessor
from format_optimizer import ImageFormatOptimizer
from image_classifier import ImageClassifier

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="BG Remover API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Available models
AVAILABLE_MODELS = {
    "u2net": "u2net",
    "u2net_human_seg": "u2net_human_seg",
    "silueta": "silueta",
    "isnet-general-use": "isnet-general-use"
}

# Initialize processors
image_processor = HighResImageProcessor()
format_optimizer = ImageFormatOptimizer()
image_classifier = ImageClassifier()

def enhance_image_quality(image: Image.Image) -> Image.Image:
    """
    Enhance image quality for better background removal results
    """
    # Convert to numpy array
    img_array = np.array(image)
    
    # Apply slight sharpening
    kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    sharpened = cv2.filter2D(img_array, -1, kernel)
    
    # Ensure we don't exceed valid pixel values
    sharpened = np.clip(sharpened, 0, 255)
    
    return Image.fromarray(sharpened.astype(np.uint8))

def post_process_result(result_image: Image.Image, original_image: Image.Image) -> Image.Image:
    """
    Post-process the result to maintain high quality
    """
    # Ensure the result maintains the original dimensions
    if result_image.size != original_image.size:
        result_image = result_image.resize(original_image.size, Image.Resampling.LANCZOS)
    
    # Apply edge smoothing to reduce artifacts
    result_array = np.array(result_image)
    
    if len(result_array.shape) == 4:  # RGBA
        # Smooth the alpha channel edges
        alpha = result_array[:, :, 3]
        alpha_smoothed = cv2.GaussianBlur(alpha, (3, 3), 0.5)
        result_array[:, :, 3] = alpha_smoothed
    
    return Image.fromarray(result_array)

@app.get("/")
async def root():
    return {"message": "BG Remover API is running"}

@app.get("/models")
async def get_available_models():
    """Get list of available background removal models"""
    return {
        "models": [
            {
                "id": "auto",
                "name": "Auto Select",
                "description": "Automatically choose the best model for your image",
                "recommended": True
            },
            {
                "id": "u2net",
                "name": "U²-Net",
                "description": "General purpose - Best for most images"
            },
            {
                "id": "u2net_human_seg",
                "name": "U²-Net Human",
                "description": "Optimized for people and portraits"
            },
            {
                "id": "silueta",
                "name": "Silueta",
                "description": "High accuracy for complex shapes"
            },
            {
                "id": "isnet-general-use",
                "name": "ISNet General",
                "description": "Latest model with improved quality"
            }
        ]
    }

@app.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    """Analyze image and get recommendations"""
    try:
        # Validate file type
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read and analyze the image
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data))

        # Get classification and recommendations
        classification = image_classifier.classify_image(pil_image)

        return {
            "analysis": classification,
            "recommended_model": classification["recommended_model"],
            "image_type": classification["type"],
            "confidence": classification["confidence"]
        }

    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

@app.post("/remove-background")
async def remove_background(
    image: UploadFile = File(...),
    model: str = Form(default="auto"),
    output_format: str = Form(default="auto"),
    quality: str = Form(default="high")
):
    """
    Remove background from uploaded image using specified model
    """
    try:
        # Validate file type
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read and process the image
        image_data = await image.read()
        original_image = Image.open(io.BytesIO(image_data))

        # Determine optimal model if auto is selected
        if model == "auto":
            selected_model = image_classifier.get_model_recommendation(original_image)
            logger.info(f"Auto-selected model: {selected_model}")
        else:
            selected_model = model

        # Validate selected model
        if selected_model not in AVAILABLE_MODELS:
            raise HTTPException(status_code=400, detail=f"Invalid model. Available models: {list(AVAILABLE_MODELS.keys())}")

        logger.info(f"Processing image with model: {selected_model}")

        # Preprocess image for high quality results
        processed_image = image_processor.preprocess_image(original_image)
        
        # Create rembg session with selected model
        session = rembg.new_session(AVAILABLE_MODELS[selected_model])
        
        # Convert processed image back to bytes for rembg
        img_byte_arr = io.BytesIO()
        processed_image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()

        # Remove background
        result_bytes = rembg.remove(img_byte_arr, session=session)

        # Load result and post-process with high-quality pipeline
        result_image = Image.open(io.BytesIO(result_bytes))
        result_image = image_processor.postprocess_result(result_image, original_image)

        # Determine optimal output format
        if output_format == "auto":
            optimal_format = format_optimizer.get_optimal_format(result_image, image.filename)
        else:
            optimal_format = output_format.upper()

        # Optimize image for the selected format
        optimized_bytes, final_format = format_optimizer.optimize_image(
            result_image,
            optimal_format,
            quality
        )

        # Determine content type
        content_type_map = {
            'PNG': 'image/png',
            'JPEG': 'image/jpeg',
            'WEBP': 'image/webp'
        }
        content_type = content_type_map.get(final_format, 'image/png')
        
        logger.info("Background removal completed successfully")
        
        return StreamingResponse(
            io.BytesIO(optimized_bytes),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename=result.{final_format.lower()}"}
        )
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
