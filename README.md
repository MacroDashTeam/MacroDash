# MacroDash 

A comprehensive financial analytics dashboard integrating macroeconomic indicators, stock market data, and AI-powered insights with professional-grade technical analysis.

**Software Engineering Fall 2025 Section 3 Group 6**

Team Members: Bhavana Peruri, Callum Cooper Nissen, Hariharan Loganathan, Pratyush Chatterjee, Taaha Bin Mohsin

### Deployment

| Target | Status | Action|
|--------|---------|-------|
| React SPA | [![Client Status](https://github.com/MacroDashTeam/MacroDash/actions/workflows/deploy-client.yml/badge.svg)](https://github.com/MacroDashTeam/MacroDash/actions/workflows/deploy-client.yml) | [▶️](https://github.com/MacroDashTeam/MacroDash/actions/workflows/deploy-client.yml) |
| Django API | [![Server Status](https://github.com/MacroDashTeam/MacroDash/actions/workflows/deploy-server.yml/badge.svg)](https://github.com/MacroDashTeam/MacroDash/actions/workflows/deploy-server.yml) | [▶️](https://github.com/MacroDashTeam/MacroDash/actions/workflows/deploy-server.yml) |
| Full Deployment | [![Full Deployment Status](https://github.com/MacroDashTeam/MacroDash/actions/workflows/deploy-all.yml/badge.svg)](https://github.com/MacroDashTeam/MacroDash/actions/workflows/deploy-all.yml) | [▶️](https://github.com/MacroDashTeam/MacroDash/actions/workflows/deploy-all.yml) |
| Code Coverage | [![Coverage](https://MacroDashTeam.github.io/MacroDash/badges/coverage.svg)](https://github.com/MacroDashTeam/MacroDash/actions)


## Features

### Stock Market Analytics
- Real-time stock data from Yahoo Finance and Alpha Vantage APIs
- Interactive price charts with historical data
- Company fundamentals and financial metrics
- Analyst recommendations and price targets
- AI-powered stock insights and sentiment analysis

### Technical Indicators (Sprint 4)
- **RSI (Relative Strength Index)**: Momentum oscillator identifying overbought/oversold conditions
- **MACD (Moving Average Convergence Divergence)**: Trend-following momentum indicator
- **Bollinger Bands**: Volatility indicator with upper, middle, and lower bands
- **SMA (Simple Moving Average)**: 20, 50, and 200-period moving averages
- **EMA (Exponential Moving Average)**: 12, 26, and 50-period weighted averages
- Multiple timeframes: 1 month, 3 months, 6 months, 1 year, 2 years, 5 years
- Professional-grade calculations using TA-Lib library
- Interactive charts with signal interpretation

### Economic Data
- Federal Reserve Economic Data (FRED) integration
- GDP, unemployment, inflation, and interest rate tracking
- Historical economic indicator analysis

### AI-Powered Insights
- OpenAI GPT-4 integration for stock analysis
- Natural language financial news summaries
- Sentiment analysis on market news

### News & Sentiment
- Real-time financial news from Alpha Vantage
- Stock-specific news filtering
- Sentiment scoring and relevance tracking

## Tech Stack

### Backend
- **Django 5.1.5**: Web framework and REST API
- **Django REST Framework**: API serialization and views
- **Python 3.12**: Core language
- **TA-Lib**: Technical analysis library for indicators
- **yfinance**: Yahoo Finance data retrieval
- **NumPy**: Numerical computations
- **Requests**: HTTP client for external APIs

### Frontend
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first styling
- **shadcn/ui**: Accessible component library
- **Radix UI**: Primitive components for accessibility
- **Recharts**: Data visualization and charting
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing

### APIs
- **FRED API**: Economic data from Federal Reserve
- **Alpha Vantage API**: Stock data, news, and sentiment
- **Yahoo Finance (yfinance)**: Historical price data and fundamentals
- **OpenAI API**: AI-powered insights and analysis
- **CoinMarketCap API**: Cryptocurrency data (planned for Sprint 5)

## Project Structure

```
macrodash/
├── server/                 # Django backend
│   ├── api/               # REST API app
│   │   ├── services.py    # Business logic and external API integrations
│   │   ├── views.py       # API endpoints
│   │   └── urls.py        # URL routing
│   ├── macrodash/         # Django project settings
│   └── requirements.txt   # Python dependencies
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities
│   │   └── main.tsx      # Entry point
│   └── package.json      # Node dependencies
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 22.19.0 (use nvm: `nvm use`)
- Yarn package manager
- pip for Python packages

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Create and activate virtual environment:
```bash
python -m venv macrodash_env
source macrodash_env/bin/activate  # On Windows: macrodash_env\Scripts\activate
```

3. Install TA-Lib (required for technical indicators):
```bash
# On Ubuntu/Debian:
sudo apt-get install libta-lib0-dev

# On macOS:
brew install ta-lib

# On Windows: Download from https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib
```

4. Install Python dependencies:
```bash
./macrodash_env/bin/python -m pip install -r requirements.txt
```

5. Configure environment variables (copy .env.example to .env and add your API keys):
```bash
cp .env.example .env
```

Required API keys:
- `FRED_API_KEY`: Get from https://fred.stlouisfed.org/docs/api/api_key.html
- `ALPHA_VANTAGE_API_KEY`: Get from https://www.alphavantage.co/support/#api-key
- `OPENAI_API_KEY`: Get from https://platform.openai.com/api-keys
- `COINMARKETCAP_API_KEY`: Get from https://coinmarketcap.com/api/

6. Run migrations:
```bash
./macrodash_env/bin/python manage.py migrate
```

7. Start development server:
```bash
./macrodash_env/bin/python manage.py runserver
```

Backend will be available at http://127.0.0.1:8000/

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
yarn install
```

3. Start development server:
```bash
yarn dev
```

Frontend will be available at http://localhost:5173/

### Running the app with one command

To start Django (backend) and Vite (frontend) simultaneously:

1. Install honcho if you haven't already:
```bash
pip install honcho
```

2. Run the app with one command:
```bash
honcho start
```

The backend will be available at http://127.0.0.1:8000/
The frontend will be available at http://localhost:5173/


## API Endpoints

### Economic Data
- `GET /api/economic-data/` - Retrieve economic indicators (GDP, unemployment, inflation, etc.)

### Stock Market
- `GET /api/stocks/` - List of top stocks and market summary
- `GET /api/stocks/{symbol}/` - Detailed stock information with historical data
- `GET /api/stocks/{symbol}/financials/` - Company financial statements
- `GET /api/stocks/{symbol}/recommendations/` - Analyst recommendations

### Technical Indicators (New in Sprint 4)
- `GET /api/technical-indicators/{symbol}/?period={period}` - Technical indicators for a stock
  - Parameters:
    - `symbol`: Stock ticker (e.g., AAPL, MSFT)
    - `period`: Time range (1mo, 3mo, 6mo, 1y, 2y, 5y)
  - Returns: RSI, MACD, Bollinger Bands, SMA, EMA with calculated values and charts data

### News & Sentiment
- `GET /api/news/{symbol}/` - Financial news for specific stock
- `GET /api/sentiment/{symbol}/` - AI-powered sentiment analysis

### AI Insights
- `POST /api/chat/` - AI chatbot for financial questions
- `GET /api/insights/{symbol}/` - AI-generated stock insights

### Dashboard
- `GET /api/dashboard/` - Dashboard configuration
- `POST /api/dashboard/` - Update dashboard preferences

## Development

### Backend Development

Run tests:
```bash
./macrodash_env/bin/python manage.py test
```

Create new migrations:
```bash
./macrodash_env/bin/python manage.py makemigrations
```

Access Django admin:
```bash
./macrodash_env/bin/python manage.py createsuperuser
# Visit http://127.0.0.1:8000/admin/
```

### Frontend Development

Run linting:
```bash
yarn lint
```

Build for production:
```bash
yarn build
```

Preview production build:
```bash
yarn preview
```

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# FRED API Configuration
FRED_API_KEY=your_fred_api_key_here

# Alpha Vantage API Configuration
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# CoinMarketCap API Configuration
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here

# Django Configuration
DEBUG=True
SECRET_KEY=your_secret_key_here

# Database Configuration (optional for production)
# DATABASE_URL=postgresql://user:password@localhost:5432/macrodash
```

## Deployment

Planned deployment to AWS with the following architecture:
- EC2 instance for Django application
- RDS PostgreSQL for database
- S3 + CloudFront for static files
- Gunicorn + Nginx for production server

## Sprint Progress

### Sprint 4 (Completed)
- Technical indicators integration with TA-Lib
- Enhanced UI component library (Badge, Tabs)
- Stock detail page enhancements
- CoinMarketCap API foundation
- Professional-grade charting with Recharts

### Sprint 5 (Planned)
- Cryptocurrency market dashboard
- Crypto detail pages with technical indicators
- Top gainers/losers panels for stocks and crypto
- AWS deployment
- Enhanced portfolio management

## Contributing

This is a course project for CS-GY 6063 Software Engineering. Team members should follow the established git workflow:

1. Create feature branches from `main`
2. Make changes and commit with descriptive messages
3. Push to origin and create pull request
4. Request code review from team member
5. Merge after approval

## License

This project is for educational purposes as part of CS-GY 6063 Software Engineering course.

## Contact

For questions or issues, contact the team members through the course communication channels.
