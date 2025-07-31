"""
High-resolution image processing pipeline for maintaining quality
"""

import numpy as np
import cv2
from PIL import Image, ImageFilter, ImageEnhance
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class HighResImageProcessor:
    """
    Advanced image processor that maintains high quality and resolution
    """
    
    def __init__(self):
        self.max_dimension = 4096  # Maximum dimension for processing
        self.quality_threshold = 0.95  # Quality threshold for processing
    
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image to enhance quality before background removal
        """
        logger.info(f"Preprocessing image of size: {image.size}")
        
        # Convert to RGB if necessary
        if image.mode not in ['RGB', 'RGBA']:
            image = image.convert('RGB')
        
        # Store original size
        original_size = image.size
        
        # Resize if too large while maintaining aspect ratio
        if max(original_size) > self.max_dimension:
            ratio = self.max_dimension / max(original_size)
            new_size = (int(original_size[0] * ratio), int(original_size[1] * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
            logger.info(f"Resized image to: {new_size}")
        
        # Enhance image quality
        image = self._enhance_quality(image)
        
        return image
    
    def _enhance_quality(self, image: Image.Image) -> Image.Image:
        """
        Apply quality enhancements to improve background removal results
        """
        # Convert to numpy for processing
        img_array = np.array(image)
        
        # Apply noise reduction
        img_array = cv2.bilateralFilter(img_array, 9, 75, 75)
        
        # Enhance contrast slightly
        enhancer = ImageEnhance.Contrast(Image.fromarray(img_array))
        enhanced = enhancer.enhance(1.1)
        
        # Apply subtle sharpening
        enhanced = enhanced.filter(ImageFilter.UnsharpMask(radius=1, percent=120, threshold=3))
        
        return enhanced
    
    def postprocess_result(self, result: Image.Image, original: Image.Image) -> Image.Image:
        """
        Post-process the background removal result to maintain high quality
        """
        logger.info("Post-processing result image")
        
        # Ensure result matches original dimensions
        if result.size != original.size:
            result = result.resize(original.size, Image.Resampling.LANCZOS)
        
        # Convert to numpy for advanced processing
        result_array = np.array(result)
        
        if len(result_array.shape) == 4:  # RGBA image
            # Smooth alpha channel to reduce jagged edges
            alpha = result_array[:, :, 3]
            alpha_smoothed = self._smooth_alpha_channel(alpha)
            result_array[:, :, 3] = alpha_smoothed
            
            # Apply edge refinement
            result_array = self._refine_edges(result_array)
        
        return Image.fromarray(result_array)
    
    def _smooth_alpha_channel(self, alpha: np.ndarray) -> np.ndarray:
        """
        Smooth the alpha channel to reduce artifacts
        """
        # Apply Gaussian blur to smooth edges
        smoothed = cv2.GaussianBlur(alpha, (3, 3), 0.8)
        
        # Apply morphological operations to clean up the mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        smoothed = cv2.morphologyEx(smoothed, cv2.MORPH_CLOSE, kernel)
        smoothed = cv2.morphologyEx(smoothed, cv2.MORPH_OPEN, kernel)
        
        return smoothed
    
    def _refine_edges(self, image_array: np.ndarray) -> np.ndarray:
        """
        Refine edges to improve quality
        """
        # Extract alpha channel
        alpha = image_array[:, :, 3]
        
        # Find edges in alpha channel
        edges = cv2.Canny(alpha, 50, 150)
        
        # Dilate edges slightly
        kernel = np.ones((2, 2), np.uint8)
        edges = cv2.dilate(edges, kernel, iterations=1)
        
        # Apply anti-aliasing to edge pixels
        edge_mask = edges > 0
        if np.any(edge_mask):
            # Smooth the RGB channels near edges
            for channel in range(3):
                channel_data = image_array[:, :, channel]
                smoothed_channel = cv2.GaussianBlur(channel_data, (3, 3), 0.5)
                image_array[:, :, channel] = np.where(edge_mask, smoothed_channel, channel_data)
        
        return image_array
    
    def optimize_for_web(self, image: Image.Image, format: str = 'PNG') -> Image.Image:
        """
        Optimize image for web delivery while maintaining quality
        """
        if format.upper() == 'PNG':
            # For PNG, ensure we have RGBA mode for transparency
            if image.mode != 'RGBA':
                image = image.convert('RGBA')
        elif format.upper() in ['JPG', 'JPEG']:
            # For JPEG, convert to RGB and add white background
            if image.mode == 'RGBA':
                # Create white background
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1])  # Use alpha as mask
                image = background
            elif image.mode != 'RGB':
                image = image.convert('RGB')
        
        return image
    
    def get_optimal_dimensions(self, original_size: Tuple[int, int], target_quality: str = 'high') -> Tuple[int, int]:
        """
        Calculate optimal dimensions based on quality requirements
        """
        width, height = original_size
        
        if target_quality == 'ultra':
            # Maintain original size up to 8K
            max_dim = 8192
        elif target_quality == 'high':
            # Maintain original size up to 4K
            max_dim = 4096
        elif target_quality == 'medium':
            # Limit to 2K
            max_dim = 2048
        else:  # 'low'
            # Limit to 1K
            max_dim = 1024
        
        if max(width, height) <= max_dim:
            return original_size
        
        # Calculate new dimensions maintaining aspect ratio
        ratio = max_dim / max(width, height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        
        return (new_width, new_height)
