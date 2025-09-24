# MacroDash Backend API

Django REST API backend for MacroDash - A real-time economic dashboard.

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Start development server:
```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`

## API Endpoints

- `GET /api/economic-data/` - Economic indicators (GDP, unemployment, etc.)
- `GET /api/stocks/` - Top stocks and market summary
- `GET /api/stocks/{symbol}/` - Individual stock details with historical data
- `GET /api/news/{symbol}/` - Financial news for specific stocks
- `GET /api/dashboard/` - Dashboard configuration
- `POST /api/dashboard/` - Update dashboard configuration
- `GET /api/sentiment/{symbol}/` - LLM-powered sentiment analysis

## Testing with Postman

All endpoints return mock JSON data and can be tested immediately. CORS is configured to allow requests from localhost:3000 for frontend integration.