"""
Image storage system for persistent image management
"""

import os
import json
import uuid
import shutil
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class ImageStorage:
    """
    Handles persistent storage of images and their metadata
    """
    
    def __init__(self, storage_dir: str = "stored_images"):
        self.storage_dir = Path(storage_dir)
        self.metadata_file = self.storage_dir / "metadata.json"
        self.images_dir = self.storage_dir / "images"
        self.thumbnails_dir = self.storage_dir / "thumbnails"
        
        # Create directories if they don't exist
        self.storage_dir.mkdir(exist_ok=True)
        self.images_dir.mkdir(exist_ok=True)
        self.thumbnails_dir.mkdir(exist_ok=True)
        
        # Initialize metadata file
        if not self.metadata_file.exists():
            self._save_metadata({})
    
    def _load_metadata(self) -> Dict:
        """Load metadata from JSON file"""
        try:
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _save_metadata(self, metadata: Dict):
        """Save metadata to JSON file"""
        with open(self.metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2, default=str)
    
    def store_image(self, image_data: bytes, filename: str, image_type: str = "original", 
                   parent_id: str = None, metadata: Dict = None) -> str:
        """
        Store an image and return its unique ID
        
        Args:
            image_data: Raw image bytes
            filename: Original filename
            image_type: Type of image (original, processed, edited)
            parent_id: ID of parent image (for processed/edited versions)
            metadata: Additional metadata
        
        Returns:
            Unique image ID
        """
        image_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Determine file extension
        ext = Path(filename).suffix.lower()
        if not ext:
            ext = '.png'  # Default extension
        
        # Save image file
        image_path = self.images_dir / f"{image_id}{ext}"
        with open(image_path, 'wb') as f:
            f.write(image_data)
        
        # Create thumbnail
        thumbnail_path = self._create_thumbnail(image_path, image_id)
        
        # Prepare metadata
        image_metadata = {
            "id": image_id,
            "filename": filename,
            "original_filename": filename,
            "type": image_type,
            "parent_id": parent_id,
            "file_path": str(image_path),
            "thumbnail_path": str(thumbnail_path) if thumbnail_path else None,
            "file_size": len(image_data),
            "created_at": timestamp,
            "updated_at": timestamp,
            "metadata": metadata or {}
        }
        
        # Load existing metadata and add new entry
        all_metadata = self._load_metadata()
        all_metadata[image_id] = image_metadata
        self._save_metadata(all_metadata)
        
        logger.info(f"Stored image {image_id} ({image_type})")
        return image_id
    
    def _create_thumbnail(self, image_path: Path, image_id: str) -> Optional[Path]:
        """Create a thumbnail for the image"""
        try:
            from PIL import Image
            
            with Image.open(image_path) as img:
                # Create thumbnail (max 200x200)
                img.thumbnail((200, 200), Image.Resampling.LANCZOS)
                
                thumbnail_path = self.thumbnails_dir / f"{image_id}_thumb.jpg"
                
                # Convert to RGB if necessary for JPEG
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Create white background
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    if img.mode in ('RGBA', 'LA'):
                        background.paste(img, mask=img.split()[-1])
                    img = background
                
                img.save(thumbnail_path, 'JPEG', quality=85)
                return thumbnail_path
                
        except Exception as e:
            logger.error(f"Failed to create thumbnail for {image_id}: {e}")
            return None
    
    def get_image(self, image_id: str) -> Optional[Dict]:
        """Get image metadata by ID"""
        metadata = self._load_metadata()
        return metadata.get(image_id)
    
    def get_image_data(self, image_id: str) -> Optional[bytes]:
        """Get raw image data by ID"""
        image_info = self.get_image(image_id)
        if not image_info:
            return None
        
        try:
            with open(image_info['file_path'], 'rb') as f:
                return f.read()
        except FileNotFoundError:
            logger.error(f"Image file not found: {image_info['file_path']}")
            return None
    
    def get_thumbnail_data(self, image_id: str) -> Optional[bytes]:
        """Get thumbnail data by ID"""
        image_info = self.get_image(image_id)
        if not image_info or not image_info.get('thumbnail_path'):
            return None
        
        try:
            with open(image_info['thumbnail_path'], 'rb') as f:
                return f.read()
        except FileNotFoundError:
            logger.error(f"Thumbnail not found: {image_info['thumbnail_path']}")
            return None
    
    def list_images(self, image_type: str = None, parent_id: str = None) -> List[Dict]:
        """
        List stored images with optional filtering
        
        Args:
            image_type: Filter by image type (original, processed, edited)
            parent_id: Filter by parent image ID
        
        Returns:
            List of image metadata
        """
        metadata = self._load_metadata()
        images = list(metadata.values())
        
        # Apply filters
        if image_type:
            images = [img for img in images if img.get('type') == image_type]
        
        if parent_id:
            images = [img for img in images if img.get('parent_id') == parent_id]
        
        # Sort by creation date (newest first)
        images.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return images
    
    def update_image_metadata(self, image_id: str, updates: Dict) -> bool:
        """Update image metadata"""
        metadata = self._load_metadata()
        
        if image_id not in metadata:
            return False
        
        metadata[image_id].update(updates)
        metadata[image_id]['updated_at'] = datetime.now().isoformat()
        
        self._save_metadata(metadata)
        return True
    
    def delete_image(self, image_id: str, delete_children: bool = True) -> bool:
        """
        Delete an image and optionally its children
        
        Args:
            image_id: ID of image to delete
            delete_children: Whether to delete processed/edited versions
        
        Returns:
            True if successful
        """
        metadata = self._load_metadata()
        
        if image_id not in metadata:
            return False
        
        image_info = metadata[image_id]
        
        # Delete child images if requested
        if delete_children:
            children = [img for img in metadata.values() if img.get('parent_id') == image_id]
            for child in children:
                self.delete_image(child['id'], delete_children=False)
        
        # Delete image files
        try:
            if os.path.exists(image_info['file_path']):
                os.remove(image_info['file_path'])
            
            if image_info.get('thumbnail_path') and os.path.exists(image_info['thumbnail_path']):
                os.remove(image_info['thumbnail_path'])
        except Exception as e:
            logger.error(f"Error deleting files for {image_id}: {e}")
        
        # Remove from metadata
        del metadata[image_id]
        self._save_metadata(metadata)
        
        logger.info(f"Deleted image {image_id}")
        return True
    
    def get_storage_stats(self) -> Dict:
        """Get storage statistics"""
        metadata = self._load_metadata()
        
        total_images = len(metadata)
        total_size = sum(img.get('file_size', 0) for img in metadata.values())
        
        type_counts = {}
        for img in metadata.values():
            img_type = img.get('type', 'unknown')
            type_counts[img_type] = type_counts.get(img_type, 0) + 1
        
        return {
            'total_images': total_images,
            'total_size_bytes': total_size,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'type_counts': type_counts,
            'storage_path': str(self.storage_dir)
        }

# Global storage instance
storage = ImageStorage()
