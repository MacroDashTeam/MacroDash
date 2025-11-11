from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import json
import random
from .services import FREDService, YahooFinanceService, AlphaVantageService, OpenAIService, TechnicalIndicatorService, CoinMarketCapService, CoinGeckoService, StatsmodelsService
from .models import PriceAlert
from django.core.mail import send_mail
from django.conf import settings
from django.db import connection
import os


@csrf_exempt
def health_check(request):
    """Health check endpoint to debug database configuration"""
    try:
        db_config = settings.DATABASES['default']
        db_info = {
            'database_engine': db_config['ENGINE'],
            'database_name': db_config.get('NAME', 'N/A'),
            'database_host': db_config.get('HOST', 'N/A'),
            'database_url_set': 'Yes' if os.getenv('DATABASE_URL') else 'No',
        }

        # Check if we can connect and list tables
        with connection.cursor() as cursor:
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'" if 'postgresql' in db_config['ENGINE'] else "SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]

        return JsonResponse({
            'status': 'healthy',
            'database': db_info,
            'tables_count': len(tables),
            'has_auth_user': 'auth_user' in tables,
            'tables': tables[:20],  # First 20 tables
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'error': str(e),
            'database': db_info if 'db_info' in locals() else 'Could not get DB info'
        }, status=500)


@csrf_exempt
def economic_data(request):
    """Real economic data from FRED API"""
    if request.method == 'GET':
        fred_service = FREDService()
        data = fred_service.get_economic_indicators()
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def economic_indicator_detail(request, series_id):
    """Get detailed historical data for a single economic indicator"""
    if request.method == 'GET':
        fred_service = FREDService()
        data = fred_service.get_single_indicator(series_id.upper())
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stocks_list(request):
    """Real market data from Yahoo Finance"""
    if request.method == 'GET':
        yahoo_service = YahooFinanceService()
        data = yahoo_service.get_market_data()
        return JsonResponse(data)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stock_detail(request, symbol):
    """Real individual stock details with historical data"""
    if request.method == 'GET':
        yahoo_service = YahooFinanceService()
        data = yahoo_service.get_stock_detail(symbol)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stocks_intraday(request):
    """Real-time intraday market data for major indices"""
    if request.method == 'GET':
        yahoo_service = YahooFinanceService()
        data = yahoo_service.get_intraday_data()
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stock_news(request, symbol):
    """Mock financial news for a specific stock"""
    if request.method == 'GET':
        mock_news = {
            "status": "success",
            "data": {
                "symbol": symbol.upper(),
                "news": [
                    {
                        "headline": f"{symbol.upper()} Reports Strong Q4 Earnings Beat",
                        "summary": f"{symbol.upper()} exceeded analyst expectations with strong revenue growth and improved margins.",
                        "source": "Financial News Network",
                        "published_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                        "url": f"https://example.com/news/{symbol.lower()}-earnings",
                        "sentiment": "positive"
                    },
                    {
                        "headline": f"Analysts Upgrade {symbol.upper()} Price Target",
                        "summary": f"Several Wall Street analysts have raised their price targets for {symbol.upper()} following recent developments.",
                        "source": "Market Watch",
                        "published_at": (datetime.now() - timedelta(hours=6)).isoformat(),
                        "url": f"https://example.com/news/{symbol.lower()}-upgrade",
                        "sentiment": "positive"
                    },
                    {
                        "headline": f"{symbol.upper()} Faces Supply Chain Challenges",
                        "summary": f"{symbol.upper()} management discusses ongoing supply chain issues in latest investor call.",
                        "source": "Business Today",
                        "published_at": (datetime.now() - timedelta(hours=12)).isoformat(),
                        "url": f"https://example.com/news/{symbol.lower()}-supply-chain",
                        "sentiment": "neutral"
                    },
                    {
                        "headline": f"New Product Launch Drives {symbol.upper()} Innovation",
                        "summary": f"{symbol.upper()} unveils new product line expected to boost revenue in upcoming quarters.",
                        "source": "Tech Tribune",
                        "published_at": (datetime.now() - timedelta(days=1)).isoformat(),
                        "url": f"https://example.com/news/{symbol.lower()}-product-launch",
                        "sentiment": "positive"
                    }
                ]
            },
            "timestamp": datetime.now().isoformat()
        }
        return JsonResponse(mock_news)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def dashboard_config(request):
    """Mock dashboard configuration"""
    if request.method == 'GET':
        mock_config = {
            "status": "success",
            "data": {
                "user_id": "user123",
                "dashboard_layout": {
                    "economic_indicators": {
                        "enabled": True,
                        "position": {"x": 0, "y": 0, "width": 6, "height": 4},
                        "indicators": ["gdp", "unemployment_rate", "federal_funds_rate", "inflation_rate"]
                    },
                    "top_stocks": {
                        "enabled": True,
                        "position": {"x": 6, "y": 0, "width": 6, "height": 4},
                        "count": 5
                    },
                    "watchlist": {
                        "enabled": True,
                        "position": {"x": 0, "y": 4, "width": 8, "height": 3},
                        "stocks": ["AAPL", "MSFT", "GOOGL", "AMZN"]
                    },
                    "news_feed": {
                        "enabled": True,
                        "position": {"x": 8, "y": 4, "width": 4, "height": 3},
                        "sources": ["Financial News Network", "Market Watch", "Business Today"]
                    }
                },
                "preferences": {
                    "theme": "light",
                    "refresh_interval": 30,
                    "currency": "USD",
                    "timezone": "EST"
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        return JsonResponse(mock_config)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            # In a real app, we would save this to the database
            response = {
                "status": "success",
                "message": "Dashboard configuration updated",
                "data": data
            }
            return JsonResponse(response)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def sentiment_analysis(request, symbol):
    """Mock LLM-powered sentiment analysis"""
    if request.method == 'GET':
        sentiments = ["positive", "negative", "neutral"]
        overall_sentiment = random.choice(sentiments)

        mock_sentiment = {
            "status": "success",
            "data": {
                "symbol": symbol.upper(),
                "overall_sentiment": overall_sentiment,
                "sentiment_score": round(random.uniform(-1, 1), 3),
                "confidence": round(random.uniform(0.6, 0.95), 3),
                "analysis": {
                    "positive_factors": [
                        "Strong earnings growth",
                        "Market expansion opportunities",
                        "Positive analyst coverage"
                    ],
                    "negative_factors": [
                        "Supply chain concerns",
                        "Regulatory challenges",
                        "Increased competition"
                    ],
                    "key_themes": [
                        "Innovation",
                        "Market position",
                        "Financial health"
                    ]
                },
                "sources_analyzed": 15,
                "time_period": "last_7_days",
                "summary": f"Based on analysis of recent news and social media, {symbol.upper()} shows {overall_sentiment} sentiment with moderate confidence. Key factors include earnings performance and market conditions.",
                "disclaimer": "This analysis is for informational purposes only and should not be considered as financial advice."
            },
            "timestamp": datetime.now().isoformat()
        }
        return JsonResponse(mock_sentiment)

    return JsonResponse({"error": "Method not allowed"}, status=405)


# Alpha Vantage API endpoints
@csrf_exempt
def alpha_vantage_quote(request, symbol):
    """Get real-time quote from Alpha Vantage"""
    if request.method == 'GET':
        av_service = AlphaVantageService()
        data = av_service.get_quote(symbol)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def alpha_vantage_intraday(request, symbol):
    """Get intraday time series data from Alpha Vantage"""
    if request.method == 'GET':
        interval = request.GET.get('interval', '5min')
        av_service = AlphaVantageService()
        data = av_service.get_intraday(symbol, interval)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def alpha_vantage_daily(request, symbol):
    """Get daily time series data from Alpha Vantage"""
    if request.method == 'GET':
        outputsize = request.GET.get('outputsize', 'compact')
        av_service = AlphaVantageService()
        data = av_service.get_daily(symbol, outputsize)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def alpha_vantage_overview(request, symbol):
    """Get company overview from Alpha Vantage"""
    if request.method == 'GET':
        av_service = AlphaVantageService()
        data = av_service.get_company_overview(symbol)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def alpha_vantage_news(request):
    """Get news and sentiment data from Alpha Vantage"""
    if request.method == 'GET':
        tickers = request.GET.get('tickers', None)
        topics = request.GET.get('topics', None)
        limit = int(request.GET.get('limit', 50))

        av_service = AlphaVantageService()
        data = av_service.get_news_sentiment(tickers=tickers, topics=topics, limit=limit)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def company_financials(request, symbol):
    """Get company financial statements from Yahoo Finance (with Alpha Vantage backup)"""
    if request.method == 'GET':
        statement_type = request.GET.get('type', 'income')  # income, balance, cashflow

        if statement_type not in ['income', 'balance', 'cashflow']:
            return JsonResponse({"error": "Invalid statement type. Use 'income', 'balance', or 'cashflow'"}, status=400)

        # Try Yahoo Finance first, fallback to Alpha Vantage
        yahoo_service = YahooFinanceService()
        data = yahoo_service.get_financials(symbol, statement_type)

        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def company_earnings(request, symbol):
    """Get company earnings data with analyst estimates from Alpha Vantage"""
    if request.method == 'GET':
        av_service = AlphaVantageService()
        data = av_service.get_earnings(symbol)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def analyst_recommendations(request, symbol):
    """Get analyst recommendations and price targets from Yahoo Finance"""
    if request.method == 'GET':
        yahoo_service = YahooFinanceService()
        data = yahoo_service.get_analyst_recommendations(symbol)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stock_insights(request, symbol):
    """Generate AI-powered insights for a stock based on news sentiment"""
    if request.method == 'GET':
        # First get the news for this stock
        av_service = AlphaVantageService()
        news_data = av_service.get_news_sentiment(tickers=symbol, limit=20)

        if news_data.get('status') == 'success' and news_data.get('data', {}).get('feed'):
            # Generate insights using OpenAI
            openai_service = OpenAIService()
            insights = openai_service.generate_stock_insights(symbol, news_data['data']['feed'])
            return JsonResponse(insights)
        else:
            # Return mock insights if no news available
            openai_service = OpenAIService()
            return JsonResponse(openai_service._get_mock_insights(symbol))

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def browse_stocks(request):
    """Browse stocks by market cap category or sector"""
    if request.method == 'GET':
        category = request.GET.get('category', None)
        sector = request.GET.get('sector', None)

        yahoo_service = YahooFinanceService()
        data = yahoo_service.browse_stocks(category=category, sector=sector)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def company_overview_yahoo(request, symbol):
    """Get company overview from Yahoo Finance"""
    if request.method == 'GET':
        yahoo_service = YahooFinanceService()
        data = yahoo_service.get_company_info(symbol)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def chatbot(request):
    """AI-powered chatbot for stock analysis using context"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            question = data.get('question', '')
            context = data.get('context', {})

            if not question:
                return JsonResponse({"error": "Question is required"}, status=400)

            # Use OpenAI service to generate response
            openai_service = OpenAIService()
            response = openai_service.chat_with_context(question, context)

            return JsonResponse(response)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            print(f"Chatbot error: {e}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)

# Price Alert endpoints
@csrf_exempt
def price_alerts(request):
    """Manage price alerts - create and list"""
    if request.method == 'GET':
        # List all alerts for an email
        email = request.GET.get('email')
        if not email:
            return JsonResponse({"error": "Email parameter required"}, status=400)
        
        alerts = PriceAlert.objects.filter(email=email).order_by('-created_at')
        
        alerts_data = [{
            'id': alert.id,
            'symbol': alert.symbol,
            'stock_name': alert.stock_name,
            'target_price': str(alert.target_price),
            'condition': alert.condition,
            'status': alert.status,
            'created_at': alert.created_at.isoformat(),
            'triggered_at': alert.triggered_at.isoformat() if alert.triggered_at else None,
            'current_price_at_trigger': str(alert.current_price_at_trigger) if alert.current_price_at_trigger else None,
            'notes': alert.notes
        } for alert in alerts]
        
        return JsonResponse({
            'status': 'success',
            'data': alerts_data,
            'timestamp': datetime.now().isoformat()
        })
    
    elif request.method == 'POST':
        # Create new alert
        try:
            data = json.loads(request.body)
            
            required_fields = ['symbol', 'target_price', 'condition', 'email']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({"error": f"Missing required field: {field}"}, status=400)
            
            alert = PriceAlert.objects.create(
                symbol=data['symbol'].upper(),
                stock_name=data.get('stock_name', ''),
                target_price=data['target_price'],
                condition=data['condition'],
                email=data['email'],
                notes=data.get('notes', '')
            )
            
            return JsonResponse({
                'status': 'success',
                'message': 'Alert created successfully',
                'data': {
                    'id': alert.id,
                    'symbol': alert.symbol,
                    'target_price': str(alert.target_price),
                    'condition': alert.condition
                },
                'timestamp': datetime.now().isoformat()
            })
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def price_alert_detail(request, alert_id):
    """Get, update, or delete a specific alert"""
    try:
        alert = PriceAlert.objects.get(id=alert_id)
    except PriceAlert.DoesNotExist:
        return JsonResponse({"error": "Alert not found"}, status=404)
    
    if request.method == 'GET':
        return JsonResponse({
            'status': 'success',
            'data': {
                'id': alert.id,
                'symbol': alert.symbol,
                'stock_name': alert.stock_name,
                'target_price': str(alert.target_price),
                'condition': alert.condition,
                'email': alert.email,
                'status': alert.status,
                'created_at': alert.created_at.isoformat(),
                'triggered_at': alert.triggered_at.isoformat() if alert.triggered_at else None,
                'notes': alert.notes
            },
            'timestamp': datetime.now().isoformat()
        })
    
    elif request.method == 'DELETE':
        alert.status = 'cancelled'
        alert.save()
        return JsonResponse({
            'status': 'success',
            'message': 'Alert cancelled successfully',
            'timestamp': datetime.now().isoformat()
        })
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def technical_indicators(request, symbol):
    """Get technical indicators (RSI, MACD, Bollinger Bands, SMA, EMA) for a stock"""
    if request.method == 'GET':
        period = request.GET.get('period', '1y')  # Default to 1 year

        # Validate period
        valid_periods = ['1mo', '3mo', '6mo', '1y', '2y', '5y']
        if period not in valid_periods:
            return JsonResponse({
                "error": f"Invalid period. Use one of: {', '.join(valid_periods)}"
            }, status=400)

        ti_service = TechnicalIndicatorService()
        data = ti_service.get_technical_indicators(symbol, period)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


# Cryptocurrency endpoints
@csrf_exempt
def crypto_listings(request):
    """Get list of cryptocurrencies with market data from CoinMarketCap"""
    if request.method == 'GET':
        limit = int(request.GET.get('limit', 100))

        cmc_service = CoinMarketCapService()
        data = cmc_service.get_crypto_listings(limit=limit)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def crypto_detail(request, symbol):
    """Get detailed information for a specific cryptocurrency"""
    if request.method == 'GET':
        cmc_service = CoinMarketCapService()
        data = cmc_service.get_crypto_detail(symbol)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def crypto_top_gainers(request):
    """Get top gaining cryptocurrencies in the last 24 hours"""
    if request.method == 'GET':
        limit = int(request.GET.get('limit', 10))

        cmc_service = CoinMarketCapService()
        data = cmc_service.get_top_gainers(limit=limit)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def crypto_top_losers(request):
    """Get top losing cryptocurrencies in the last 24 hours"""
    if request.method == 'GET':
        limit = int(request.GET.get('limit', 10))

        cmc_service = CoinMarketCapService()
        data = cmc_service.get_top_losers(limit=limit)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def crypto_historical(request, symbol):
    """Get historical price data for a cryptocurrency"""
    if request.method == 'GET':
        days = int(request.GET.get('days', 7))

        # Validate days parameter
        valid_days = [1, 7, 30, 90, 180, 365]
        if days not in valid_days:
            return JsonResponse({
                "error": f"Invalid days parameter. Use one of: {', '.join(map(str, valid_days))}"
            }, status=400)

        coingecko_service = CoinGeckoService()
        data = coingecko_service.get_historical_data(symbol, days=days)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def crypto_ohlc(request, symbol):
    """Get OHLC candlestick data for a cryptocurrency"""
    if request.method == 'GET':
        days = int(request.GET.get('days', 7))

        # Validate days parameter
        valid_days = [1, 7, 14, 30, 90, 180, 365]
        if days not in valid_days:
            return JsonResponse({
                "error": f"Invalid days parameter. Use one of: {', '.join(map(str, valid_days))}"
            }, status=400)

        coingecko_service = CoinGeckoService()
        data = coingecko_service.get_ohlc_data(symbol, days=days)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def custom_analysis(request):
    """Evaluate custom formulas with stock data"""
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            symbols = body.get('symbols', [])
            formulas = body.get('formulas', [])
            period = body.get('period', '1y')

            if not symbols:
                return JsonResponse({
                    "status": "error",
                    "error": "At least one stock symbol is required"
                }, status=400)

            if not formulas:
                return JsonResponse({
                    "status": "error",
                    "error": "At least one formula is required"
                }, status=400)

            # Fetch stock data for all symbols
            stats_service = StatsmodelsService()
            stock_data = {}

            for symbol in symbols:
                price_data = stats_service.get_price_data(symbol, period=period)
                if price_data.get('status') == 'success':
                    stock_data[symbol] = price_data.get('data', {})
                else:
                    return JsonResponse({
                        "status": "error",
                        "error": f"Failed to fetch data for {symbol}: {price_data.get('error')}"
                    }, status=400)

            # Evaluate formulas
            results = stats_service.evaluate_formulas(formulas, stock_data)

            return JsonResponse(results)

        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "error": "Invalid JSON in request body"
            }, status=400)
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "error": str(e)
            }, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def ai_stock_insights(request, symbol):
    """Get AI-generated blog/event insights for a specific stock"""
    if request.method == 'GET':
        from .models import StockInsight

        # Get query parameters
        sentiment = request.GET.get('sentiment', None)  # Optional filter by sentiment
        limit = int(request.GET.get('limit', 10))

        # Build query
        query = StockInsight.objects.filter(symbol=symbol.upper(), is_active=True)

        if sentiment:
            query = query.filter(sentiment=sentiment)

        # Get insights ordered by published date
        insights = query[:limit]

        # Format response
        data = [{
            'id': insight.id,
            'title': insight.title,
            'summary': insight.summary,
            'source': insight.source,
            'url': insight.url,
            'content_type': insight.content_type,
            'sentiment': insight.sentiment,
            'sentiment_score': insight.sentiment_score,
            'key_points': insight.key_points,
            'ai_analysis': insight.ai_analysis,
            'published_date': insight.published_date.isoformat() if insight.published_date else None,
            'fetched_at': insight.fetched_at.isoformat(),
        } for insight in insights]

        return JsonResponse({
            'status': 'success',
            'symbol': symbol.upper(),
            'count': len(data),
            'insights': data
        })

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def all_insights(request):
    """Get recent AI-generated insights across all stocks"""
    if request.method == 'GET':
        from .models import StockInsight

        # Get query parameters
        sentiment = request.GET.get('sentiment', None)
        content_type = request.GET.get('type', None)
        limit = int(request.GET.get('limit', 20))

        # Build query
        query = StockInsight.objects.filter(is_active=True)

        if sentiment:
            query = query.filter(sentiment=sentiment)

        if content_type:
            query = query.filter(content_type=content_type)

        # Get insights ordered by published date
        insights = query[:limit]

        # Format response
        data = [{
            'id': insight.id,
            'symbol': insight.symbol,
            'stock_name': insight.stock_name,
            'title': insight.title,
            'summary': insight.summary,
            'source': insight.source,
            'url': insight.url,
            'content_type': insight.content_type,
            'sentiment': insight.sentiment,
            'sentiment_score': insight.sentiment_score,
            'key_points': insight.key_points,
            'ai_analysis': insight.ai_analysis,
            'published_date': insight.published_date.isoformat() if insight.published_date else None,
            'fetched_at': insight.fetched_at.isoformat(),
        } for insight in insights]

        return JsonResponse({
            'status': 'success',
            'count': len(data),
            'insights': data
        })

    return JsonResponse({"error": "Method not allowed"}, status=405)


# ==================== USER AUTHENTICATION ENDPOINTS ====================

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Watchlist, WatchlistItem, UserPreferences
import json


@csrf_exempt
def register(request):
    """Register a new user"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            # Validation
            if not username or not email or not password:
                return JsonResponse({'status': 'error', 'error': 'Missing required fields'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'status': 'error', 'error': 'Username already exists'}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({'status': 'error', 'error': 'Email already exists'}, status=400)

            # Create user
            user = User.objects.create_user(username=username, email=email, password=password)

            # Create default watchlist
            Watchlist.objects.create(user=user, name='My Watchlist', is_default=True)

            # Create user preferences
            UserPreferences.objects.create(user=user)

            # Log the user in
            login(request, user)

            # Get user preferences to check admin status
            preferences = UserPreferences.objects.get(user=user)

            return JsonResponse({
                'status': 'success',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_admin': preferences.is_admin
                }
            })

        except Exception as e:
            return JsonResponse({'status': 'error', 'error': str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def user_login(request):
    """Login user"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)

                # Get user preferences to check admin status
                try:
                    preferences = UserPreferences.objects.get(user=user)
                    is_admin = preferences.is_admin
                except UserPreferences.DoesNotExist:
                    # Create preferences if they don't exist
                    preferences = UserPreferences.objects.create(user=user)
                    is_admin = False

                return JsonResponse({
                    'status': 'success',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'is_admin': is_admin
                    }
                })
            else:
                return JsonResponse({'status': 'error', 'error': 'Invalid credentials'}, status=401)

        except Exception as e:
            return JsonResponse({'status': 'error', 'error': str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def user_logout(request):
    """Logout user"""
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'status': 'success'})

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def current_user(request):
    """Get current logged-in user"""
    if request.method == 'GET':
        if request.user.is_authenticated:
            # Get user preferences to check admin status
            try:
                preferences = UserPreferences.objects.get(user=request.user)
                is_admin = preferences.is_admin
            except UserPreferences.DoesNotExist:
                is_admin = False

            return JsonResponse({
                'status': 'success',
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'is_admin': is_admin
                }
            })
        else:
            return JsonResponse({'status': 'error', 'error': 'Not authenticated'}, status=401)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def admin_users(request):
    """Admin-only endpoint to manage users"""
    if request.method == 'GET':
        # Check if user is authenticated and is admin
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'error': 'Not authenticated'}, status=401)

        try:
            preferences = UserPreferences.objects.get(user=request.user)
            if not preferences.is_admin:
                return JsonResponse({'status': 'error', 'error': 'Admin access required'}, status=403)
        except UserPreferences.DoesNotExist:
            return JsonResponse({'status': 'error', 'error': 'Admin access required'}, status=403)

        # Get all users with their admin status
        users = []
        for user in User.objects.all().order_by('-date_joined'):
            try:
                user_prefs = UserPreferences.objects.get(user=user)
                is_admin = user_prefs.is_admin
            except UserPreferences.DoesNotExist:
                is_admin = False

            users.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': is_admin,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None
            })

        return JsonResponse({'status': 'success', 'users': users})

    elif request.method == 'PUT':
        # Update user admin status
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'error': 'Not authenticated'}, status=401)

        try:
            preferences = UserPreferences.objects.get(user=request.user)
            if not preferences.is_admin:
                return JsonResponse({'status': 'error', 'error': 'Admin access required'}, status=403)
        except UserPreferences.DoesNotExist:
            return JsonResponse({'status': 'error', 'error': 'Admin access required'}, status=403)

        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            is_admin = data.get('is_admin')

            if user_id is None or is_admin is None:
                return JsonResponse({'status': 'error', 'error': 'Missing user_id or is_admin'}, status=400)

            target_user = User.objects.get(id=user_id)
            user_prefs, created = UserPreferences.objects.get_or_create(user=target_user)
            user_prefs.is_admin = is_admin
            user_prefs.save()

            return JsonResponse({'status': 'success', 'message': f'User {target_user.username} admin status updated'})

        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'error': str(e)}, status=500)

    elif request.method == 'DELETE':
        # Delete user (admin only)
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'error': 'Not authenticated'}, status=401)

        try:
            preferences = UserPreferences.objects.get(user=request.user)
            if not preferences.is_admin:
                return JsonResponse({'status': 'error', 'error': 'Admin access required'}, status=403)
        except UserPreferences.DoesNotExist:
            return JsonResponse({'status': 'error', 'error': 'Admin access required'}, status=403)

        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')

            if user_id is None:
                return JsonResponse({'status': 'error', 'error': 'Missing user_id'}, status=400)

            # Prevent admin from deleting themselves
            if user_id == request.user.id:
                return JsonResponse({'status': 'error', 'error': 'Cannot delete your own account'}, status=400)

            target_user = User.objects.get(id=user_id)
            username = target_user.username
            target_user.delete()

            return JsonResponse({'status': 'success', 'message': f'User {username} deleted successfully'})

        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'error': str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)


# ========== Data Explorer Endpoints ==========

@csrf_exempt
def search_data(request):
    """Universal search across FRED and Alpha Vantage"""
    if request.method == 'GET':
        query = request.GET.get('q', '')

        if not query:
            return JsonResponse({
                'status': 'error',
                'message': 'Query parameter "q" is required'
            }, status=400)

        fred_service = FREDService()
        data = fred_service.search_combined(query)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def fred_categories(request):
    """Browse FRED data categories"""
    if request.method == 'GET':
        parent_id = request.GET.get('parent', 0)

        try:
            parent_id = int(parent_id)
        except ValueError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid parent_id parameter'
            }, status=400)

        fred_service = FREDService()
        data = fred_service.get_fred_categories(parent_id)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def fred_category_series(request, category_id):
    """Get all series in a FRED category"""
    if request.method == 'GET':
        try:
            category_id = int(category_id)
        except ValueError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid category_id'
            }, status=400)

        limit = request.GET.get('limit', 100)
        try:
            limit = int(limit)
        except ValueError:
            limit = 100

        fred_service = FREDService()
        data = fred_service.get_series_in_category(category_id, limit)
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def fred_series_metadata(request, series_id):
    """Get metadata for a specific FRED series"""
    if request.method == 'GET':
        fred_service = FREDService()
        data = fred_service.get_series_metadata(series_id.upper())
        return JsonResponse(data)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def export_data(request):
    """Export selected FRED series to JSON"""
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            series_ids = body.get('series_ids', [])
            filename = body.get('filename', None)

            if not series_ids:
                return JsonResponse({
                    'status': 'error',
                    'message': 'series_ids parameter is required'
                }, status=400)

            fred_service = FREDService()
            data = fred_service.export_multiple_series(series_ids, filename)
            return JsonResponse(data)

        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON in request body'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def saved_charts(request):
    """Get, create, or delete saved chart displays"""
    from api.models import SavedChartDisplay

    # Get session ID from cookies or generate one
    session_id = request.COOKIES.get('session_id', f"anon_{datetime.now().timestamp()}")

    if request.method == 'GET':
        # Get all saved charts for this session
        try:
            charts = SavedChartDisplay.objects.filter(user_session=session_id)
            charts_data = [{
                'id': chart.id,
                'chart_name': chart.chart_name,
                'series_ids': chart.series_ids,
                'series_metadata': chart.series_metadata,
                'chart_type': chart.chart_type,
                'show_legend': chart.show_legend,
                'created_at': chart.created_at.isoformat(),
                'updated_at': chart.updated_at.isoformat(),
            } for chart in charts]

            response = JsonResponse({
                'status': 'success',
                'data': charts_data,
                'timestamp': datetime.now().isoformat()
            })
            response.set_cookie(
                'session_id',
                session_id,
                max_age=31536000,  # 1 year
                samesite='Lax',    # Allow same-site cross-origin (localhost to localhost)
                secure=False,      # Set to True in production with HTTPS
                httponly=False     # Allow JavaScript access if needed
            )
            return response

        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)

    elif request.method == 'POST':
        # Create new saved chart
        try:
            body = json.loads(request.body)
            chart_name = body.get('chart_name')
            series_ids = body.get('series_ids', [])
            series_metadata = body.get('series_metadata', {})
            source_type = body.get('source_type', 'fred')
            formulas = body.get('formulas')
            symbols = body.get('symbols')

            if not chart_name or not series_ids:
                return JsonResponse({
                    'status': 'error',
                    'message': 'chart_name and series_ids are required'
                }, status=400)

            chart = SavedChartDisplay.objects.create(
                user_session=session_id,
                chart_name=chart_name,
                series_ids=series_ids,
                series_metadata=series_metadata,
                source_type=source_type,
                formulas=formulas,
                symbols=symbols
            )

            response = JsonResponse({
                'status': 'success',
                'data': {
                    'id': chart.id,
                    'chart_name': chart.chart_name,
                    'series_ids': chart.series_ids,
                    'series_metadata': chart.series_metadata,
                    'source_type': chart.source_type
                },
                'message': 'Chart saved successfully',
                'timestamp': datetime.now().isoformat()
            })
            response.set_cookie(
                'session_id',
                session_id,
                max_age=31536000,  # 1 year
                samesite='Lax',    # Allow same-site cross-origin (localhost to localhost)
                secure=False,      # Set to True in production with HTTPS
                httponly=False     # Allow JavaScript access if needed
            )
            return response

        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON in request body'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)

    elif request.method == 'DELETE':
        # Delete a saved chart
        try:
            body = json.loads(request.body)
            chart_id = body.get('chart_id')

            if not chart_id:
                return JsonResponse({
                    'status': 'error',
                    'message': 'chart_id is required'
                }, status=400)

            chart = SavedChartDisplay.objects.filter(
                id=chart_id,
                user_session=session_id
            ).first()

            if not chart:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Chart not found or access denied'
                }, status=404)

            chart.delete()

            return JsonResponse({
                'status': 'success',
                'message': 'Chart deleted successfully',
                'timestamp': datetime.now().isoformat()
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON in request body'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def chart_data(request, chart_id):
    """Get full data for a saved chart including series data"""
    from api.models import SavedChartDisplay
    from api.services import FREDService, StatsmodelsService

    session_id = request.COOKIES.get('session_id')

    if request.method == 'GET':
        try:
            chart = SavedChartDisplay.objects.filter(
                id=chart_id,
                user_session=session_id
            ).first()

            if not chart:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Chart not found or access denied'
                }, status=404)

            chart_data = []

            # Check if this is a custom analysis chart
            if chart.source_type == 'custom_analysis':
                # Re-execute custom analysis formulas for real-time data
                if not chart.formulas or not chart.symbols:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Custom analysis chart missing formulas or symbols'
                    }, status=400)

                stats_service = StatsmodelsService()
                stock_data = {}

                # Fetch stock data for all symbols
                for symbol in chart.symbols:
                    price_data = stats_service.get_price_data(symbol, period='1y')
                    if price_data.get('status') == 'success':
                        stock_data[symbol] = price_data.get('data', {})
                    else:
                        return JsonResponse({
                            'status': 'error',
                            'message': f"Failed to fetch data for {symbol}"
                        }, status=400)

                # Evaluate formulas
                results = stats_service.evaluate_formulas(chart.formulas, stock_data)

                if results.get('status') == 'success':
                    # Transform data from dict format to array format for Recharts
                    results_dict = results.get('data', {})

                    # Get dates from the first series
                    dates = []
                    for series_data in results_dict.values():
                        if 'dates' in series_data and series_data['dates']:
                            dates = series_data['dates']
                            break

                    # Build chart data array
                    chart_data = []
                    for i, date in enumerate(dates):
                        data_point = {'date': date}
                        for series_id, series_data in results_dict.items():
                            if 'series' in series_data and i < len(series_data['series']):
                                data_point[series_id] = series_data['series'][i]
                        chart_data.append(data_point)
                else:
                    return JsonResponse({
                        'status': 'error',
                        'message': results.get('error', 'Failed to evaluate formulas')
                    }, status=500)

            elif chart.source_type == 'crypto':
                # Fetch crypto historical data
                if not chart.symbols or len(chart.symbols) == 0:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Crypto chart missing symbols'
                    }, status=400)

                import requests

                # Mapping of crypto symbols to CoinGecko IDs
                symbol_to_coingecko = {
                    'BTC': 'bitcoin',
                    'ETH': 'ethereum',
                    'BNB': 'binancecoin',
                    'SOL': 'solana',
                    'XRP': 'ripple',
                    'ADA': 'cardano',
                    'DOGE': 'dogecoin',
                    'AVAX': 'avalanche-2',
                    'DOT': 'polkadot',
                    'MATIC': 'matic-network',
                    'LINK': 'chainlink',
                    'UNI': 'uniswap',
                    'ATOM': 'cosmos',
                }

                # Fetch historical data for each crypto (1 year of daily data)
                for symbol in chart.symbols:
                    try:
                        # Convert symbol to CoinGecko ID
                        coin_id = symbol_to_coingecko.get(symbol.upper(), symbol.lower())

                        # Use CoinGecko API for historical crypto data (free, no API key)
                        url = f'https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart'
                        params = {
                            'vs_currency': 'usd',
                            'days': '365',  # 1 year of data
                            'interval': 'daily'
                        }

                        response = requests.get(url, params=params, timeout=10)
                        if response.status_code == 200:
                            data = response.json()
                            prices = data.get('prices', [])

                            # Convert timestamps and prices to chart format
                            for timestamp_ms, price in prices:
                                date_str = datetime.fromtimestamp(timestamp_ms / 1000).strftime('%Y-%m-%d')

                                # Find or create data point for this date
                                existing_point = next((p for p in chart_data if p['date'] == date_str), None)
                                if existing_point:
                                    existing_point[symbol] = price
                                else:
                                    chart_data.append({'date': date_str, symbol: price})
                        else:
                            print(f"Error fetching crypto data for {symbol}: {response.status_code}")
                    except Exception as e:
                        print(f"Error fetching crypto {symbol}: {e}")

                # Sort chart_data by date
                chart_data.sort(key=lambda x: x['date'])

            else:
                # FRED data - original logic
                fred_service = FREDService()
                all_series_data = {}

                # Fetch all series data
                for series_id in chart.series_ids:
                    try:
                        series = fred_service.fred.get_series(series_id)
                        all_series_data[series_id] = series
                    except Exception as e:
                        print(f"Error fetching series {series_id}: {e}")
                        all_series_data[series_id] = pd.Series()

                # Merge all series into a single DataFrame
                df = pd.DataFrame(all_series_data)

                # Convert to format suitable for Recharts: [{date, series1, series2, ...}]
                for date_idx, row in df.iterrows():
                    data_point = {
                        'date': date_idx.strftime('%Y-%m-%d')
                    }
                    # Add each series value
                    for series_id in chart.series_ids:
                        if series_id in row and pd.notna(row[series_id]):
                            data_point[series_id] = float(row[series_id])
                        else:
                            data_point[series_id] = None

                    chart_data.append(data_point)

            return JsonResponse({
                'status': 'success',
                'chart': {
                    'id': chart.id,
                    'chart_name': chart.chart_name,
                    'series_ids': chart.series_ids,
                    'series_metadata': chart.series_metadata,
                    'created_at': chart.created_at.isoformat(),
                    'last_viewed': chart.last_viewed.isoformat() if chart.last_viewed else None
                },
                'data': chart_data,
                'timestamp': datetime.now().isoformat()
            })

        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)
