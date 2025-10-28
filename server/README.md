# MacroDash Backend API

Django REST API backend for MacroDash - A comprehensive financial analytics dashboard with real-time economic data, stock market analytics, and technical indicators.

## Features

- **Economic Data Integration**: FRED API for GDP, unemployment, inflation, and interest rates
- **Stock Market Data**: Yahoo Finance and Alpha Vantage for real-time and historical data
- **Cryptocurrency Trading**: CoinMarketCap and CoinGecko integration for crypto prices, charts, and analytics
- **Technical Indicators**: Professional-grade TA-Lib calculations for RSI, MACD, Bollinger Bands, SMA, EMA
- **Price Alerts**: Automated email notifications for price thresholds with APScheduler
- **AI-Powered Insights**: OpenAI GPT-4 integration for stock analysis and sentiment
- **News & Sentiment**: Real-time financial news with sentiment scoring
- **Memory Optimization**: Backend caching (60s for real-time, 5min for historical data)
- **RESTful API**: Clean, well-documented endpoints with proper error handling

## Installation

### Prerequisites

- Python 3.12+
- pip package manager
- TA-Lib library (system dependency)

### Setup Steps

1. Install TA-Lib system dependency:

```bash
# On Ubuntu/Debian:
sudo apt-get install libta-lib0-dev

# On macOS:
brew install ta-lib

# On Windows:
# Download from https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib
```

2. Create and activate virtual environment:

```bash
python -m venv macrodash_env
source macrodash_env/bin/activate  # On Windows: macrodash_env\Scripts\activate
```

3. Install Python dependencies:

```bash
./macrodash_env/bin/python -m pip install -r requirements.txt
```

4. Configure environment variables:

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Required API keys:
- **FRED_API_KEY**: Get from https://fred.stlouisfed.org/docs/api/api_key.html
- **ALPHA_VANTAGE_API_KEY**: Get from https://www.alphavantage.co/support/#api-key
- **OPENAI_API_KEY**: Get from https://platform.openai.com/api-keys
- **COINMARKETCAP_API_KEY**: Get from https://coinmarketcap.com/api/

5. Run database migrations:

```bash
./macrodash_env/bin/python manage.py migrate
```

6. Start development server:

```bash
./macrodash_env/bin/python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`

## API Endpoints

### Economic Data

**GET /api/economic-data/**
- Returns economic indicators from FRED
- Includes GDP, unemployment rate, inflation (CPI), federal funds rate
- Data updated automatically from Federal Reserve

### Stock Market

**GET /api/stocks/**
- List of top stocks with current prices
- Market summary statistics
- Sorted by market cap

**GET /api/stocks/{symbol}/**
- Detailed stock information
- Historical price data
- Company fundamentals (P/E ratio, market cap, EPS, etc.)
- 52-week high/low and trading volume

**GET /api/stocks/{symbol}/financials/**
- Company financial statements
- Income statement, balance sheet, cash flow
- Quarterly and annual data

**GET /api/stocks/{symbol}/recommendations/**
- Analyst recommendations and price targets
- Buy/Sell/Hold ratings distribution
- Consensus price targets

### Technical Indicators (New in Sprint 4)

**GET /api/technical-indicators/{symbol}/?period={period}**
- Professional-grade technical analysis indicators
- Calculated using TA-Lib library

Parameters:
- `symbol` (required): Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
- `period` (optional): Time range for analysis
  - Options: `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`
  - Default: `1y`

Returns:
```json
{
  "status": "success",
  "data": {
    "symbol": "AAPL",
    "period": "3mo",
    "data_points": 63,
    "rsi": {
      "values": [...],
      "dates": [...],
      "latest": 65.42,
      "interpretation": "Neutral",
      "description": "RSI measures momentum..."
    },
    "macd": {
      "macd_values": [...],
      "signal_values": [...],
      "histogram_values": [...],
      "dates": [...],
      "latest_macd": 2.15,
      "latest_signal": 1.89,
      "interpretation": "Bullish",
      "description": "MACD shows trend direction..."
    },
    "bbands": {
      "upper_band": [...],
      "middle_band": [...],
      "lower_band": [...],
      "dates": [...],
      "latest_upper": 182.45,
      "latest_middle": 178.20,
      "latest_lower": 173.95,
      "description": "Bollinger Bands measure volatility..."
    },
    "sma": {
      "sma_20": {...},
      "sma_50": {...},
      "sma_200": {...}
    },
    "ema": {
      "ema_12": {...},
      "ema_26": {...},
      "ema_50": {...}
    }
  }
}
```

Indicators included:
- **RSI (Relative Strength Index)**: 14-period momentum oscillator
- **MACD (Moving Average Convergence Divergence)**: Trend indicator with 12/26/9 settings
- **Bollinger Bands**: Volatility bands with 20-period SMA and 2 standard deviations
- **SMA (Simple Moving Average)**: 20, 50, and 200-period moving averages
- **EMA (Exponential Moving Average)**: 12, 26, and 50-period weighted averages

### News & Sentiment

**GET /api/news/{symbol}/**
- Financial news articles for specific stock
- Sourced from Alpha Vantage
- Includes headline, summary, source, timestamp, and relevance score

**GET /api/sentiment/{symbol}/**
- AI-powered sentiment analysis
- Overall market sentiment score
- News sentiment breakdown
- Social media sentiment (planned)

### AI Insights

**POST /api/chat/**
- Interactive chatbot for financial questions
- Powered by OpenAI GPT-4
- Context-aware responses about stocks and markets

Request body:
```json
{
  "message": "What is the outlook for AAPL stock?",
  "context": "stock_analysis"
}
```

**GET /api/insights/{symbol}/**
- AI-generated stock insights
- Key strengths and risks
- Investment thesis summary
- Technical and fundamental analysis synthesis

### Cryptocurrency (New Feature)

**GET /api/crypto/**
- List of cryptocurrencies with real-time data from CoinMarketCap
- Parameters: `limit` (default: 100)
- Returns: price, market cap, volume, circulating supply, max supply, 1h/24h/7d/30d changes

**GET /api/crypto/{symbol}/**
- Detailed cryptocurrency information
- Includes description, website, whitepaper, social links
- Market metrics and price changes across multiple timeframes

**GET /api/crypto/top/gainers/**
- Top gaining cryptocurrencies in last 24 hours
- Parameters: `limit` (default: 10)

**GET /api/crypto/top/losers/**
- Top losing cryptocurrencies in last 24 hours
- Parameters: `limit` (default: 10)

**GET /api/crypto/{symbol}/historical/**
- Historical price, market cap, and volume data
- Powered by CoinGecko API (free)
- Parameters: `days` (1, 7, 30, 90, 180, 365)

**GET /api/crypto/{symbol}/ohlc/**
- OHLC candlestick data for trading charts
- Parameters: `days` (1, 7, 14, 30, 90, 180, 365)
- Returns: open, high, low, close prices with timestamps

### Price Alerts

**GET /api/alerts/**
- List all price alerts for the user
- Includes active and triggered alerts

**POST /api/alerts/**
- Create new price alert
- Email notifications when price thresholds are met
- Scheduled checks every 5 minutes

**DELETE /api/alerts/{id}/**
- Delete specific price alert

### Dashboard

**GET /api/dashboard/**
- User dashboard configuration
- Saved preferences and watchlists
- Default view settings

**POST /api/dashboard/**
- Update dashboard preferences
- Customize widgets and layout

## Architecture

### Service Layer Pattern

Business logic is organized into service classes in `api/services.py`:

- **FREDService**: Federal Reserve economic data integration
- **AlphaVantageService**: Stock data, news, and sentiment
- **YahooFinanceService**: Historical prices and company fundamentals
- **OpenAIService**: AI-powered insights and chatbot
- **TechnicalIndicatorService**: TA-Lib indicator calculations
- **CoinMarketCapService**: Real-time cryptocurrency data (with 60s caching)
- **CoinGeckoService**: Historical cryptocurrency charts (with 5min caching)

### Key Implementation Details

**TechnicalIndicatorService** (lines 1531-1717 in services.py):
- Uses yfinance for historical price data retrieval
- Implements 5 indicator calculation methods with TA-Lib
- Handles edge cases: insufficient data, invalid symbols, calculation errors
- Returns formatted JSON with values, dates, and interpretations
- Supports flexible time periods with intelligent data point selection

**API Views** (views.py):
- Clean separation between view logic and business logic
- Proper HTTP status codes and error handling
- CORS configured for React frontend at localhost:5173
- JSON response formatting with consistent structure

## Development

### Running Tests

```bash
./macrodash_env/bin/python manage.py test
```

### Creating Migrations

```bash
./macrodash_env/bin/python manage.py makemigrations
```

### Django Admin

Create superuser account:
```bash
./macrodash_env/bin/python manage.py createsuperuser
```

Access admin interface at: http://127.0.0.1:8000/admin/

### Testing Endpoints

Using curl:
```bash
# Get stock data
curl http://127.0.0.1:8000/api/stocks/AAPL/

# Get technical indicators
curl "http://127.0.0.1:8000/api/technical-indicators/AAPL/?period=3mo"

# Get economic data
curl http://127.0.0.1:8000/api/economic-data/
```

Using Python:
```bash
./macrodash_env/bin/python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'macrodash.settings')
import django
django.setup()

from api.services import TechnicalIndicatorService

service = TechnicalIndicatorService()
result = service.get_technical_indicators('AAPL', '3mo')
print(result)
"
```

## Dependencies

Key Python packages:
- `Django==4.2.7`: Web framework
- `djangorestframework==3.16.1`: REST API toolkit
- `django-cors-headers==4.9.0`: CORS support
- `TA-Lib==0.6.8`: Technical analysis library
- `yfinance==0.2.66`: Yahoo Finance data
- `pandas==2.3.3`: Data manipulation and analysis
- `numpy==2.3.3`: Numerical computations
- `requests==2.32.5`: HTTP client
- `openai==2.6.1`: OpenAI API client
- `fredapi==0.5.2`: Federal Reserve Economic Data API
- `APScheduler==3.11.0`: Task scheduling for price alerts
- `django-apscheduler==0.7.0`: Django integration for APScheduler
- `python-dotenv==1.0.0`: Environment variable management
- `gunicorn>=21.2.0`: Production WSGI server

See `requirements.txt` for complete list.

## CORS Configuration

Development CORS settings allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`

For production deployment, update CORS settings in `macrodash/settings.py`.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "error": "Descriptive error message",
  "details": "Additional context (optional)"
}
```

Common HTTP status codes:
- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Environment Variables

Required in `.env` file:

```env
# API Keys
FRED_API_KEY=your_fred_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
OPENAI_API_KEY=your_openai_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Django Settings
DEBUG=True
SECRET_KEY=your_secret_key_here

# Email Configuration (for alerts)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=MacroDash Alerts <your_email@example.com>

# Database (optional for production)
# DATABASE_URL=postgresql://user:password@localhost:5432/macrodash
```

## Deployment

Production deployment checklist:
- [ ] Set `DEBUG=False` in settings
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Set up static file serving (S3 + CloudFront)
- [ ] Configure production CORS origins
- [ ] Set strong `SECRET_KEY`
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up monitoring and error tracking
- [ ] Configure environment variables on server
- [ ] Install TA-Lib on production server
- [ ] Run migrations on production database

Recommended production stack:
- **Server**: AWS EC2 with Ubuntu
- **WSGI Server**: Gunicorn
- **Reverse Proxy**: Nginx
- **Database**: AWS RDS PostgreSQL
- **Static Files**: AWS S3 + CloudFront CDN

## Support

For questions or issues, contact the development team through course communication channels.