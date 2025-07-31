#!/usr/bin/env python3
"""
Test script for the image storage system
"""

import requests
import json
import os
from pathlib import Path

def test_storage_system():
    print("🧪 Testing Image Storage System...")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Test 1: Check if backend is running
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code != 200:
            print("❌ Backend not running. Start it first!")
            return False
        print("✅ Backend is running")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on port 8000")
        return False
    
    # Test 2: Check storage endpoints
    try:
        response = requests.get(f"{base_url}/images")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Storage endpoint working - Found {len(data.get('images', []))} stored images")
        else:
            print(f"❌ Storage endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing storage endpoint: {e}")
    
    # Test 3: Check storage stats
    try:
        response = requests.get(f"{base_url}/storage/stats")
        if response.status_code == 200:
            stats = response.json()['stats']
            print("✅ Storage statistics:")
            print(f"   Total images: {stats.get('total_images', 0)}")
            print(f"   Storage used: {stats.get('total_size_mb', 0)} MB")
            print(f"   Storage path: {stats.get('storage_path', 'Unknown')}")
            
            # Check if storage directory exists
            storage_path = Path("backend/stored_images")
            if storage_path.exists():
                print(f"✅ Storage directory exists: {storage_path}")
                print(f"   Images folder: {storage_path / 'images'}")
                print(f"   Thumbnails folder: {storage_path / 'thumbnails'}")
                print(f"   Metadata file: {storage_path / 'metadata.json'}")
            else:
                print(f"⚠️  Storage directory not found: {storage_path}")
        else:
            print(f"❌ Storage stats failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting storage stats: {e}")
    
    # Test 4: Test image upload and storage
    print("\n📤 Testing image upload and storage...")
    
    # Create a simple test image
    test_image_path = "test_image.png"
    if not os.path.exists(test_image_path):
        try:
            from PIL import Image
            import numpy as np
            
            # Create a simple test image
            img_array = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
            img = Image.fromarray(img_array)
            img.save(test_image_path)
            print(f"✅ Created test image: {test_image_path}")
        except ImportError:
            print("⚠️  PIL not available, skipping image upload test")
            return True
        except Exception as e:
            print(f"❌ Failed to create test image: {e}")
            return True
    
    # Upload test image
    try:
        with open(test_image_path, 'rb') as f:
            files = {'image': ('test_image.png', f, 'image/png')}
            data = {'model': 'enhanced', 'output_format': 'PNG'}
            
            response = requests.post(f"{base_url}/remove-background", files=files, data=data)
            
            if response.status_code == 200:
                print("✅ Image upload and processing successful")
                
                # Check if image IDs are in headers
                original_id = response.headers.get('X-Original-ID')
                processed_id = response.headers.get('X-Processed-ID')
                
                if original_id:
                    print(f"✅ Original image stored with ID: {original_id}")
                if processed_id:
                    print(f"✅ Processed image stored with ID: {processed_id}")
                
                # Test retrieving the stored images
                if original_id:
                    img_response = requests.get(f"{base_url}/images/{original_id}")
                    if img_response.status_code == 200:
                        print("✅ Can retrieve stored original image")
                    else:
                        print("❌ Failed to retrieve stored original image")
                
                if processed_id:
                    img_response = requests.get(f"{base_url}/images/{processed_id}")
                    if img_response.status_code == 200:
                        print("✅ Can retrieve stored processed image")
                    else:
                        print("❌ Failed to retrieve stored processed image")
                        
                    # Test thumbnail
                    thumb_response = requests.get(f"{base_url}/images/{processed_id}/thumbnail")
                    if thumb_response.status_code == 200:
                        print("✅ Can retrieve image thumbnail")
                    else:
                        print("❌ Failed to retrieve thumbnail")
                
            else:
                print(f"❌ Image upload failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error testing image upload: {e}")
    
    # Cleanup test image
    try:
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            print(f"🧹 Cleaned up test image: {test_image_path}")
    except Exception as e:
        print(f"⚠️  Failed to cleanup test image: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Storage system test completed!")
    print("\n📝 Next steps:")
    print("1. Start the frontend: npm run dev")
    print("2. Go to http://localhost:3000")
    print("3. Upload an image and check if it appears in the gallery")
    print("4. Visit http://localhost:3000/gallery to see stored images")
    
    return True

if __name__ == "__main__":
    test_storage_system()
