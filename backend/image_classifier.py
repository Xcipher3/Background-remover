"""
Image classification for automatic model selection based on image content
"""

import numpy as np
from PIL import Image
import cv2
from typing import Dict, Tuple, List
import logging

logger = logging.getLogger(__name__)

class ImageClassifier:
    """
    Classifies images to determine the best processing approach
    """
    
    def __init__(self):
        self.image_types = {
            'portrait': {
                'models': ['u2net_human_seg', 'u2net'],
                'description': 'Human portraits and people'
            },
            'product': {
                'models': ['silueta', 'u2net'],
                'description': 'Product photos and objects'
            },
            'artistic': {
                'models': ['isnet-general-use', 'u2net'],
                'description': 'Artistic images and complex scenes'
            },
            'general': {
                'models': ['u2net'],
                'description': 'General purpose images'
            }
        }
    
    def classify_image(self, image: Image.Image) -> Dict[str, any]:
        """
        Classify image and recommend the best model
        """
        # Convert to numpy array for analysis
        img_array = np.array(image.convert('RGB'))
        
        # Analyze image characteristics
        characteristics = self._analyze_image_characteristics(img_array)
        
        # Determine image type based on characteristics
        image_type = self._determine_image_type(characteristics)
        
        # Get recommended model
        recommended_model = self.image_types[image_type]['models'][0]
        
        return {
            'type': image_type,
            'recommended_model': recommended_model,
            'alternative_models': self.image_types[image_type]['models'][1:],
            'confidence': characteristics['confidence'],
            'characteristics': characteristics,
            'description': self.image_types[image_type]['description']
        }
    
    def _analyze_image_characteristics(self, img_array: np.ndarray) -> Dict[str, any]:
        """
        Analyze image characteristics to help with classification
        """
        height, width = img_array.shape[:2]
        
        # Aspect ratio analysis
        aspect_ratio = width / height
        
        # Color analysis
        color_stats = self._analyze_colors(img_array)
        
        # Edge analysis
        edge_stats = self._analyze_edges(img_array)
        
        # Face detection (simple approach)
        face_stats = self._detect_faces_simple(img_array)
        
        # Object detection hints
        object_stats = self._analyze_objects(img_array)
        
        # Complexity analysis
        complexity = self._analyze_complexity(img_array)
        
        return {
            'aspect_ratio': aspect_ratio,
            'dimensions': (width, height),
            'color_stats': color_stats,
            'edge_stats': edge_stats,
            'face_stats': face_stats,
            'object_stats': object_stats,
            'complexity': complexity,
            'confidence': 0.8  # Base confidence
        }
    
    def _analyze_colors(self, img_array: np.ndarray) -> Dict[str, any]:
        """
        Analyze color distribution and characteristics
        """
        # Convert to different color spaces for analysis
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
        
        # Calculate color statistics
        mean_rgb = np.mean(img_array, axis=(0, 1))
        std_rgb = np.std(img_array, axis=(0, 1))
        
        # Skin tone detection (rough approximation)
        skin_mask = self._detect_skin_tones(img_array)
        skin_percentage = np.sum(skin_mask) / (img_array.shape[0] * img_array.shape[1])
        
        # Color diversity
        unique_colors = len(np.unique(img_array.reshape(-1, 3), axis=0))
        color_diversity = unique_colors / (img_array.shape[0] * img_array.shape[1])
        
        return {
            'mean_rgb': mean_rgb.tolist(),
            'std_rgb': std_rgb.tolist(),
            'skin_percentage': skin_percentage,
            'color_diversity': color_diversity,
            'dominant_hue': np.mean(hsv[:, :, 0])
        }
    
    def _analyze_edges(self, img_array: np.ndarray) -> Dict[str, any]:
        """
        Analyze edge characteristics
        """
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Canny edge detection
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
        
        # Sobel gradients for texture analysis
        sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
        
        return {
            'edge_density': edge_density,
            'mean_gradient': np.mean(gradient_magnitude),
            'gradient_std': np.std(gradient_magnitude)
        }
    
    def _detect_faces_simple(self, img_array: np.ndarray) -> Dict[str, any]:
        """
        Simple face detection using basic image analysis
        """
        # This is a simplified approach - in production, you might use
        # more sophisticated face detection libraries
        
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        height, width = gray.shape
        
        # Look for face-like characteristics
        # Check for oval/circular regions with skin tones
        skin_mask = self._detect_skin_tones(img_array)
        
        # Simple heuristic: if significant skin tones in upper portion
        upper_half = skin_mask[:height//2, :]
        upper_skin_percentage = np.sum(upper_half) / (upper_half.shape[0] * upper_half.shape[1])
        
        # Estimate face probability based on skin distribution and image characteristics
        face_probability = min(upper_skin_percentage * 2, 1.0)
        
        return {
            'face_probability': face_probability,
            'upper_skin_percentage': upper_skin_percentage,
            'likely_portrait': face_probability > 0.3
        }
    
    def _detect_skin_tones(self, img_array: np.ndarray) -> np.ndarray:
        """
        Detect skin tones in the image
        """
        # Convert to YCrCb color space for better skin detection
        ycrcb = cv2.cvtColor(img_array, cv2.COLOR_RGB2YCrCb)
        
        # Define skin color range in YCrCb
        lower_skin = np.array([0, 133, 77], dtype=np.uint8)
        upper_skin = np.array([255, 173, 127], dtype=np.uint8)
        
        # Create mask for skin colors
        skin_mask = cv2.inRange(ycrcb, lower_skin, upper_skin)
        
        # Apply morphological operations to clean up the mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
        
        return skin_mask > 0
    
    def _analyze_objects(self, img_array: np.ndarray) -> Dict[str, any]:
        """
        Analyze for object-like characteristics
        """
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Look for geometric shapes and patterns
        # This is a simplified approach
        
        # Contour analysis
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Analyze contour characteristics
        large_contours = [c for c in contours if cv2.contourArea(c) > 1000]
        geometric_shapes = 0
        
        for contour in large_contours:
            # Approximate contour to polygon
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            
            # Count geometric shapes (triangles, rectangles, etc.)
            if len(approx) >= 3 and len(approx) <= 8:
                geometric_shapes += 1
        
        return {
            'contour_count': len(contours),
            'large_contour_count': len(large_contours),
            'geometric_shapes': geometric_shapes,
            'object_likelihood': min(geometric_shapes / max(len(large_contours), 1), 1.0)
        }
    
    def _analyze_complexity(self, img_array: np.ndarray) -> Dict[str, any]:
        """
        Analyze image complexity
        """
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Calculate image entropy (measure of information content)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = hist.flatten()
        hist = hist[hist > 0]  # Remove zero entries
        entropy = -np.sum(hist * np.log2(hist / np.sum(hist)))
        
        # Texture analysis using Local Binary Patterns (simplified)
        texture_score = np.std(gray)
        
        # Detail level based on high-frequency content
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        detail_score = np.var(laplacian)
        
        return {
            'entropy': entropy,
            'texture_score': texture_score,
            'detail_score': detail_score,
            'complexity_level': 'high' if entropy > 6 else 'medium' if entropy > 4 else 'low'
        }
    
    def _determine_image_type(self, characteristics: Dict[str, any]) -> str:
        """
        Determine image type based on analyzed characteristics
        """
        face_stats = characteristics['face_stats']
        object_stats = characteristics['object_stats']
        complexity = characteristics['complexity']
        color_stats = characteristics['color_stats']
        
        # Portrait detection
        if (face_stats['likely_portrait'] and 
            face_stats['face_probability'] > 0.4 and
            color_stats['skin_percentage'] > 0.15):
            return 'portrait'
        
        # Product detection
        if (object_stats['object_likelihood'] > 0.6 and
            object_stats['geometric_shapes'] > 0 and
            complexity['complexity_level'] in ['low', 'medium']):
            return 'product'
        
        # Artistic/complex image detection
        if (complexity['complexity_level'] == 'high' and
            complexity['entropy'] > 6.5):
            return 'artistic'
        
        # Default to general
        return 'general'
    
    def get_model_recommendation(self, image: Image.Image, user_preference: str = None) -> str:
        """
        Get model recommendation with optional user preference override
        """
        classification = self.classify_image(image)
        
        if user_preference and user_preference in ['u2net', 'u2net_human_seg', 'silueta', 'isnet-general-use']:
            return user_preference
        
        return classification['recommended_model']
