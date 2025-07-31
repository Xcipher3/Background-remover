"""
Image format optimization and smart format selection
"""

from PIL import Image
import io
from typing import Tuple, Dict, Any
import logging

logger = logging.getLogger(__name__)

class ImageFormatOptimizer:
    """
    Handles image format optimization and smart format selection
    """
    
    def __init__(self):
        self.format_configs = {
            'PNG': {
                'optimize': True,
                'compress_level': 6,  # Balance between size and speed
                'supports_transparency': True,
                'quality_range': None
            },
            'JPEG': {
                'optimize': True,
                'quality': 95,  # High quality for processed images
                'supports_transparency': False,
                'progressive': True
            },
            'WEBP': {
                'optimize': True,
                'quality': 95,
                'method': 6,  # Best compression
                'supports_transparency': True,
                'lossless': False
            }
        }
    
    def get_optimal_format(self, image: Image.Image, original_format: str = None) -> str:
        """
        Determine the optimal output format based on image characteristics
        """
        has_transparency = self._has_transparency(image)
        
        # If image has transparency, prefer PNG or WEBP
        if has_transparency:
            return 'PNG'  # PNG is more universally supported
        
        # For images without transparency, consider file size and quality
        if original_format and original_format.upper() in ['JPEG', 'JPG']:
            return 'JPEG'  # Maintain original format for photos
        
        # Default to PNG for best quality
        return 'PNG'
    
    def _has_transparency(self, image: Image.Image) -> bool:
        """
        Check if image has transparency
        """
        if image.mode in ('RGBA', 'LA'):
            return True
        
        if image.mode == 'P' and 'transparency' in image.info:
            return True
        
        return False
    
    def optimize_image(self, image: Image.Image, format: str, quality_level: str = 'high') -> Tuple[bytes, str]:
        """
        Optimize image for the specified format and quality level
        """
        format = format.upper()
        
        if format not in self.format_configs:
            raise ValueError(f"Unsupported format: {format}")
        
        config = self.format_configs[format].copy()
        
        # Adjust quality based on level
        if quality_level == 'ultra':
            if format == 'JPEG':
                config['quality'] = 98
            elif format == 'WEBP':
                config['quality'] = 98
                config['method'] = 6
        elif quality_level == 'high':
            # Use default high quality settings
            pass
        elif quality_level == 'medium':
            if format == 'JPEG':
                config['quality'] = 85
            elif format == 'WEBP':
                config['quality'] = 85
            elif format == 'PNG':
                config['compress_level'] = 9  # Higher compression
        elif quality_level == 'low':
            if format == 'JPEG':
                config['quality'] = 75
            elif format == 'WEBP':
                config['quality'] = 75
            elif format == 'PNG':
                config['compress_level'] = 9
        
        # Prepare image for format
        optimized_image = self._prepare_image_for_format(image, format)
        
        # Save with optimized settings
        output_buffer = io.BytesIO()
        
        try:
            if format == 'PNG':
                optimized_image.save(
                    output_buffer, 
                    format=format,
                    optimize=config['optimize'],
                    compress_level=config['compress_level']
                )
            elif format == 'JPEG':
                optimized_image.save(
                    output_buffer,
                    format=format,
                    optimize=config['optimize'],
                    quality=config['quality'],
                    progressive=config.get('progressive', False)
                )
            elif format == 'WEBP':
                optimized_image.save(
                    output_buffer,
                    format=format,
                    optimize=config['optimize'],
                    quality=config['quality'],
                    method=config['method'],
                    lossless=config.get('lossless', False)
                )
            
            output_buffer.seek(0)
            return output_buffer.getvalue(), format
            
        except Exception as e:
            logger.error(f"Error optimizing image for {format}: {e}")
            # Fallback to PNG
            output_buffer = io.BytesIO()
            png_image = self._prepare_image_for_format(image, 'PNG')
            png_image.save(output_buffer, format='PNG', optimize=True)
            output_buffer.seek(0)
            return output_buffer.getvalue(), 'PNG'
    
    def _prepare_image_for_format(self, image: Image.Image, format: str) -> Image.Image:
        """
        Prepare image for specific format requirements
        """
        format = format.upper()
        
        if format == 'JPEG':
            # JPEG doesn't support transparency
            if image.mode in ('RGBA', 'LA'):
                # Create white background
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'RGBA':
                    background.paste(image, mask=image.split()[-1])
                else:
                    background.paste(image)
                return background
            elif image.mode != 'RGB':
                return image.convert('RGB')
        
        elif format == 'PNG':
            # PNG supports all modes, but RGBA is preferred for transparency
            if self._has_transparency(image) and image.mode != 'RGBA':
                return image.convert('RGBA')
            elif not self._has_transparency(image) and image.mode not in ('RGB', 'L'):
                return image.convert('RGB')
        
        elif format == 'WEBP':
            # WEBP supports both RGB and RGBA
            if self._has_transparency(image) and image.mode != 'RGBA':
                return image.convert('RGBA')
            elif not self._has_transparency(image) and image.mode != 'RGB':
                return image.convert('RGB')
        
        return image
    
    def get_format_info(self, format: str) -> Dict[str, Any]:
        """
        Get information about a specific format
        """
        format = format.upper()
        if format in self.format_configs:
            return self.format_configs[format].copy()
        return {}
    
    def estimate_file_size(self, image: Image.Image, format: str, quality_level: str = 'high') -> int:
        """
        Estimate the file size for given format and quality
        """
        # This is a rough estimation based on image dimensions and format
        width, height = image.size
        pixels = width * height
        
        if format.upper() == 'PNG':
            # PNG size depends on image complexity, rough estimate
            if self._has_transparency(image):
                return int(pixels * 4 * 0.7)  # RGBA with compression
            else:
                return int(pixels * 3 * 0.7)  # RGB with compression
        
        elif format.upper() == 'JPEG':
            quality_multiplier = {
                'ultra': 0.8,
                'high': 0.6,
                'medium': 0.4,
                'low': 0.2
            }
            return int(pixels * 3 * quality_multiplier.get(quality_level, 0.6))
        
        elif format.upper() == 'WEBP':
            quality_multiplier = {
                'ultra': 0.7,
                'high': 0.5,
                'medium': 0.3,
                'low': 0.15
            }
            multiplier = quality_multiplier.get(quality_level, 0.5)
            if self._has_transparency(image):
                return int(pixels * 4 * multiplier)
            else:
                return int(pixels * 3 * multiplier)
        
        return int(pixels * 3)  # Default estimate
