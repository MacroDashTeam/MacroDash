#!/bin/bash

echo "Creating a test alert that should trigger immediately..."
echo ""

# Create an alert with a target price that will trigger
curl -X POST http://localhost:8000/api/alerts/ \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "stock_name": "Apple Inc.",
    "target_price": 300.00,
    "condition": "below",
    "email": "mytest@example.com",
    "notes": "Test alert - should trigger immediately"
  }'

echo ""
echo ""
echo "Alert created! Now manually triggering the price check..."
echo ""

# Manually run the price check function
./macrodash_env/bin/python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'macrodash.settings')
django.setup()

from api.scheduler import check_price_alerts
check_price_alerts()
"

echo ""
echo "Check complete! Look above for the email notification in the console."
echo ""
echo "To list all alerts for this email:"
echo "curl 'http://localhost:8000/api/alerts/?email=mytest@example.com'"
