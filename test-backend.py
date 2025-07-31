#!/usr/bin/env python3
"""
Quick test script to check if the backend is working
"""

import requests
import json

def test_backend():
    print("🧪 Testing BG Remover Backend Connection...")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Backend is running and accessible")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on port 8000")
        print("   Run: python backend/start_simple.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False
    
    # Test 2: Models endpoint
    try:
        response = requests.get(f"{base_url}/models")
        if response.status_code == 200:
            models = response.json()
            print("✅ Models endpoint working")
            print(f"   Available models: {len(models['models'])}")
            for model in models['models']:
                print(f"   - {model['name']}: {model['description']}")
        else:
            print(f"❌ Models endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing models endpoint: {e}")
    
    # Test 3: CORS headers
    try:
        response = requests.options(f"{base_url}/remove-background")
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        print("✅ CORS configuration:")
        for header, value in cors_headers.items():
            print(f"   {header}: {value}")
    except Exception as e:
        print(f"⚠️  Could not check CORS headers: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Backend test completed!")
    print("\n📝 If backend is working but frontend still fails:")
    print("1. Make sure frontend is running on http://localhost:3000")
    print("2. Check browser console for detailed error messages")
    print("3. Try refreshing the page")
    print("4. Make sure both servers are running simultaneously")
    
    return True

if __name__ == "__main__":
    test_backend()
