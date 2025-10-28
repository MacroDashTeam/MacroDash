from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import json
import random
from .services import FREDService, YahooFinanceService, AlphaVantageService, OpenAIService, TechnicalIndicatorService, CoinMarketCapService, CoinGeckoService
from .models import PriceAlert
from django.core.mail import send_mail
from django.conf import settings


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
