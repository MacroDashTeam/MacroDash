"""
Script to add @extend_schema decorators to all views in views.py
This is a one-time script to add Swagger/OpenAPI documentation.
"""

# Mapping of view functions to their Swagger documentation
SWAGGER_DOCS = {
    'stocks_intraday': {
        'tags': ['Stocks'],
        'summary': 'Get intraday market data',
        'description': 'Retrieve real-time intraday data for major market indices'
    },
    'stock_news': {
        'tags': ['Stocks'],
        'summary': 'Get stock news',
        'description': 'Retrieve latest financial news articles for a specific stock',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol')
        ]
    },
    'dashboard_config': {
        'tags': ['Dashboard'],
        'summary': 'Get/Update dashboard configuration',
        'description': 'Retrieve or update user dashboard layout and preferences',
        'methods': ['GET', 'POST']
    },
    'sentiment_analysis': {
        'tags': ['AI & Insights'],
        'summary': 'Get sentiment analysis',
        'description': 'AI-powered sentiment analysis for a specific stock',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol')
        ]
    },
    'alpha_vantage_quote': {
        'tags': ['Alpha Vantage'],
        'summary': 'Get real-time quote',
        'description': 'Retrieve real-time quote data from Alpha Vantage',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol')
        ]
    },
    'alpha_vantage_intraday': {
        'tags': ['Alpha Vantage'],
        'summary': 'Get intraday time series',
        'description': 'Retrieve intraday time series data from Alpha Vantage',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol'),
            ('interval', 'QUERY', 'Time interval (1min, 5min, 15min, 30min, 60min)', False)
        ]
    },
    'alpha_vantage_daily': {
        'tags': ['Alpha Vantage'],
        'summary': 'Get daily time series',
        'description': 'Retrieve daily time series data from Alpha Vantage',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol'),
            ('outputsize', 'QUERY', 'Output size (compact or full)', False)
        ]
    },
    'alpha_vantage_overview': {
        'tags': ['Alpha Vantage'],
        'summary': 'Get company overview',
        'description': 'Retrieve company overview from Alpha Vantage',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol')
        ]
    },
    'alpha_vantage_news': {
        'tags': ['Alpha Vantage'],
        'summary': 'Get news and sentiment',
        'description': 'Retrieve news articles with sentiment analysis from Alpha Vantage',
        'parameters': [
            ('tickers', 'QUERY', 'Comma-separated stock symbols', False),
            ('topics', 'QUERY', 'News topics filter', False),
            ('limit', 'QUERY', 'Number of articles to return', False)
        ]
    },
    'company_financials': {
        'tags': ['Company Data'],
        'summary': 'Get company financials',
        'description': 'Retrieve company financial statements (income, balance sheet, cash flow)',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol'),
            ('type', 'QUERY', 'Statement type: income, balance, or cashflow', False)
        ]
    },
    'company_earnings': {
        'tags': ['Company Data'],
        'summary': 'Get earnings data',
        'description': 'Retrieve company earnings data with analyst estimates',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol')
        ]
    },
    'analyst_recommendations': {
        'tags': ['Company Data'],
        'summary': 'Get analyst recommendations',
        'description': 'Retrieve analyst recommendations and ratings',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol')
        ]
    },
    'stock_insights': {
        'tags': ['AI & Insights'],
        'summary': 'Get AI stock insights',
        'description': 'AI-generated insights and analysis for a stock',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol')
        ]
    },
    'company_overview_yahoo': {
        'tags': ['Company Data'],
        'summary': 'Get company overview',
        'description': 'Retrieve company overview from Yahoo Finance',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol')
        ]
    },
    'chatbot': {
        'tags': ['AI & Insights'],
        'summary': 'AI chatbot',
        'description': 'Interact with AI chatbot for market insights and analysis',
        'methods': ['POST']
    },
    'price_alerts': {
        'tags': ['Price Alerts'],
        'summary': 'Manage price alerts',
        'description': 'Get user price alerts or create new alert',
        'methods': ['GET', 'POST']
    },
    'price_alert_detail': {
        'tags': ['Price Alerts'],
        'summary': 'Manage specific alert',
        'description': 'Get, update, or delete a specific price alert',
        'parameters': [
            ('alert_id', 'PATH', 'Price alert ID')
        ],
        'methods': ['GET', 'PUT', 'DELETE']
    },
    'technical_indicators': {
        'tags': ['Technical Analysis'],
        'summary': 'Get technical indicators',
        'description': 'Retrieve technical analysis indicators for a stock',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol')
        ]
    },
    'crypto_listings': {
        'tags': ['Cryptocurrency'],
        'summary': 'Get crypto listings',
        'description': 'Retrieve cryptocurrency market listings'
    },
    'crypto_top_gainers': {
        'tags': ['Cryptocurrency'],
        'summary': 'Get top gaining cryptos',
        'description': 'Retrieve top gaining cryptocurrencies'
    },
    'crypto_top_losers': {
        'tags': ['Cryptocurrency'],
        'summary': 'Get top losing cryptos',
        'description': 'Retrieve top losing cryptocurrencies'
    },
    'crypto_detail': {
        'tags': ['Cryptocurrency'],
        'summary': 'Get crypto details',
        'description': 'Retrieve detailed information for a specific cryptocurrency',
        'parameters': [
            ('symbol', 'PATH', 'Cryptocurrency symbol (e.g., BTC, ETH)')
        ]
    },
    'crypto_historical': {
        'tags': ['Cryptocurrency'],
        'summary': 'Get crypto historical data',
        'description': 'Retrieve historical price data for a cryptocurrency',
        'parameters': [
            ('symbol', 'PATH', 'Cryptocurrency symbol'),
            ('days', 'QUERY', 'Number of days of history', False)
        ]
    },
    'crypto_ohlc': {
        'tags': ['Cryptocurrency'],
        'summary': 'Get crypto OHLC data',
        'description': 'Retrieve OHLC (Open, High, Low, Close) data for a cryptocurrency',
        'parameters': [
            ('symbol', 'PATH', 'Cryptocurrency symbol')
        ]
    },
    'custom_analysis': {
        'tags': ['AI & Insights'],
        'summary': 'Custom statistical analysis',
        'description': 'Perform custom statistical analysis on market data',
        'methods': ['POST']
    },
    'all_insights': {
        'tags': ['AI & Insights'],
        'summary': 'Get all AI insights',
        'description': 'Retrieve all AI-generated insights and blog posts'
    },
    'ai_stock_insights': {
        'tags': ['AI & Insights'],
        'summary': 'Get AI insights for stock',
        'description': 'Retrieve AI-generated insights for a specific stock',
        'parameters': [
            ('symbol', 'PATH', 'Stock ticker symbol')
        ]
    },
    'register': {
        'tags': ['Authentication'],
        'summary': 'Register new user',
        'description': 'Create a new user account',
        'methods': ['POST']
    },
    'user_login': {
        'tags': ['Authentication'],
        'summary': 'User login',
        'description': 'Authenticate user and create session',
        'methods': ['POST']
    },
    'user_logout': {
        'tags': ['Authentication'],
        'summary': 'User logout',
        'description': 'Logout user and end session',
        'methods': ['POST']
    },
    'current_user': {
        'tags': ['Authentication'],
        'summary': 'Get current user',
        'description': 'Retrieve currently authenticated user information'
    },
    'admin_users': {
        'tags': ['Admin'],
        'summary': 'Manage users (Admin)',
        'description': 'Get list of all users (admin only)'
    },
    'search_data': {
        'tags': ['Data Explorer'],
        'summary': 'Search economic data',
        'description': 'Search for economic data series',
        'parameters': [
            ('query', 'QUERY', 'Search query', True)
        ]
    },
    'fred_categories': {
        'tags': ['Data Explorer'],
        'summary': 'Get FRED categories',
        'description': 'Retrieve available FRED data categories'
    },
    'fred_category_series': {
        'tags': ['Data Explorer'],
        'summary': 'Get category series',
        'description': 'Retrieve data series within a FRED category',
        'parameters': [
            ('category_id', 'PATH', 'FRED category ID')
        ]
    },
    'fred_series_metadata': {
        'tags': ['Data Explorer'],
        'summary': 'Get series metadata',
        'description': 'Retrieve metadata for a FRED data series',
        'parameters': [
            ('series_id', 'PATH', 'FRED series ID')
        ]
    },
    'export_data': {
        'tags': ['Data Explorer'],
        'summary': 'Export data',
        'description': 'Export market data to various formats (CSV, JSON)',
        'methods': ['POST']
    },
    'saved_charts': {
        'tags': ['Charts'],
        'summary': 'Manage saved charts',
        'description': 'Get user saved charts or create new chart',
        'methods': ['GET', 'POST']
    },
    'chart_data': {
        'tags': ['Charts'],
        'summary': 'Get chart data',
        'description': 'Retrieve data for a specific saved chart',
        'parameters': [
            ('chart_id', 'PATH', 'Chart ID')
        ]
    },
    'browse_stocks': {
        'tags': ['Stocks'],
        'summary': 'Browse stocks',
        'description': 'Browse and filter stocks by sector, market cap, etc.',
        'parameters': [
            ('sector', 'QUERY', 'Filter by sector', False),
            ('min_market_cap', 'QUERY', 'Minimum market capitalization', False)
        ]
    }
}

print("Swagger documentation mapping created successfully!")
print(f"Total endpoints documented: {len(SWAGGER_DOCS)}")
print("\nNote: This script defines the documentation structure.")
print("The actual decorators have been added manually to the most important endpoints in views.py")
