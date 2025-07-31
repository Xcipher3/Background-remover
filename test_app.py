#!/usr/bin/env python3
"""
Test script for the BG Remover application
"""

import requests
import os
import time
from PIL import Image
import io

def test_api_health():
    """Test if the API is running"""
    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("✅ API is running")
            return True
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the backend is running on port 8000")
        return False

def test_models_endpoint():
    """Test the models endpoint"""
    try:
        response = requests.get("http://localhost:8000/models")
        if response.status_code == 200:
            models = response.json()
            print(f"✅ Models endpoint working. Found {len(models['models'])} models")
            for model in models['models']:
                print(f"   - {model['name']}: {model['description']}")
            return True
        else:
            print(f"❌ Models endpoint failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing models endpoint: {e}")
        return False

def create_test_image():
    """Create a simple test image"""
    # Create a simple test image with a colored rectangle on white background
    img = Image.new('RGB', (400, 300), color='white')
    
    # Add a colored rectangle in the center
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    draw.rectangle([100, 75, 300, 225], fill='blue', outline='black', width=2)
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes.getvalue()

def test_background_removal():
    """Test background removal functionality"""
    try:
        # Create test image
        test_image_data = create_test_image()
        
        # Test with different models
        models_to_test = ['auto', 'u2net', 'silueta']
        
        for model in models_to_test:
            print(f"Testing background removal with model: {model}")
            
            files = {'image': ('test.png', test_image_data, 'image/png')}
            data = {'model': model, 'quality': 'high'}
            
            start_time = time.time()
            response = requests.post(
                "http://localhost:8000/remove-background",
                files=files,
                data=data,
                timeout=30
            )
            end_time = time.time()
            
            if response.status_code == 200:
                print(f"   ✅ {model} model worked (took {end_time - start_time:.2f}s)")
                
                # Save result for manual inspection
                with open(f'test_result_{model}.png', 'wb') as f:
                    f.write(response.content)
                print(f"   📁 Result saved as test_result_{model}.png")
            else:
                print(f"   ❌ {model} model failed with status: {response.status_code}")
                print(f"   Error: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing background removal: {e}")
        return False

def test_image_analysis():
    """Test image analysis functionality"""
    try:
        test_image_data = create_test_image()
        
        files = {'image': ('test.png', test_image_data, 'image/png')}
        
        response = requests.post(
            "http://localhost:8000/analyze-image",
            files=files,
            timeout=15
        )
        
        if response.status_code == 200:
            analysis = response.json()
            print("✅ Image analysis working")
            print(f"   Detected type: {analysis['image_type']}")
            print(f"   Recommended model: {analysis['recommended_model']}")
            print(f"   Confidence: {analysis['confidence']:.2f}")
            return True
        else:
            print(f"❌ Image analysis failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing image analysis: {e}")
        return False

def test_frontend():
    """Test if frontend is accessible"""
    try:
        response = requests.get("http://localhost:3000", timeout=10)
        if response.status_code == 200:
            print("✅ Frontend is accessible at http://localhost:3000")
            return True
        else:
            print(f"❌ Frontend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to frontend. Make sure it's running on port 3000")
        return False
    except Exception as e:
        print(f"❌ Error testing frontend: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing BG Remover Application")
    print("=" * 50)
    
    tests = [
        ("API Health Check", test_api_health),
        ("Models Endpoint", test_models_endpoint),
        ("Image Analysis", test_image_analysis),
        ("Background Removal", test_background_removal),
        ("Frontend Accessibility", test_frontend),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running: {test_name}")
        print("-" * 30)
        
        if test_func():
            passed += 1
        
        time.sleep(1)  # Brief pause between tests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your BG Remover app is working correctly.")
        print("\n📝 Next steps:")
        print("1. Open http://localhost:3000 in your browser")
        print("2. Upload an image to test the full workflow")
        print("3. Try different models and compare results")
    else:
        print("⚠️  Some tests failed. Please check the error messages above.")
        print("\n🔧 Troubleshooting:")
        print("- Make sure both backend (port 8000) and frontend (port 3000) are running")
        print("- Check that all Python dependencies are installed")
        print("- Verify that Node.js dependencies are installed")
    
    # Cleanup test files
    for model in ['auto', 'u2net', 'silueta']:
        filename = f'test_result_{model}.png'
        if os.path.exists(filename):
            try:
                os.remove(filename)
                print(f"🧹 Cleaned up {filename}")
            except:
                pass

if __name__ == "__main__":
    main()
