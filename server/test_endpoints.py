#!/usr/bin/env python3
"""
Simple test script to verify API endpoints return valid responses
Run this after starting the Django server with: python manage.py runserver
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

endpoints = [
    "/economic-data/",
    "/stocks/",
    "/stocks/AAPL/",
    "/news/AAPL/",
    "/dashboard/",
    "/sentiment/AAPL/"
]

def test_endpoints():
    print("Testing MacroDash API endpoints...")
    print("=" * 50)
    
    for endpoint in endpoints:
        url = BASE_URL + endpoint
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {endpoint} - Status: {response.status_code}")
                print(f"   Response keys: {list(data.keys())}")
            else:
                print(f"❌ {endpoint} - Status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint} - Error: {str(e)}")
        print()

if __name__ == "__main__":
    test_endpoints()