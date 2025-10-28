# Dependencies Update Summary

## Overview
This document details all Python dependencies that have been added or updated in the MacroDash backend requirements.txt file.

## Updated: `/server/requirements.txt`

### Previous State
The requirements.txt file was missing several critical dependencies that were being used in the codebase:
- pandas
- numpy
- requests
- openai
- TA-Lib
- APScheduler
- django-apscheduler

Additionally, some version numbers were outdated.

### Current State
All dependencies are now properly documented with correct versions matching the installed packages.

## Complete Dependency List

### Core Django Packages
```
Django==4.2.7
djangorestframework==3.16.1  # Updated from 3.14.0
django-cors-headers==4.9.0   # Updated from 4.3.1
```

### Environment Management
```
python-dotenv==1.0.0
```

### Financial Data APIs
```
fredapi==0.5.2              # Updated from 0.5.1
yfinance==0.2.66            # Updated from 0.2.28
```

### Data Processing & Analysis
```
pandas==2.3.3               # NEW - Required by services.py
numpy==2.3.3                # NEW - Required by services.py and TA-Lib
```

### Technical Analysis
```
TA-Lib==0.6.8               # NEW - Required for technical indicators
```
**Important**: TA-Lib requires the C library to be installed first:
- Ubuntu/Debian: `sudo apt-get install libta-lib0-dev`
- macOS: `brew install ta-lib`
- Windows: Download from https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib

### HTTP & API Integration
```
requests==2.32.5            # NEW - Required for external API calls
```

### AI & Machine Learning
```
openai==2.6.1               # NEW - Required for chatbot and AI insights
```

### Task Scheduling
```
APScheduler==3.11.0         # NEW - Required for price alert scheduler
django-apscheduler==0.7.0   # NEW - Django integration for APScheduler
```

### Production Server
```
gunicorn>=21.2.0
```

## Usage Analysis

### services.py Dependencies
The following packages are imported in `/server/api/services.py`:
- `pandas` - Data manipulation for financial data
- `numpy` - Numerical computations for indicators
- `yfinance` - Yahoo Finance data retrieval
- `fredapi` - Federal Reserve economic data
- `requests` - HTTP requests to CoinMarketCap, CoinGecko APIs
- `openai` - OpenAI GPT-4 integration
- `talib` - Technical indicator calculations (RSI, MACD, Bollinger Bands, etc.)
- `django.core.cache` - Backend caching for API responses

### scheduler.py Dependencies
The following packages are imported in `/server/api/scheduler.py`:
- `apscheduler` - Background task scheduling
- `django_apscheduler` - Django database integration for scheduled jobs

### models.py Dependencies
Uses only Django built-in packages:
- `django.db.models`
- `django.core.validators`
- `django.utils.timezone`

### views.py Dependencies
Uses Django and custom services:
- `django` packages (http, views, decorators, mail, conf)
- Custom services from `api.services`
- Custom models from `api.models`

## Installation Instructions

### 1. Clean Installation
For a new environment, install all dependencies:

```bash
# Create virtual environment
python -m venv macrodash_env
source macrodash_env/bin/activate  # On Windows: macrodash_env\Scripts\activate

# Install TA-Lib C library first (required)
# Ubuntu/Debian:
sudo apt-get install libta-lib0-dev

# macOS:
brew install ta-lib

# Install Python packages
pip install -r requirements.txt
```

### 2. Upgrading Existing Environment
If you already have an environment, update dependencies:

```bash
source macrodash_env/bin/activate
pip install --upgrade -r requirements.txt
```

### 3. Verify Installation
Test that all packages are installed correctly:

```bash
python -c "
import django
import rest_framework
import pandas
import numpy
import talib
import yfinance
import fredapi
import requests
import openai
from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import DjangoJobStore
print('✓ All dependencies installed successfully!')
"
```

## Package Purposes

| Package | Purpose | Used In |
|---------|---------|---------|
| Django | Web framework | All files |
| djangorestframework | REST API toolkit | views.py |
| django-cors-headers | CORS support | settings.py |
| python-dotenv | Environment variables | settings.py |
| fredapi | FRED economic data | services.py (FREDService) |
| yfinance | Yahoo Finance data | services.py (YahooFinanceService, TechnicalIndicatorService) |
| pandas | Data manipulation | services.py (all services) |
| numpy | Numerical computing | services.py (TechnicalIndicatorService) |
| TA-Lib | Technical indicators | services.py (TechnicalIndicatorService) |
| requests | HTTP requests | services.py (AlphaVantageService, CoinMarketCapService, CoinGeckoService) |
| openai | AI chatbot & insights | services.py (OpenAIService) |
| APScheduler | Task scheduling | scheduler.py |
| django-apscheduler | Scheduler DB integration | scheduler.py |
| gunicorn | Production WSGI server | Production deployment |

## Memory Optimization Features

The following caching is implemented using Django's cache framework:

### Backend Caching (Django Cache)
- **CoinMarketCapService**: 60-second cache for real-time crypto data
- **CoinGeckoService**: 5-minute cache for historical data and OHLC charts
- **Cache Backend**: Local memory cache with max 1000 entries

Configuration in `settings.py`:
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'macrodash-cache',
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
        }
    }
}
```

For production, consider upgrading to Redis:
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

## Testing Dependencies

To verify all dependencies work correctly:

```bash
# Run Django checks
python manage.py check

# Test technical indicators
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'macrodash.settings')
import django
django.setup()

from api.services import TechnicalIndicatorService
service = TechnicalIndicatorService()
result = service.get_technical_indicators('AAPL', '1mo')
print(f'RSI: {result[\"data\"][\"rsi\"][\"latest\"]}')
"

# Test cryptocurrency service
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'macrodash.settings')
import django
django.setup()

from api.services import CoinMarketCapService
service = CoinMarketCapService()
result = service.get_crypto_listings(10)
print(f'Fetched {result[\"data\"][\"total\"]} cryptocurrencies')
"
```

## Common Issues

### 1. TA-Lib Installation Fails
**Problem**: `pip install TA-Lib` fails with compilation errors

**Solution**: Install the C library first:
- Ubuntu: `sudo apt-get install libta-lib0-dev`
- macOS: `brew install ta-lib`
- Windows: Download wheel from https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib

### 2. Import Errors
**Problem**: `ModuleNotFoundError` when running server

**Solution**: Ensure virtual environment is activated:
```bash
source macrodash_env/bin/activate
pip install -r requirements.txt
```

### 3. Version Conflicts
**Problem**: Dependency version conflicts

**Solution**: Use exact versions from requirements.txt:
```bash
pip install --force-reinstall -r requirements.txt
```

### 4. Django Database Locked
**Problem**: APScheduler reports database locked errors

**Solution**: This is normal for SQLite with concurrent writes. For production, use PostgreSQL.

## Production Considerations

### Database
Replace SQLite with PostgreSQL for production:
```bash
pip install psycopg2-binary
```

Add to requirements.txt:
```
psycopg2-binary==2.9.9  # PostgreSQL adapter
```

### Caching
Replace LocMemCache with Redis for production:
```bash
pip install django-redis
```

Add to requirements.txt:
```
django-redis==5.4.0  # Redis cache backend
redis==5.0.1         # Redis client
```

### Monitoring
Add error tracking and monitoring:
```bash
pip install sentry-sdk
```

## Summary

All dependencies have been:
- ✅ Identified from codebase imports
- ✅ Added to requirements.txt with correct versions
- ✅ Documented with purposes and usage
- ✅ Organized by category for clarity
- ✅ Tested in the running application

The application now has complete dependency documentation for reliable installation and deployment.
