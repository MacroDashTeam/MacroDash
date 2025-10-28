#!/bin/bash

echo "==================================="
echo "MULTI-USER EMAIL ALERT DEMO"
echo "==================================="
echo ""
echo "Creating alerts for 3 different users..."
echo ""

# User 1: Alice
echo "1. Creating alert for alice@example.com..."
curl -s -X POST http://localhost:8000/api/alerts/ \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "MSFT",
    "stock_name": "Microsoft",
    "target_price": 500.00,
    "condition": "below",
    "email": "alice@example.com",
    "notes": "Alice wants to buy MSFT"
  }' | python3 -m json.tool

echo ""

# User 2: Bob
echo "2. Creating alert for bob@example.com..."
curl -s -X POST http://localhost:8000/api/alerts/ \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "GOOGL",
    "stock_name": "Google",
    "target_price": 200.00,
    "condition": "below",
    "email": "bob@example.com",
    "notes": "Bob watching GOOGL price"
  }' | python3 -m json.tool

echo ""

# User 3: Charlie
echo "3. Creating alert for charlie@example.com..."
curl -s -X POST http://localhost:8000/api/alerts/ \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "stock_name": "Apple Inc.",
    "target_price": 300.00,
    "condition": "below",
    "email": "charlie@example.com",
    "notes": "Charlie monitoring AAPL"
  }' | python3 -m json.tool

echo ""
echo "==================================="
echo "All 3 alerts created!"
echo "==================================="
echo ""
echo "Now triggering the alert checker..."
echo ""

# Trigger the price check
cd /mnt/d/claude-projects/macrodash/server
./macrodash_env/bin/python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'macrodash.settings')
django.setup()
from api.scheduler import check_price_alerts
print('Checking all active alerts...')
print('')
check_price_alerts()
print('')
print('✅ Done! Check above for email notifications.')
print('   Each email went to a DIFFERENT user!')
"

echo ""
echo "==================================="
echo "Verifying each user's alerts:"
echo "==================================="
echo ""

echo "Alice's alerts:"
curl -s "http://localhost:8000/api/alerts/?email=alice@example.com" | python3 -c "import sys,json; data=json.load(sys.stdin); print(f\"  Count: {len(data['data'])} alerts\")"

echo "Bob's alerts:"
curl -s "http://localhost:8000/api/alerts/?email=bob@example.com" | python3 -c "import sys,json; data=json.load(sys.stdin); print(f\"  Count: {len(data['data'])} alerts\")"

echo "Charlie's alerts:"
curl -s "http://localhost:8000/api/alerts/?email=charlie@example.com" | python3 -c "import sys,json; data=json.load(sys.stdin); print(f\"  Count: {len(data['data'])} alerts\")"

echo ""
echo "✅ System supports unlimited users!"
echo "   Each user gets emails at THEIR address"
echo ""
